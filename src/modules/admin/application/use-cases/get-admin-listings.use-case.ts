import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentListing } from '@/modules/agent/infrastructure/persistence/entities/agent-listing.entity';

@Injectable()
export class GetAdminListingsUseCase {
  constructor(
    @InjectRepository(AgentListing)
    private readonly listingRepository: Repository<AgentListing>,
  ) { }

  async execute(params?: {
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.agent', 'agent');

    if (params?.type) {
      qb.andWhere('listing.type = :type', { type: params.type });
    }

    if (params?.search) {
      qb.andWhere(
        '(LOWER(listing.name) LIKE :search OR LOWER(listing.location) LIKE :search OR LOWER(agent.name) LIKE :search)',
        { search: `%${params.search.toLowerCase()}%` },
      );
    }

    qb.orderBy('listing.created_at', 'DESC');
    qb.skip(skip).take(limit);

    const [listings, total] = await qb.getManyAndCount();

    return {
      data: listings.map(l => ({
        id: l.id,
        listing_type: l.type,
        listing_name: l.name,
        listing_location: l.location,
        status: l.status,
        name: l.name,
        location: l.location,
        phone: l.phone,
        agent_id: l.agent?.uid || l.agent_id.toString(),
        agent_name: l.agent?.name || 'Unknown',
        deity: l.deity,
        items: l.items,
        created_at: l.created_at,
      })),
      total,
      page,
      limit,
    };
  }
}
