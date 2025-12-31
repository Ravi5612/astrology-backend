import { Module } from '@nestjs/common';
import { UsersModule } from '@/modules/users/users.module';
import { CoreModule } from '@/core/core.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { RolesModule } from '@/modules/role/roles.module';
import { ClientModule } from '@/modules/client/client.module';
import { ExpertModule } from '@/modules/expert/expert.module';

@Module({
  imports: [
    UsersModule,
    CoreModule,
    AuthModule,
    RolesModule,
    ClientModule,
    ExpertModule,
  ],
})
export class AppModule {}
