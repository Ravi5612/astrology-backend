import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileClient } from '../../infrastructure/persistence/entities/profile-client.entity';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @InjectRepository(ProfileClient)
    private readonly repo: Repository<ProfileClient>,
  ) {}

  async execute(userId: number) {
    const profile = await this.repo.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!profile) return null;

    const response: any = { ...profile, full_name: profile.user?.name ?? null };
    delete response.user;
    return response;
  }
}
