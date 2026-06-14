import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../infrastructure/entities/bank-account.entity';
import { ProfileExpert } from '@/modules/expert/profile/infrastructure/entities/profile-expert.entity';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class GetBankAccountUseCase {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(ProfileExpert)
    private readonly profileRepo: Repository<ProfileExpert>,
  ) {}

  private async getExpertProfile(user: IUser) {
    const where = user.profile
      ? { id: user.profile, user: { id: user.id } }
      : { user: { id: user.id } };
    const profile = await this.profileRepo.findOne({ where });
    if (!profile) throw new NotFoundException('Expert profile not found');
    return profile;
  }

  async execute(user: IUser, id: string) {
    const profile = await this.getExpertProfile(user);
    const account = await this.bankAccountRepo.findOne({
      where: { id, expert_id: profile.id },
    });
    if (!account) throw new NotFoundException('Bank account not found');
    return account;
  }
}
