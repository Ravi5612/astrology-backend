import { AddressDto } from '@/common/address/address.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class ProfileClientDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  username?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsEnum(['male', 'female', 'other'])
  gender: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  preferences?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  language_preference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  time_of_birth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  place_of_birth?: string;

  @IsOptional()
  @IsString()
  profile_picture?: string;

  @IsOptional()
  @IsString()
  @IsIn(['single', 'married', 'divorced', 'widowed', 'other'])
  marital_status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  occupation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  about_me?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[];
}

// Create profile
export class CreateProfileClientDto extends ProfileClientDto {}

// Update profile
export class UpdateProfileClientDto extends PartialType(ProfileClientDto) {}
