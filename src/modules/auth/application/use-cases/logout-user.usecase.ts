import { Injectable } from '@nestjs/common';
import { CredentialRepository } from '../../infrastructure/persistence/repositories/credentials.repository';

@Injectable()
export class LogoutUserUseCase {
  constructor(private readonly credentialsRepo: CredentialRepository) {}

  async execute(userId: number) {
    return this.credentialsRepo.revoke(userId);
  }
}
