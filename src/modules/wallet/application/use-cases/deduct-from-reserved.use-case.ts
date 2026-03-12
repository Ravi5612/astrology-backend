import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Wallet } from '../../infrastructure/persistence/entities/wallet.entity';
import { Transaction, TransactionType, TransactionPurpose } from '../../infrastructure/persistence/entities/transaction.entity';
import { ProfileClient } from '@/modules/client/profile/infrastructure/persistence/entities/profile-client.entity';

@Injectable()
export class DeductFromReservedUseCase {
  constructor(private readonly dataSource: DataSource) { }

  async execute(
    userId: number,
    amount: number,
    referenceId: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet || Number(wallet.reserved_balance) < amount) {
        throw new BadRequestException('Insufficient reserved balance');
      }

      wallet.reserved_balance = Number(wallet.reserved_balance) - Number(amount);
      await queryRunner.manager.save(wallet);

      const transaction = queryRunner.manager.create(Transaction, {
        wallet_id: wallet.id,
        amount,
        type: TransactionType.DEBIT,
        purpose: TransactionPurpose.CONSULTATION,
        reference_id: referenceId,
      });
      await queryRunner.manager.save(transaction);

      // --- NEW: Tracking Logic ---
      try {
        // 1. Get or Create Profile
        let clientProfile = await queryRunner.manager.findOne(ProfileClient, {
          where: { user: { id: userId } },
          select: ['id']
        });

        if (!clientProfile) {
          clientProfile = queryRunner.manager.create(ProfileClient, { user: { id: userId } as any, user_id: userId });
          clientProfile = await queryRunner.manager.save(clientProfile);
          console.log(`[DEDUCT_RESERVED_TRACKING] Created shell profile for user ${userId} for spending tracking`);
        }

        // 2. Atomic Update
        await queryRunner.manager.createQueryBuilder()
          .update(ProfileClient)
          .set({ total_spending: () => `COALESCE(total_spending, 0) + ${Number(amount)}` })
          .where('id = :id', { id: clientProfile.id })
          .execute();
        
        console.log(`[DEDUCT_RESERVED_TRACKING] Updated total_spending for client ${clientProfile.id} (user ${userId}) with amount ${amount}`);
      } catch (trackingError) {
        console.error('[DEDUCT_RESERVED_TRACKING] Failed to track client spending:', trackingError);
      }
      // ---------------------------

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
