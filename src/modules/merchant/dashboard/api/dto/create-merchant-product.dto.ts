import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MerchantProductStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  OUT_OF_STOCK = 'out_of_stock',
}

export class CreateMerchantProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  original_price?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsEnum(MerchantProductStatus)
  @IsOptional()
  status?: MerchantProductStatus;
}
