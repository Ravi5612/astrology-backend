import { Module } from '@nestjs/common';
import { AstrologyController } from './api/astrology.controller';
import { ProkeralaModule } from '@/external/prokerala/prokerala.module';
import { AstrologyFacade } from './application/astrology.facade';
import { GetGunaMilanUseCase } from './application/use-cases/get-guna-milan.use-case';
import { GetDailyHoroscopeUseCase } from './application/use-cases/get-daily-horoscope.use-case';
import { GetMangalDoshaUseCase } from './application/use-cases/get-mangal-dosha.use-case';
import { GetBirthDetailsUseCase } from './application/use-cases/get-birth-details.use-case';
import { GetKundliMatchingUseCase } from './application/use-cases/get-kundli-matching.use-case';

@Module({
  imports: [ProkeralaModule],
  controllers: [AstrologyController],
  providers: [
    AstrologyFacade,
    GetGunaMilanUseCase,
    GetDailyHoroscopeUseCase,
    GetMangalDoshaUseCase,
    GetBirthDetailsUseCase,
    GetKundliMatchingUseCase,
  ],
  exports: [AstrologyFacade],
})
export class AstrologyModule {}
