import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PujaAppointment } from '../../infrastructure/entities/puja-appointment.entity';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';

@Injectable()
export class GetExpertPujaAppointmentsUseCase {
  constructor(
    @InjectRepository(PujaAppointment)
    private pujaAppointmentRepository: Repository<PujaAppointment>,
    @Inject(forwardRef(() => ExpertProfileFacade))
    private readonly expertProfileFacade: ExpertProfileFacade,
  ) {}

  async execute(userId: string): Promise<PujaAppointment[]> {
    const expert = await this.expertProfileFacade.getExpertByUserId(userId);

    if (!expert) {
      // If user is not an expert, return empty list instead of throwing
      return [];
    }

    return await this.pujaAppointmentRepository.find({
      where: { expert_id: expert.id },
      relations: ['client', 'client.user', 'puja'],
      order: { created_at: 'DESC' },
    });
  }

  async getRevenueAndCount(expertProfileId: string) {
    const stats = (await this.pujaAppointmentRepository
      .createQueryBuilder('puja')
      .select('SUM(puja.price)', 'total')
      .addSelect('COUNT(puja.id)', 'count')
      .where('puja.expert_id = :id AND puja.status IN (:...statuses)', {
        id: expertProfileId,
        statuses: ['accepted', 'confirmed'],
      })
      .getRawOne()) as { total?: string | number; count?: string | number };
    return {
      total: parseFloat(stats.total as string) || 0,
      count: parseInt(stats.count as string, 10) || 0,
    };
  }
}
