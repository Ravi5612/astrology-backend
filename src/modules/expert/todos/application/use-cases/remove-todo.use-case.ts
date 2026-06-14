import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { BooleanMessage } from '@/common/dto/boolean-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../../infrastructure/entities/todo.entity';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';
import { TodoNotFoundError } from '../../domain/errors/todo-not-found.error';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class RemoveTodoUseCase {
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

  async execute(user: IUser, id: string) {
    const expert_id = await this.getExpertProfileId(user);
    const todo = await this.todoRepo.findOne({
      where: { id, expert_id },
    });
    if (!todo) {
      throw new TodoNotFoundError();
    }
    await this.todoRepo.remove(todo);
    return new BooleanMessage();
  }
}
