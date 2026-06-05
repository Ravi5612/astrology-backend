import { Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../../infrastructure/entities/todo.entity';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';

@Injectable()
export class FindAllTodosUseCase {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,
    @Inject(forwardRef(() => ExpertProfileFacade))
    private readonly profileFacade: ExpertProfileFacade,
  ) { }

  private async getExpertProfile(userId: string) {
    const profile = await this.profileFacade.getExpertByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Expert profile not found');
    }
    return profile;
  }

  async execute(userId: string) {
    const profile = await this.getExpertProfile(userId);
    return this.todoRepo.find({
      where: { expert_id: profile.id },
      order: { created_at: 'DESC' },
    });
  }
}
