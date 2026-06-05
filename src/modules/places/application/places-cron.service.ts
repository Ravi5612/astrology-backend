import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshPlaceSearchCacheUseCase } from './use-cases/refresh-place-search-cache.use-case';
import { RefreshPlaceImagesCacheUseCase } from './use-cases/refresh-place-images-cache.use-case';

@Injectable()
export class PlacesCronService {
  private readonly logger = new Logger(PlacesCronService.name);

  constructor(
    private readonly refreshPlaceSearchCacheUseCase: RefreshPlaceSearchCacheUseCase,
    private readonly refreshPlaceImagesCacheUseCase: RefreshPlaceImagesCacheUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Starting daily Places cache refresh...');
    await this.refreshPlaceSearchCacheUseCase.execute();
    await this.refreshPlaceImagesCacheUseCase.execute();
    this.logger.log('Places cache refresh completed.');
  }
}
