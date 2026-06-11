import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileAgent } from '../../infrastructure/entities/profile-agent.entity';

@Injectable()
export class GetAgentProfileUseCase {
  constructor(
    @InjectRepository(ProfileAgent)
    private readonly profileAgentRepo: Repository<ProfileAgent>,
  ) {}

  async execute(userId: string) {
    const profile = await this.profileAgentRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!profile) return null;

    return {
      ...profile,
      name: profile.user?.name,
      email: profile.user?.email,
    };
  }
}
