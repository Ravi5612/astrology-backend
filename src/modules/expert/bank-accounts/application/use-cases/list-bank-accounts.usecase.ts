import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../infrastructure/entities/bank-account.entity';
import { ProfileExpert } from '@/modules/expert/profile/infrastructure/entities/profile-expert.entity';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class ListBankAccountsUseCase {
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

  async execute(user: IUser) {
    const profile = await this.getExpertProfile(user);
    return this.bankAccountRepo.find({
      where: { expert_id: profile.id },
      order: { is_primary: 'DESC', created_at: 'DESC' },
    });
  }
}
