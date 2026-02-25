import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { ProfileClient } from '../../infrastructure/persistence/entities/profile-client.entity';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @InjectRepository(ProfileClient)
    private readonly repo: Repository<ProfileClient>,
  ) { }

  async execute(userId: number, queryRunner?: QueryRunner) {
    const repo = queryRunner ? queryRunner.manager.getRepository(ProfileClient) : this.repo;
    return repo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}
