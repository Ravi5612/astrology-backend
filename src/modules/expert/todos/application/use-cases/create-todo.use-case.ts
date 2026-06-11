import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../../infrastructure/entities/todo.entity';
import { CreateTodoDto } from '../../infrastructure/dto/todo.dto';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';

@Injectable()
export class CreateTodoUseCase {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,
    @Inject(forwardRef(() => ExpertProfileFacade))
    private readonly profileFacade: ExpertProfileFacade,
  ) {}

  private async getExpertProfile(userId: string) {
    const profile = await this.profileFacade.getExpertByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Expert profile not found');
    }
    return profile;
  }

  async execute(userId: string, dto: CreateTodoDto) {
    const profile = await this.getExpertProfile(userId);
    const todo = this.todoRepo.create({
      ...dto,
      expert_id: profile.id,
    });
    return this.todoRepo.save(todo);
  }
}
