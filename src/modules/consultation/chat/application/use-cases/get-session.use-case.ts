import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../../infrastructure/entities/chat-session.entity';

@Injectable()
export class GetSessionUseCase {
  constructor(
    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,
  ) {}

  async execute(id: string) {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['user', 'expert', 'expert.user'],
    });

    if (session && session.user) {
      console.log(`[GetSession] Fetching profile for user ${session.user.id}`);
      const { ProfileClient } = await import(
        '../../../../client/profile/infrastructure/entities/profile-client.entity'
      );
      const profile = (await this.sessionRepo.manager.findOne(
        ProfileClient as import('typeorm').EntityTarget<any>,
        { where: { user_id: session.user.id } },
      )) as Record<string, unknown> | null;
      console.log(
        `[GetSession] Found profile:`,
        profile ? profile.id : 'null',
        `avatar:`,
        profile?.profile_picture,
      );
      if (profile && profile.profile_picture) {
        session.user.avatar =
          (profile.profile_picture as string) || session.user.avatar;
        console.log(
          `[GetSession] Set session.user.avatar to`,
          session.user.avatar,
        );
      }
    }

    return session;
  }
}
