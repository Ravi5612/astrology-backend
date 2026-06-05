import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaceImage } from '../../infrastructure/entities/place.entity';
import { SerperService } from '@/external/serper/serper.service';
import { PlacesMapper } from '../places.mapper';

@Injectable()
export class RefreshPlaceImagesCacheUseCase {
  private readonly logger = new Logger(RefreshPlaceImagesCacheUseCase.name);

  constructor(
    @InjectRepository(PlaceImage)
    private readonly imageRepository: Repository<PlaceImage>,
    private readonly serperService: SerperService,
    private readonly placesMapper: PlacesMapper,
  ) {}

  async execute() {
    const allImages = await this.imageRepository.find();
    for (const entry of allImages) {
      try {
        const rawResults = await this.serperService.fetchImages(entry.query);
        const normalizedResults = this.placesMapper.mapSerperImages(rawResults.images || []);
        entry.results = normalizedResults;
        entry.last_synced = new Date();
        await this.imageRepository.save(entry);
        this.logger.log(`Refreshed images for: ${entry.query}`);
      } catch (error) {
        this.logger.error(`Failed to refresh images for ${entry.query}: ${error.message}`);
      }
    }
  }
}
