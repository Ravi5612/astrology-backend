import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from '../../infrastructure/entities/place.entity';
import { SerperService } from '@/external/serper/serper.service';
import { PlacesMapper } from '../places.mapper';

@Injectable()
export class RefreshPlaceSearchCacheUseCase {
  private readonly logger = new Logger(RefreshPlaceSearchCacheUseCase.name);

  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    private readonly serperService: SerperService,
    private readonly placesMapper: PlacesMapper,
  ) {}

  async execute() {
    this.logger.log('Starting daily Places cache refresh...');
    const allPlaces = await this.placeRepository.find();
    for (const entry of allPlaces) {
      try {
        const rawResults = await this.serperService.fetchPlaces(entry.query, entry.location);
        const normalizedResults = this.placesMapper.mapSerperPlaces(rawResults.places || []);
        entry.results = normalizedResults;
        entry.last_synced = new Date();
        await this.placeRepository.save(entry);
        this.logger.log(`Refreshed places for: ${entry.query} in ${entry.location}`);
      } catch (error) {
        this.logger.error(`Failed to refresh places for ${entry.query}: ${error.message}`);
      }
    }
  }
}
