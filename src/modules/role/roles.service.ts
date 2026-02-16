import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, QueryRunner } from 'typeorm';
import { Role } from './entities/roles.entity';
import { BaseService } from '@/common/services/transaction.service';

@Injectable()
export class RolesService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {
    super(roleRepo);
  }

  async findByName(name: string, queryRunner?: QueryRunner): Promise<Role | null> {
    return this.getRepo(queryRunner).findOne({ where: { name } });
  }

  async findByNames(names: string[], queryRunner?: QueryRunner): Promise<Role[]> {
    return this.getRepo(queryRunner).findBy({ name: names.length ? In(names) : In([]) });
  }

  async create(name: string, description?: string, queryRunner?: QueryRunner): Promise<Role> {
    const repo = this.getRepo(queryRunner);
    const role = repo.create({ name, description });
    return repo.save(role);
  }
}
