import { Injectable } from '@nestjs/common';
import { CreateBankAccountUseCase } from './use-cases/create-bank-account.usecase';
import { ListBankAccountsUseCase } from './use-cases/list-bank-accounts.usecase';
import { GetBankAccountUseCase } from './use-cases/get-bank-account.usecase';
import { UpdateBankAccountUseCase } from './use-cases/update-bank-account.usecase';
import { SetPrimaryBankAccountUseCase } from './use-cases/set-primary-bank-account.usecase';
import { RemoveBankAccountUseCase } from './use-cases/remove-bank-account.usecase';
import {
  CreateBankAccountDto,
  UpdateBankAccountDto,
} from '../api/dto/bank-account.dto';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class BankAccountsFacade {
  constructor(
    private readonly createBankAccountUseCase: CreateBankAccountUseCase,
    private readonly listBankAccountsUseCase: ListBankAccountsUseCase,
    private readonly getBankAccountUseCase: GetBankAccountUseCase,
    private readonly updateBankAccountUseCase: UpdateBankAccountUseCase,
    private readonly setPrimaryBankAccountUseCase: SetPrimaryBankAccountUseCase,
    private readonly removeBankAccountUseCase: RemoveBankAccountUseCase,
  ) {}

  async create(user: IUser, dto: CreateBankAccountDto) {
    return this.createBankAccountUseCase.execute(user, dto);
  }

  async findAll(user: IUser) {
    return this.listBankAccountsUseCase.execute(user);
  }

  async findOne(user: IUser, id: string) {
    return this.getBankAccountUseCase.execute(user, id);
  }

  async update(user: IUser, id: string, dto: UpdateBankAccountDto) {
    return this.updateBankAccountUseCase.execute(user, id, dto);
  }

  async setPrimary(user: IUser, id: string) {
    return this.setPrimaryBankAccountUseCase.execute(user, id);
  }

  async remove(user: IUser, id: string) {
    return this.removeBankAccountUseCase.execute(user, id);
  }
}
