import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/modules/auth/api/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetMerchantProfileUseCase } from '../../application/use-cases/get-merchant-profile.use-case';
import { UpdateMerchantProfileUseCase } from '../../application/use-cases/update-merchant-profile.use-case';
import { UpdateMerchantProfileDto } from '../dto/update-merchant-profile.dto';

@Controller({
  path: 'merchant/profile',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class MerchantProfileController {
  constructor(
    private readonly getProfile: GetMerchantProfileUseCase,
    private readonly updateProfile: UpdateMerchantProfileUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findOne(@CurrentUser('id') userId: number) {
    return this.getProfile.execute(userId);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async update(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateMerchantProfileDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    return this.updateProfile.execute(userId, dto, files);
  }
}
