import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/api/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetMerchantStatsUseCase } from '../../application/use-cases/get-merchant-stats.usecase';
import { GetRecentOrdersUseCase } from '../../application/use-cases/get-recent-orders.usecase';
import { GetMerchantActivityUseCase } from '../../application/use-cases/get-merchant-activity.usecase';
import { GetMerchantPerformanceUseCase } from '../../application/use-cases/get-merchant-performance.usecase';

@Controller({
  path: 'merchant',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class MerchantDashboardController {
  constructor(
    private readonly getStats: GetMerchantStatsUseCase,
    private readonly getRecentOrders: GetRecentOrdersUseCase,
    private readonly getActivity: GetMerchantActivityUseCase,
    private readonly getPerformance: GetMerchantPerformanceUseCase,
  ) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async stats(@CurrentUser('id') userId: number) {
    return this.getStats.execute(userId);
  }

  @Get('orders/recent')
  @HttpCode(HttpStatus.OK)
  async recentOrders(@CurrentUser('id') userId: number) {
    return this.getRecentOrders.execute(userId);
  }

  @Get('activity')
  @HttpCode(HttpStatus.OK)
  async activity(@CurrentUser('id') userId: number) {
    return this.getActivity.execute(userId);
  }

  @Get('performance')
  @HttpCode(HttpStatus.OK)
  async performance(@CurrentUser('id') userId: number) {
    return this.getPerformance.execute(userId);
  }
}
