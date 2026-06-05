import { Injectable } from '@nestjs/common';
import { ProkeralaService } from '@/external/prokerala/prokerala.service';

@Injectable()
export class GetKundliMatchingUseCase {
  constructor(private readonly prokeralaService: ProkeralaService) {}

  async execute(girlParams: any, boyParams: any, ayanamsa?: string) {
    return this.prokeralaService.getKundliMatching(girlParams, boyParams, ayanamsa);
  }
}
