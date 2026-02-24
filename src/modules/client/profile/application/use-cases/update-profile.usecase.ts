import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileClient } from '../../infrastructure/persistence/entities/profile-client.entity';
import { UpdateProfileClientDto } from '../../infrastructure/persistence/dto/profile-client.dto';
import { ProfilePolicy } from '../../domain/policies/profile.policy';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProfileUpdatedEvent } from '../../domain/events/profile-events';
import { User } from '@/modules/users/infrastructure/persistence/entities/user.entity';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @InjectRepository(ProfileClient)
    private readonly repo: Repository<ProfileClient>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: number, dto: UpdateProfileClientDto) {
    const profile = await this.repo.findOne({
      where: { user: { id: userId } },
    });

    ProfilePolicy.ensureProfileExists(profile);

    const { full_name, ...profileDto } = dto as any;

    Object.assign(profile, profileDto);
    const updatedProfile = await this.repo.save(profile);

    if (full_name !== undefined) {
      await this.repo.manager.update(User, { id: userId }, { name: full_name });
      (updatedProfile as any).full_name = full_name;
    }

    this.eventEmitter.emit(
      'client.profile.updated',
      new ProfileUpdatedEvent(userId, updatedProfile.id, profileDto as any),
    );

    return updatedProfile;
  }
}
