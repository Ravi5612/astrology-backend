import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../infrastructure/persistence/entities/user.entity';
import { QueryRunner } from 'typeorm';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: number, data: Partial<User>, queryRunner?: QueryRunner): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.userRepository.update(id, data, queryRunner);
  }
}
