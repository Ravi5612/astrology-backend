import { Injectable } from '@nestjs/common';
import { GetMerchantProfileUseCase } from './use-cases/get-merchant-profile.use-case';
import { UpdateMerchantProfileUseCase } from './use-cases/update-merchant-profile.use-case';
import { UpdateProfileWithQueryRunnerUseCase } from './use-cases/update-profile-with-query-runner.usecase';
import { GetAdminMerchantsUseCase } from './use-cases/get-admin-merchants.use-case';
import { UpdateMerchantStatusAdminUseCase } from './use-cases/update-merchant-status-admin.use-case';
import { QueryRunner } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileMerchant } from '../infrastructure/entities/profile-merchant.entity';

@Injectable()
export class MerchantProfileFacade {
  constructor(
    private readonly getMerchantProfileUseCase: GetMerchantProfileUseCase,
    private readonly updateMerchantProfileUseCase: UpdateMerchantProfileUseCase,
    private readonly updateProfileWithQueryRunnerUseCase: UpdateProfileWithQueryRunnerUseCase,
    private readonly getAdminMerchantsUseCase: GetAdminMerchantsUseCase,
    private readonly updateMerchantStatusAdminUseCase: UpdateMerchantStatusAdminUseCase,
    @InjectRepository(ProfileMerchant)
    private readonly repo: Repository<ProfileMerchant>
  ) {}

  getProfile(userId: string) {
    return this.getMerchantProfileUseCase.execute(userId);
  }

  getProfileById(merchantId: string) {
    return this.repo.findOne({ where: { id: merchantId } });
  }

  getProfileByUserId(userId: string) {
    return this.repo.findOne({ where: { user_id: userId as any } });
  }

  getRawProfiles() {
    return this.repo.find({ relations: ['user'] });
  }

  updateProfile(userId: string, dto: any, files?: any) {
    return this.updateMerchantProfileUseCase.execute(userId, dto, files);
  }

  updateProfileWithQueryRunner(userId: string, dto: any, queryRunner: QueryRunner) {
    return this.updateProfileWithQueryRunnerUseCase.execute(userId, dto, queryRunner);
  }

  getAdminMerchants(params: any) {
    return this.getAdminMerchantsUseCase.execute(params);
  }

  updateAdminMerchantStatus(id: string, status: string, remarks?: string) {
    return this.updateMerchantStatusAdminUseCase.execute(id, { status });
  }
}
