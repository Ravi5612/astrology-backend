import { Injectable } from '@nestjs/common';
import { GetGunaMilanUseCase } from './use-cases/get-guna-milan.use-case';
import { GetDailyHoroscopeUseCase } from './use-cases/get-daily-horoscope.use-case';
import { GetMangalDoshaUseCase } from './use-cases/get-mangal-dosha.use-case';
import { GetBirthDetailsUseCase } from './use-cases/get-birth-details.use-case';
import { GetKundliMatchingUseCase } from './use-cases/get-kundli-matching.use-case';
import { ProkeralaPersonParam } from '@/external/prokerala/prokerala.service';

@Injectable()
export class AstrologyFacade {
  constructor(
    private readonly getGunaMilanUseCase: GetGunaMilanUseCase,
    private readonly getDailyHoroscopeUseCase: GetDailyHoroscopeUseCase,
    private readonly getMangalDoshaUseCase: GetMangalDoshaUseCase,
    private readonly getBirthDetailsUseCase: GetBirthDetailsUseCase,
    private readonly getKundliMatchingUseCase: GetKundliMatchingUseCase,
  ) {}

  async getGunaMilan(
    girlParams: ProkeralaPersonParam,
    boyParams: ProkeralaPersonParam,
  ) {
    return this.getGunaMilanUseCase.execute(girlParams, boyParams);
  }

  async getDailyHoroscope(sign: string, lang?: string) {
    return this.getDailyHoroscopeUseCase.execute(sign, lang);
  }

  async getMangalDosha(params: {
    datetime: string;
    lat: string;
    lon: string;
    lang?: string;
  }) {
    return this.getMangalDoshaUseCase.execute(params);
  }

  async getBirthDetails(params: {
    datetime: string;
    lat: string;
    lon: string;
    ayanamsa?: string;
  }) {
    return this.getBirthDetailsUseCase.execute(params);
  }

  async getKundliMatching(
    girlParams: ProkeralaPersonParam,
    boyParams: ProkeralaPersonParam,
    ayanamsa?: string,
  ) {
    return this.getKundliMatchingUseCase.execute(
      girlParams,
      boyParams,
      ayanamsa,
    );
  }
}
