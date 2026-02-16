import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { QueryRunner } from 'typeorm';
import { User } from '../../infrastructure/persistence/entities/user.entity';
import { Inject } from '@nestjs/common';

@Injectable()
export class FindUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async findById(id: number, queryRunner?: QueryRunner): Promise<User> {
    const user = await this.userRepository.findById(id, true, queryRunner);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string, queryRunner?: QueryRunner): Promise<User | null> {
    return this.userRepository.findByEmail(email, queryRunner);
  }

  async findByEmailWithPassword(email: string, queryRunner?: QueryRunner): Promise<User | null> {
    return this.userRepository.findByEmailWithPassword(email, queryRunner);
  }

  async findAll(queryRunner?: QueryRunner): Promise<User[]> {
      return this.userRepository.findAll(queryRunner);
  }
}
