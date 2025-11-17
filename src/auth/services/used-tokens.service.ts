import { InjectRepository } from '@nestjs/typeorm';
import { UsedTokens } from '../entities/used-tokens.entity';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsedTokensService {
  constructor(
    @InjectRepository(UsedTokens)
    private readonly usedTokensRepo: Repository<UsedTokens>,
  ) {}

  async findOne(token: string, userId: number) {
    const hashedToken = createHash('sha256').update(token).digest('hex');

    return this.usedTokensRepo.findOne({
      where: {
        user: {
          id: userId,
        },
        token: hashedToken,
      },
    });
  }

  async addUsedToken(token: string, userId: number, purpose?: string) {
    const tokenEntry = this.usedTokensRepo.create({
      user: {
        id: userId,
      },
      token,
      purpose,
    });

    return this.usedTokensRepo.save(tokenEntry);
  }
}
