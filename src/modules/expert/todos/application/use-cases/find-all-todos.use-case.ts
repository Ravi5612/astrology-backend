import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../../infrastructure/entities/todo.entity';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class FindAllTodosUseCase {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,
    @Inject(forwardRef(() => ExpertProfileFacade))
    private readonly profileFacade: ExpertProfileFacade,
  ) {}

  private async getExpertProfileId(user: IUser): Promise<string> {
    if (user.profile) return user.profile;
    const profile = await this.profileFacade.getExpertByUserId(user.id);
    if (!profile) throw new NotFoundException('Expert profile not found');
    return profile.id;
  }

  async execute(user: IUser) {
    const expert_id = await this.getExpertProfileId(user);
    return this.todoRepo.find({
      where: { expert_id },
      order: { created_at: 'DESC' },
    });
  }
}
