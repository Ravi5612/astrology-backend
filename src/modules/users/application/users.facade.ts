import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { FindUserUseCase } from './use-cases/find-user.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { DeleteUserUseCase } from './use-cases/delete-user.usecase';
import { AssignRoleToUserUseCase } from './use-cases/assign-role-to-user.usecase';
import { CreateUserDto } from '../presentation/dto/user.dto';
import { User } from '../infrastructure/persistence/entities/user.entity';

import { QueryRunner } from 'typeorm';

@Injectable()
export class UsersFacade {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly assignRoleToUserUseCase: AssignRoleToUserUseCase,
  ) {}

  create(dto: CreateUserDto, queryRunner?: QueryRunner) {
    return this.createUserUseCase.execute(dto, queryRunner);
  }

  findAll(queryRunner?: QueryRunner) {
    return this.findUserUseCase.findAll(queryRunner);
  }

  findByEmail(email: string, queryRunner?: QueryRunner) {
    return this.findUserUseCase.findByEmail(email, queryRunner);
  }

  findByEmailWithPassword(email: string, queryRunner?: QueryRunner) {
    return this.findUserUseCase.findByEmailWithPassword(email, queryRunner);
  }

  findById(id: number, queryRunner?: QueryRunner) {
    return this.findUserUseCase.findById(id, queryRunner);
  }

  update(id: number, dto: Partial<User>, queryRunner?: QueryRunner) {
    return this.updateUserUseCase.execute(id, dto, queryRunner);
  }

  delete(id: number, queryRunner?: QueryRunner) {
    return this.deleteUserUseCase.execute(id, queryRunner);
  }

  assignRole(userId: number, roleName: string, queryRunner?: QueryRunner) {
    return this.assignRoleToUserUseCase.execute(userId, roleName, queryRunner);
  }
}
