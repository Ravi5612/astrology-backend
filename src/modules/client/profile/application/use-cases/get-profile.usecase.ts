import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, FindOptionsWhere } from 'typeorm';
import { ProfileClient } from '../../infrastructure/entities/profile-client.entity';
import { UsersFacade } from '@/modules/users/application/users.facade';
import { hasRoles } from '@/modules/users/infrastructure/enums/Role.enum';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @InjectRepository(ProfileClient)
    private readonly repo: Repository<ProfileClient>,
    private readonly usersFacade: UsersFacade,
  ) {}

  async execute(user: IUser, queryRunner?: QueryRunner) {
    const profileRepo = queryRunner
      ? queryRunner.manager.getRepository(ProfileClient)
      : this.repo;

    const where: FindOptionsWhere<ProfileClient> = user.profile
      ? { id: user.profile, user: { id: user.id } }
      : { user: { id: user.id } };

    const profile = await profileRepo.findOne({
      where,
      relations: ['user'],
    });

    if (!profile) {
      // Check if user exists and what their role is
      const existingUser = await this.usersFacade.findById(
        user.id,
        queryRunner,
      );

      const roles = existingUser?.roles || [];
      const hasClientRole = hasRoles(roles, 'CLIENT');
      const hasExpertRole = hasRoles(roles, 'EXPERT');

      if (hasExpertRole && !hasClientRole) {
        throw new ForbiddenException(
          'Aap ek Expert hain. Kripya Expert Dashboard se login karein.',
        );
      }

      // If it's a client but no profile, return null or a basic structure
      // We return null so the frontend knows it needs to be created
      return null;
    }

    // Backend decides the final profile picture:
    // 1. If user manually uploaded a picture â†’ use that (profile.profile_picture)
    // 2. Otherwise fallback to Gmail/OAuth avatar (profile.user.avatar)
    const resolvedProfilePicture =
      profile.profile_picture || profile.user?.avatar || null;

    return {
      ...profile,
      profile_picture: resolvedProfilePicture, // Always the final, resolved picture
    };
  }
}
