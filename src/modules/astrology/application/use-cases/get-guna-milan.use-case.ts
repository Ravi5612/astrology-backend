import { Injectable } from '@nestjs/common';
import { ProkeralaService } from '@/external/prokerala/prokerala.service';

@Injectable()
export class GetGunaMilanUseCase {
  constructor(private readonly prokeralaService: ProkeralaService) {}

  async execute(girlParams: any, boyParams: any) {
    return this.prokeralaService.getGunaMilan(girlParams, boyParams);
  }
}
