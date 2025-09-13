import { Module } from '@nestjs/common';
import { ConfigurationModule } from './configuration/configuration.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';

@Module({
  imports: [AuthModule.forRoot(auth)],
  providers: [ConfigurationModule],
})
export class AppModule {}
