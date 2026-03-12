import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Wallet } from '../../infrastructure/persistence/entities/wallet.entity';
import { Transaction, TransactionType, TransactionPurpose } from '../../infrastructure/persistence/entities/transaction.entity';
import { NotificationFacade } from '@/modules/notification/application/notification.facade';
import { NotificationGateway } from '@/modules/notification/api/gateways/notification.gateway';
import { NotificationType } from '@/modules/notification/infrastructure/persistence/entities/notification.entity';
import { ProfileExpert } from '@/modules/expert/profile/infrastructure/persistence/entities/profile-expert.entity';

@Injectable()
export class CreditUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationFacade: NotificationFacade,
    private readonly notificationGateway: NotificationGateway,
  ) { }

  async execute(
    userId: number,
    amount: number,
    purpose: TransactionPurpose,
    referenceId?: string,
  ): Promise<Wallet> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) {
        wallet = queryRunner.manager.create(Wallet, {
          user_id: userId,
          balance: 0,
          reserved_balance: 0,
        });
      }

      wallet.balance = Number(wallet.balance) + Number(amount);
      await queryRunner.manager.save(wallet);

      const transaction = queryRunner.manager.create(Transaction, {
        wallet_id: wallet.id,
        amount,
        type: TransactionType.CREDIT,
        purpose,
        reference_id: referenceId,
      });
      await queryRunner.manager.save(transaction);

      // --- NEW: Tracking Logic ---
      if (purpose === TransactionPurpose.CONSULTATION || purpose === TransactionPurpose.PRODUCT_PURCHASE) {
        try {
          // 1. Get or Create Profile
          let expertProfile = await queryRunner.manager.findOne(ProfileExpert, {
            where: { user: { id: userId } },
            select: ['id']
          });

          if (!expertProfile) {
            expertProfile = queryRunner.manager.create(ProfileExpert, { user: { id: userId } as any, user_id: userId });
            expertProfile = await queryRunner.manager.save(expertProfile);
            console.log(`[CREDIT_TRACKING] Created shell profile for expert user ${userId} for earning tracking`);
          }

          // 2. Atomic Update
          await queryRunner.manager.createQueryBuilder()
            .update(ProfileExpert)
            .set({ total_earning: () => `COALESCE(total_earning, 0) + ${Number(amount)}` })
            .where('id = :id', { id: expertProfile.id })
            .execute();
          
          console.log(`[CREDIT_TRACKING] Updated total_earning for expert ${expertProfile.id} (user ${userId}) with amount ${amount}`);
        } catch (trackingError) {
          console.error('[CREDIT_TRACKING] Failed to track expert earning:', trackingError);
        }
      }
      // ---------------------------

      await queryRunner.commitTransaction();

      // Notifications follow commit
      if (purpose === TransactionPurpose.RECHARGE) {
        const title = 'Wallet Recharged';
        const message = `Your wallet has been credited with ₹${amount}`;

        await this.notificationFacade.create(
          userId,
          NotificationType.WALLET_RECHARGE,
          title,
          message,
          { amount, referenceId },
        );

        this.notificationGateway.emitToUser(userId, 'wallet_updated', {
          type: 'credit',
          amount,
          title,
          message,
        });
      }

      return wallet;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
