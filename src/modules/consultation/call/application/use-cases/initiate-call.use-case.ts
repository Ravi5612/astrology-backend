import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CallSession,
  CallSessionStatus,
  CallType,
} from '../../infrastructure/entities/call-session.entity';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';
import { WalletFacade } from '@/modules/wallet/application/wallet.facade';
import { TwilioService } from '../../infrastructure/services/twilio.service';
import { CallGateway } from '../../call.gateway';
import { CallPolicy } from '../../domain/policies/call.policy';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CallInitiatedEvent } from '../../domain/events/call.events';
import { ProfileExpert } from '@/modules/expert/profile/infrastructure/entities/profile-expert.entity';

@Injectable()
export class InitiateCallUseCase {
  private readonly logger = new Logger(InitiateCallUseCase.name);

  constructor(
    @InjectRepository(CallSession)
    private sessionRepo: Repository<CallSession>,
    @Inject(forwardRef(() => ExpertProfileFacade))
    private expertProfileFacade: ExpertProfileFacade,
    @Inject(forwardRef(() => WalletFacade)) private walletFacade: WalletFacade,
    private twilioService: TwilioService,
    @Inject(forwardRef(() => CallGateway))
    private callGateway: CallGateway,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: string,
    expert_id: string,
    type: CallType = CallType.AUDIO,
  ) {
    // ✅ Block duplicate sessions — user can only have ONE active/pending call at a time
    const existingSession = await this.sessionRepo.findOne({
      where: [
        {
          user_id: userId as unknown as string,
          status: CallSessionStatus.ACTIVE,
        },
        {
          user_id: userId as unknown as string,
          status: CallSessionStatus.PENDING,
        },
      ],
      relations: ['user'],
    });

    if (existingSession) {
      // Same expert → return existing session so frontend can redirect/resume
      if (existingSession.expert_id === expert_id) {
        return {
          session: { ...existingSession, isResumed: true },
          token: '', // Frontend will handle resume logic
          roomName: `call_room_${existingSession.id}`,
        };
      }

      // Different expert → block completely
      throw new InternalServerErrorException(
        existingSession.status === CallSessionStatus.ACTIVE
          ? `You already have an ongoing ${existingSession.type} call with another astrologer.`
          : `You already have a pending ${existingSession.type} call request with another astrologer. Please wait for them to accept or cancel it.`,
      );
    }

    const expert = await this.expertProfileFacade.getExpertById(expert_id);

    if (!expert) {
      throw new InternalServerErrorException('Expert not found');
    }

    CallPolicy.ensureExpertExists(expert as unknown as ProfileExpert);
    CallPolicy.ensureExpertAvailable(Boolean(expert.is_available));

    const callPrice =
      type === CallType.VIDEO
        ? Number(expert.video_call_price) ||
          (Number(expert.price) ? Number(expert.price) * 2 : 0) ||
          0
        : Number(expert.call_price) || Number(expert.price) || 0;

    const minMins = 5;
    const minBalanceRequired = callPrice * minMins;

    const callCount = await this.sessionRepo.count({
      where: {
        user_id: userId as unknown as string,
        status: CallSessionStatus.COMPLETED,
      },
    });

    const isFreeEnabled = process.env.FREE_CHAT_ENABLED === 'true';
    const isEligibleForFree = isFreeEnabled && callCount === 0;
    const freeMins = isEligibleForFree
      ? parseInt(process.env.FREE_CHAT_DURATION_MINS || '5', 10)
      : 0;

    if (!isEligibleForFree) {
      const hasBalance = await this.walletFacade.validateBalance(
        userId,
        minBalanceRequired,
      );
      CallPolicy.ensureSufficientBalance(
        hasBalance,
        minMins,
        minBalanceRequired,
        type,
      );
    }

    const session = this.sessionRepo.create({
      user_id: userId,
      expert_id: expert_id,
      price_per_minute: callPrice,
      status: CallSessionStatus.PENDING,
      type: type,
      is_free: isEligibleForFree,
      free_minutes: freeMins,
    });

    const savedSession = await this.sessionRepo.save(session);
    this.logger.log(
      `Session saved: id=${savedSession.id} (is_free: ${isEligibleForFree})`,
    );

    // Reserve balance only if not free
    if (!isEligibleForFree) {
      await this.walletFacade.reserveBalance(
        userId,
        minBalanceRequired,
        `call_${savedSession.id}`,
      );
      this.logger.log(`Balance reserved for sessionId=${savedSession.id}`);
    }

    // Generate Twilio Token for the user
    const identity = `user_${userId}_${savedSession.id}`;
    const roomName = `call_room_${savedSession.id}`;

    let token: string;
    try {
      token = this.twilioService.generateToken(identity, type, roomName);
      this.logger.log(`Twilio token generated for identity=${identity}`);
    } catch (error) {
      this.logger.error('Twilio token generation failed', error);
      throw new InternalServerErrorException('Failed to generate call token');
    }

    // Fetch session with expert & user details for client
    const sessionWithDetails = await this.sessionRepo.findOne({
      where: { id: savedSession.id },
      relations: ['user'], // 'expert' is not a relation anymore, or maybe it's not defined in the entity since we separated domains?
    });

    // Attach expert manually
    if (sessionWithDetails) {
      (sessionWithDetails as unknown as { expert: typeof expert }).expert =
        expert;
    }

    if (sessionWithDetails?.user) {
      // Priority: User.avatar || ProfileClient.profile_picture
      (sessionWithDetails.user as unknown as { avatar: string }).avatar =
        sessionWithDetails.user.avatar ||
        (
          sessionWithDetails.user as unknown as {
            profile_client?: { profile_picture: string };
          }
        ).profile_client?.profile_picture ||
        '';
    }

    const result = {
      session: sessionWithDetails || savedSession,
      token,
      roomName,
    };

    this.callGateway.notifyExpertNewCall(expert_id, result);
    this.logger.log(`Expert notified of new call sessionId=${savedSession.id}`);
    this.eventEmitter.emit(
      'call.initiated',
      new CallInitiatedEvent(savedSession.id, userId, expert_id, type),
    );

    return result;
  }
}
