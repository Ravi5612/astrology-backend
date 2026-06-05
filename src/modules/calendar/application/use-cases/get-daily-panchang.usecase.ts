import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarCache } from '../../infrastructure/entities/calendar-cache.entity';
import { ProkeralaService } from '@/external/prokerala/prokerala.service';

@Injectable()
export class GetDailyPanchangUseCase {
  private readonly logger = new Logger(GetDailyPanchangUseCase.name);

  constructor(
    @InjectRepository(CalendarCache)
    private readonly cacheRepository: Repository<CalendarCache>,
    private readonly prokeralaService: ProkeralaService,
  ) {}

  private formatTime(isoString: string): string {
    if (!isoString) return '';
    const match = isoString.match(/T(\d{2}):(\d{2})/);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = hours < 10 ? '0' + hours : hours.toString();
      return `${hoursStr}:${minutes} ${ampm}`;
    }
    return isoString;
  }

  private mapPanchangToFrontendSchema(rawResponse: any) {
    const data = rawResponse?.data || rawResponse || {};
    const panchang = data.panchang || rawResponse?.panchang || {};

    const extractItem = (arr: any[]) => {
      if (!arr || !Array.isArray(arr) || !arr.length) return null;
      const item = arr[0];
      return {
        name: item.name || '',
        start: this.formatTime(item.start),
        end: this.formatTime(item.end)
      };
    };

    const getMuhurat = (periods: any[], searchName: string) => {
      if (!periods || !Array.isArray(periods)) return null;
      const period = periods.find((p: any) => p.name && p.name.toLowerCase().includes(searchName.toLowerCase()));
      if (period && period.period && Array.isArray(period.period) && period.period.length > 0) {
        return {
          start: this.formatTime(period.period[0].start),
          end: this.formatTime(period.period[0].end)
        };
      }
      return null;
    };

    const auspicious = panchang.auspicious_period || [];
    const inauspicious = panchang.inauspicious_period || [];

    return {
      tithi: extractItem(panchang.tithi) || { name: 'N/A', start: 'N/A', end: 'N/A' },
      nakshatra: extractItem(panchang.nakshatra) || { name: 'N/A', start: 'N/A', end: 'N/A' },
      karana: extractItem(panchang.karana) || { name: 'N/A', start: 'N/A', end: 'N/A' },
      yoga: extractItem(panchang.yoga) || { name: 'N/A', start: 'N/A', end: 'N/A' },
      
      shubh_muhurat: {
        abhijit: getMuhurat(auspicious, 'abhijit') || { start: 'N/A', end: 'N/A' },
        brahma: getMuhurat(auspicious, 'brahma') || { start: 'N/A', end: 'N/A' }
      },
      ashubh_muhurat: {
        rahu_kalam: getMuhurat(inauspicious, 'rahu') || { start: 'N/A', end: 'N/A' },
        yamaganda: getMuhurat(inauspicious, 'yamaganda') || { start: 'N/A', end: 'N/A' }
      },

      sunrise: this.formatTime(data.sunrise) || this.formatTime(panchang.sunrise) || 'N/A',
      sunset: this.formatTime(data.sunset) || this.formatTime(panchang.sunset) || 'N/A',
      moonrise: this.formatTime(data.moonrise) || this.formatTime(panchang.moonrise) || 'N/A'
    };
  }

  async execute(date: string, lat: string, lon: string, lang: string = 'en') {
    const type = 'daily';
    const cacheKey = `${date}-${lat}-${lon}-${lang}-v3`; // Increment version to bypass old caches

    const cached = await this.cacheRepository.findOne({ where: { type, cacheKey } });
    if (cached) {
      this.logger.log(`Serving cached daily panchang for ${cacheKey}`);
      return cached.response;
    }

    this.logger.log(`Fetching fresh daily panchang for ${cacheKey}`);
    const datetime = `${date}T00:00:00+05:30`;
    const rawResponse = await this.prokeralaService.getPanchangDaily({
      datetime,
      lat,
      lon,
      lang,
    });

    console.log('[DEBUG] Raw Prokerala Response Keys:', Object.keys(rawResponse || {}));
    if (rawResponse?.data) console.log('[DEBUG] Raw Response Data Keys:', Object.keys(rawResponse.data));

    const response = this.mapPanchangToFrontendSchema(rawResponse);
    
    console.log('[DEBUG] Mapped Response Tithi:', response.tithi);
    console.log('[DEBUG] Mapped Response Sunrise:', response.sunrise);

    const newCache = this.cacheRepository.create({
      type,
      cacheKey,
      response,
    });
    await this.cacheRepository.save(newCache);

    return response;
  }
}
