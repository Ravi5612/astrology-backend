import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TodosFacade } from '../../application/todos.facade';
import {
  CreateTodoDto,
  UpdateTodoDto,
} from '../../infrastructure/dto/todo.dto';
import { JwtAuthGuard } from '@/modules/auth/api/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/infrastructure/entities/user.entity';

@Controller({
  path: 'expert/todos',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosFacade: TodosFacade) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.todosFacade.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateTodoDto) {
    return this.todosFacade.create(user.id, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    const _result = await this.todosFacade.update(user.id, id, dto);
    return { success: true };
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.todosFacade.remove(user.id, id);
    return { success: true };
  }
}
