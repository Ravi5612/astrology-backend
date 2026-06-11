import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { ProfileClient } from '../../infrastructure/entities/profile-client.entity';
import { UsersFacade } from '@/modules/users/application/users.facade';
import { hasRoles } from '@/modules/users/infrastructure/enums/Role.enum';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @InjectRepository(ProfileClient)
    private readonly repo: Repository<ProfileClient>,
    private readonly usersFacade: UsersFacade,
  ) {}

  async execute(userId: string, queryRunner?: QueryRunner) {
    const profileRepo = queryRunner
      ? queryRunner.manager.getRepository(ProfileClient)
      : this.repo;

    const profile = await profileRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      // Check if user exists and what their role is
      const user = await this.usersFacade.findById(userId, queryRunner);

      const roles = user?.roles || [];
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
