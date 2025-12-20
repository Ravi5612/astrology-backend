import { Controller, Get, Patch, Post, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  CreateProfileExpertDto,
  UpdateProfileExpertDto,
} from './dto/profile-expert.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

@Controller('expert/profile')
export class ProfileController {
  constructor(private readonly expertProfileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: User) {
    return this.expertProfileService.getProfile(user);
  }

  @Post()
  createProfile(
    @CurrentUser() user: User,
    @Body() dto: CreateProfileExpertDto,
  ) {
    return this.expertProfileService.createProfile(user, dto);
  }

  @Patch()
  updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileExpertDto,
  ) {
    return this.expertProfileService.updateProfile(user, dto);
  }
}
