import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { OAuthAccount } from '../entities/oauth-accounts.entity';
import { OAuthUserDto } from '@/modules/auth/presentation/dto';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entities/user.entity';
import { BaseService } from 'src/common/services/transaction.service';
// import { instanceToPlain } from 'class-transformer';

@Injectable()
export class OAuthService extends BaseService<OAuthAccount> {
  constructor(
    @InjectRepository(OAuthAccount)
    private oauthRepo: Repository<OAuthAccount>,
    private usersService: UsersService,
  ) {
    super(oauthRepo);
  }

  async findByProvider(provider: string, providerId: string) {
    return this.oauthRepo.findOne({
      where: { provider, provider_id: providerId },
      relations: ['user'],
    });
  }

  private async linkAccount(
    data: Partial<OAuthAccount>,
    queryRunner?: QueryRunner,
  ) {
    const repo = this.getRepo(queryRunner);
    const account = repo.create(data);
    return repo.save(account);
  }

  // oauth.service.ts
  async findOrCreateUserFromOAuth(
    dto: OAuthUserDto,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    let oauth = await this.findByProvider(dto.provider, dto.providerId);

    if (oauth?.user) return oauth.user;

    let user = dto.email
      ? await this.usersService.findByEmail(dto.email)
      : null;

    if (!user) {
      user = await this.usersService.create(
        {
          email: dto.email,
          name: dto.name,
          roles: dto.roles?.map((role) => ({ name: role })),
          email_verified_at: new Date(),
        },
        queryRunner,
      );
    }

    await this.linkAccount({ ...dto, user }, queryRunner);
    return user;
  }
}
