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
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class CreateTodoUseCase {
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

  async execute(user: IUser, dto: CreateTodoDto) {
    const expert_id = await this.getExpertProfileId(user);
    const todo = this.todoRepo.create({ ...dto, expert_id });
    return this.todoRepo.save(todo);
  }
}
