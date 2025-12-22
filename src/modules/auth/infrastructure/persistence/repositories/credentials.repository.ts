import { Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Credential } from '../entities/credential.entity';
import { BaseService } from 'src/common/services/transaction.service';

@Injectable()
export class CredentialRepository extends BaseService<Credential> {
  constructor(
    @InjectRepository(Credential)
    private credentialsRepo: Repository<Credential>,
  ) {
    super(credentialsRepo);
  }

  storeRefreshToken(data: Partial<Credential>, queryRunner?: QueryRunner) {
    const repo = this.getRepo(queryRunner);

    return repo.save(data);
  }

  revoke(userId: number) {
    return this.credentialsRepo.update(
      { user: { id: userId } },
      { revoked: true },
    );
  }
}
