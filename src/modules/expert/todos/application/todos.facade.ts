import { Injectable } from '@nestjs/common';
import { FindAllTodosUseCase } from './use-cases/find-all-todos.use-case';
import { CreateTodoUseCase } from './use-cases/create-todo.use-case';
import { UpdateTodoUseCase } from './use-cases/update-todo.use-case';
import { RemoveTodoUseCase } from './use-cases/remove-todo.use-case';
import { CreateTodoDto, UpdateTodoDto } from '../infrastructure/dto/todo.dto';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class TodosFacade {
  constructor(
    private readonly findAllTodosUseCase: FindAllTodosUseCase,
    private readonly createTodoUseCase: CreateTodoUseCase,
    private readonly updateTodoUseCase: UpdateTodoUseCase,
    private readonly removeTodoUseCase: RemoveTodoUseCase,
  ) {}

  async findAll(user: IUser) {
    return this.findAllTodosUseCase.execute(user);
  }

  async create(user: IUser, dto: CreateTodoDto) {
    return this.createTodoUseCase.execute(user, dto);
  }

  async update(user: IUser, id: string, dto: UpdateTodoDto) {
    return this.updateTodoUseCase.execute(user, id, dto);
  }

  async remove(user: IUser, id: string) {
    return this.removeTodoUseCase.execute(user, id);
  }
}
