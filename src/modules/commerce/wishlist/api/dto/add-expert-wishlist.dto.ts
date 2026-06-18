import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddExpertToWishlistDto {
  @IsOptional()
  @IsString()
  expert_id?: string;

  @IsOptional()
  @IsString()
  expertId?: string;
}
