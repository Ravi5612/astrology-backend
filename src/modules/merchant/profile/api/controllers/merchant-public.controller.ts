import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { GetMerchantDetailsUseCase } from '../../application/use-cases/get-merchant-details.use-case';
import { GetAllMerchantsUseCase } from '../../application/use-cases/get-all-merchants.use-case';
import { GetUniqueMerchantCitiesUseCase } from '../../application/use-cases/get-unique-merchant-cities.use-case';

@Controller({
  path: 'merchants',
  version: '1',
})
export class MerchantPublicController {
  constructor(
    private readonly getMerchantDetails: GetMerchantDetailsUseCase,
    private readonly getAllMerchants: GetAllMerchantsUseCase,
    private readonly getUniqueCities: GetUniqueMerchantCitiesUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.getAllMerchants.execute({ search, city, page, limit });
  }

  @Get('cities')
  async getCities() {
    return this.getUniqueCities.execute();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getMerchantDetails.execute(id);
  }
}
