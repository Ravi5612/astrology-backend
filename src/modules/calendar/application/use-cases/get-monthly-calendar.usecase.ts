import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarCache } from '../../infrastructure/entities/calendar-cache.entity';
import { GetDailyPanchangUseCase } from './get-daily-panchang.usecase';

@Injectable()
export class GetMonthlyCalendarUseCase {
  private readonly logger = new Logger(GetMonthlyCalendarUseCase.name);

  constructor(
    @InjectRepository(CalendarCache)
    private readonly cacheRepository: Repository<CalendarCache>,
    private readonly getDailyPanchangUseCase: GetDailyPanchangUseCase,
  ) {}

  async execute(year: number, month: number, lat: string, lon: string, lang: string = 'en') {
    const type = 'monthly';
    const cacheKey = `${year}-${month}-${lat}-${lon}-${lang}-v2`;
    
    const cached = await this.cacheRepository.findOne({ where: { type, cacheKey } });
    if (cached) {
      this.logger.log(`Serving cached monthly calendar for ${cacheKey}`);
      return cached.response;
    }

    this.logger.log(`Fetching fresh monthly calendar for ${cacheKey}`);
    
    // Get last day of the month
    const lastDay = new Date(year, month, 0).getDate();
    const monthlyData: any[] = [];

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let day = 1; day <= lastDay; day++) {
      const paddedDay = day.toString().padStart(2, '0');
      const paddedMonth = month.toString().padStart(2, '0');
      const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
      
      this.logger.debug(`Fetching panchang for ${dateStr}`);
      const dailyData = await this.getDailyPanchangUseCase.execute(dateStr, lat, lon, lang);
      monthlyData.push(dailyData);

      // Avoid Prokerala rate limit (429) — wait 1s between each call
      if (day < lastDay) await sleep(1000);
    }

    const newCache = this.cacheRepository.create({
      type,
      cacheKey,
      response: monthlyData,
    });
    await this.cacheRepository.save(newCache);

    return monthlyData;
  }
}
