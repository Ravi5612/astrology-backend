import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileClient } from '../../infrastructure/persistence/entities/profile-client.entity';
import { CreateProfileClientDto } from '../../infrastructure/persistence/dto/profile-client.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProfileCreatedEvent } from '../../domain/events/profile-events';
import { User } from '@/modules/users/infrastructure/persistence/entities/user.entity';

@Injectable()
export class CreateProfileUseCase {
  constructor(
    @InjectRepository(ProfileClient)
    private readonly repo: Repository<ProfileClient>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: number, dto: CreateProfileClientDto) {
    // prevent duplicate profile
    const exists = await this.repo.findOne({
      where: { user: { id: userId } },
    });
    if (exists) return exists;

    const { full_name, ...profileDto } = dto as any;

    const profile = this.repo.create({
      ...profileDto,
      user: { id: userId } as any,
    } as any) as unknown as ProfileClient;

    const savedProfile = (await this.repo.save(profile as any)) as ProfileClient;

    if (full_name !== undefined) {
      await this.repo.manager.update(User, { id: userId }, { name: full_name });
      (savedProfile as any).full_name = full_name;
    }

    this.eventEmitter.emit(
      'client.profile.created',
      new ProfileCreatedEvent(userId, savedProfile.id, dto),
    );

    return savedProfile;
  }
}
