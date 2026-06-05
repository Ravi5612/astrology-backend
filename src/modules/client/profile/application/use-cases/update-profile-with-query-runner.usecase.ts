import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { ProfileClient } from '../../infrastructure/entities/profile-client.entity';

@Injectable()
export class UpdateClientProfileWithQueryRunnerUseCase {
  constructor(
    @InjectRepository(ProfileClient)
    private readonly profileRepo: Repository<ProfileClient>,
  ) {}

  async execute(userId: string, updates: Partial<ProfileClient>, queryRunner: QueryRunner) {
    let profile = await queryRunner.manager.findOne(ProfileClient, {
      where: { user: { id: userId as any } }
    });

    if (profile) {
      Object.assign(profile, updates);
      await queryRunner.manager.save(ProfileClient, profile);
    } else {
      profile = queryRunner.manager.create(ProfileClient, {
        user: { id: userId as any },
        ...updates
      });
      await queryRunner.manager.save(ProfileClient, profile);
    }
  }
}
