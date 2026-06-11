import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BankAccountsFacade } from '../../application/bank-accounts.facade';
import {
  CreateBankAccountDto,
  UpdateBankAccountDto,
} from '../dto/bank-account.dto';
import { JwtAuthGuard } from '@/modules/auth/api/guards/auth.guard';
import { RolesGuard } from '@/modules/auth/api/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/infrastructure/entities/user.entity';

@Controller({
  path: 'expert/bank-accounts',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('EXPERT')
export class BankAccountsController {
  constructor(private readonly bankAccountsFacade: BankAccountsFacade) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() createBankAccountDto: CreateBankAccountDto,
  ) {
    return this.bankAccountsFacade.create(user.id, createBankAccountDto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.bankAccountsFacade.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.bankAccountsFacade.findOne(user.id, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ) {
    const _result = await this.bankAccountsFacade.update(
      user.id,
      id,
      updateBankAccountDto,
    );
    return { success: true };
  }

  @Patch(':id/set-primary')
  async setPrimary(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const _result = await this.bankAccountsFacade.setPrimary(user.id, id);
    return { success: true };
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const _result = await this.bankAccountsFacade.remove(user.id, id);
    return { success: true };
  }
}
