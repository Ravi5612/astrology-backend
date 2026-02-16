import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { QueryRunner } from 'typeorm';
import { Inject } from '@nestjs/common';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: number, queryRunner?: QueryRunner): Promise<void> {
    await this.userRepository.delete(id, queryRunner);
  }
}
