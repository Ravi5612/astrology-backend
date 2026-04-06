import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/api/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { MerchantProductsUseCase } from '../../application/use-cases/merchant-products.usecase';
import { CreateMerchantProductDto } from '../dto/create-merchant-product.dto';
import { BulkUpdateStatusDto } from '../dto/bulk-update-status.dto';

@Controller({ path: 'merchant/products', version: '1' })
@UseGuards(JwtAuthGuard)
export class MerchantProductsController {
  constructor(private readonly merchantProducts: MerchantProductsUseCase) {}

  // GET /api/v1/merchant/products?status=active&search=rudraksha&page=1&limit=20
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser('id') userId: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.merchantProducts.findAll(userId, { status, search, page, limit });
  }

  // POST /api/v1/merchant/products
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateMerchantProductDto,
  ) {
    return this.merchantProducts.create(userId, dto);
  }

  // PATCH /api/v1/merchant/products/bulk-status
  @Patch('bulk-status')
  @HttpCode(HttpStatus.OK)
  async bulkStatus(
    @CurrentUser('id') userId: number,
    @Body() dto: BulkUpdateStatusDto,
  ) {
    return this.merchantProducts.bulkUpdateStatus(userId, dto.ids, dto.status);
  }

  // PUT /api/v1/merchant/products/:id
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) productId: number,
    @Body() dto: CreateMerchantProductDto,
  ) {
    return this.merchantProducts.update(userId, productId, dto);
  }

  // DELETE /api/v1/merchant/products/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) productId: number,
  ) {
    return this.merchantProducts.remove(userId, productId);
  }
}
