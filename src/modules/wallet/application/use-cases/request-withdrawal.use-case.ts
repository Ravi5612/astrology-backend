
import { Injectable, BadRequestException, ConflictException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { Withdrawal, WithdrawalStatus } from '../../infrastructure/entities/withdrawal.entity';
import { Transaction, TransactionType, TransactionPurpose } from '../../infrastructure/entities/transaction.entity';
import { Wallet } from '../../infrastructure/entities/wallet.entity';
import { Idempotency } from '../../infrastructure/entities/idempotency.entity';
import { SystemSetting } from '@/modules/admin/infrastructure/entities/system-setting.entity';
import { NotificationFacade } from '@/modules/notification/application/notification.facade';
import { NotificationType } from '@/modules/notification/infrastructure/entities/notification.entity';
import { hasRoles } from '@/modules/users/infrastructure/enums/Role.enum';
import { AdminFacade } from '@/modules/admin/application/admin.facade';
import { UsersFacade } from '@/modules/users/application/users.facade';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';
import { MerchantProfileFacade } from '@/modules/merchant/profile/application/profile.facade';
import { AgentFacade } from '@/modules/agent/application/agent.facade';

@Injectable()
export class RequestWithdrawalUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationFacade: NotificationFacade,
    @Inject(forwardRef(() => AdminFacade))
    private readonly adminFacade: AdminFacade,
    private readonly usersFacade: UsersFacade,
    @Inject(forwardRef(() => ExpertProfileFacade))
    private readonly expertFacade: ExpertProfileFacade,
    @Inject(forwardRef(() => MerchantProfileFacade))
    private readonly merchantFacade: MerchantProfileFacade,
    @Inject(forwardRef(() => AgentFacade))
    private readonly agentFacade: AgentFacade,
  ) { }

  async execute(
    userId: string,
    amount: number,
    bank_account_id?: string | number,
    idempotencyKey?: string,
    securityMetadata?: { ip?: string; ua?: string },
  ) {
    // 1. Idempotency Check (Pre-transaction)
    const currentPayloadHash = crypto.createHash('sha256')
      .update(JSON.stringify({ amount, bank_account_id }))
      .digest('hex');

    if (idempotencyKey) {
      const existingRequest = await this.dataSource.getRepository(Idempotency).findOne({
        where: { key: idempotencyKey }
      });

      if (existingRequest) {
        if (existingRequest.payload_hash !== currentPayloadHash) {
          throw new ConflictException('Idempotency Key Conflict: This key was previously used with a different amount or bank account.');
        }
        return existingRequest.response_payload;
      }
    }

    // 2. Basic Validations
    if (isNaN(amount) || amount <= 0)
      throw new BadRequestException('Please enter a valid withdrawal amount');

    // Fetch Security Settings using AdminFacade
    const keys = ['MIN_WITHDRAWAL', 'DAILY_WITHDRAWAL_LIMIT', 'MAX_SINGLE_WITHDRAWAL', 'MONTHLY_WITHDRAWAL_COUNT'];
    const dbSettings = await this.adminFacade.getSystemSettings(keys);

    const getSetting = (key: string, defaultValue: number) => {
      const s = dbSettings.find(x => x.key === key);
      return s ? Number(s.value) : defaultValue;
    };

    const MIN_WITHDRAWAL = getSetting('MIN_WITHDRAWAL', 500);
    const DAILY_LIMIT = getSetting('DAILY_WITHDRAWAL_LIMIT', 10000);
    const MAX_SINGLE_WITHDRAWAL = getSetting('MAX_SINGLE_WITHDRAWAL', 5000);
    const MAX_MONTHLY_COUNT = getSetting('MONTHLY_WITHDRAWAL_COUNT', 2);

    if (amount < MIN_WITHDRAWAL)
      throw new BadRequestException(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}`);

    if (amount > MAX_SINGLE_WITHDRAWAL)
      throw new BadRequestException(`Maximum single withdrawal limit is ₹${MAX_SINGLE_WITHDRAWAL}. Please contact support for larger amounts.`);

    // 2.1 KYC / Verification Check
    const user = await this.usersFacade.findById(userId);

    if (!user) throw new BadRequestException('User not found');
    const roles = user.roles || [];

    let walletOwnerId = '';
    let ownerIdField = '';

    if (hasRoles(roles, 'EXPERT')) {
      const profile_expert = await this.expertFacade.getExpertByUserId(userId);
      if (profile_expert?.kyc_status !== 'approved') {
        throw new BadRequestException('Your KYC is not approved. Please complete verification to withdraw funds.');
      }
      walletOwnerId = profile_expert.id;
      ownerIdField = 'w.expert_id';
    } else if (hasRoles(roles, 'MERCHANT')) {
      const profile_merchant = await this.merchantFacade.getProfileByUserId(userId);
      if (profile_merchant?.status !== 'active' && !profile_merchant?.isVerified) {
        throw new BadRequestException('Your merchant account is not active or verified. Please contact support.');
      }
      walletOwnerId = profile_merchant.id;
      ownerIdField = 'w.merchant_id';
    } else if (hasRoles(roles, 'AGENT')) {
      const agent_profile = await this.agentFacade.getProfile(userId);
      if (!agent_profile?.pan_no || !agent_profile?.bank_name) {
        throw new BadRequestException('Please complete your agent profile and bank details to withdraw funds.');
      }
      walletOwnerId = agent_profile.id;
      ownerIdField = 'w.agent_profile_id';
    } else {
        throw new BadRequestException('Clients cannot request withdrawals directly.');
    }

    // 3. Limit Checks (Read-only)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTotal = await this.dataSource.getRepository(Withdrawal)
      .createQueryBuilder('w')
      .where(`${ownerIdField} = :walletOwnerId`, { walletOwnerId })
      .andWhere('w.created_at >= :today', { today })
      .andWhere('w.status != :status', { status: WithdrawalStatus.REJECTED })
      .select('SUM(w.amount)', 'sum')
      .getRawOne();

    const currentTotal = Number(dailyTotal?.sum || 0);

    if (currentTotal + amount > DAILY_LIMIT) {
      throw new BadRequestException(`Daily withdrawal limit of ₹${DAILY_LIMIT} exceeded. You have already requested ₹${currentTotal} today.`);
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyCount = await this.dataSource.getRepository(Withdrawal)
      .createQueryBuilder('w')
      .where(`${ownerIdField} = :walletOwnerId`, { walletOwnerId })
      .andWhere('w.created_at >= :startOfMonth', { startOfMonth })
      .andWhere('w.status != :status', { status: WithdrawalStatus.REJECTED })
      .getCount();

    if (monthlyCount >= MAX_MONTHLY_COUNT) {
      throw new BadRequestException(`You have already reached the maximum limit of ${MAX_MONTHLY_COUNT} withdrawal requests for this month.`);
    }

    // 4. Start Atomic Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // A. Fetch Wallet with PESSIMISTIC LOCK
      let walletWhere: any = {};
      if (hasRoles(roles, 'EXPERT')) walletWhere = { expert_id: walletOwnerId };
      else if (hasRoles(roles, 'MERCHANT')) walletWhere = { merchant_id: walletOwnerId };
      else if (hasRoles(roles, 'AGENT')) walletWhere = { agent_id: walletOwnerId };

      const wallet = await queryRunner.manager.findOne(Wallet, {
          where: walletWhere,
          lock: { mode: 'pessimistic_write' }
      });


      if (!wallet) {
        throw new BadRequestException('Wallet not found for this user');
      }

      // B. Verify balance inside the locked transaction
      const balance_before = Number(wallet.balance);
      if (balance_before < amount) {
        throw new BadRequestException('Insufficient balance for withdrawal');
      }

      // C. Capture Snapshot of Bank Details (pre-fetched before transaction if needed, but doing safe read here)
      let merchantSnapshot: any = {};
      if (bank_account_id) {
        const merchant = await this.merchantFacade.getProfileByUserId(userId);
        
        if (merchant && merchant.bank_accounts && Array.isArray(merchant.bank_accounts)) {
          const acc = merchant.bank_accounts.find((a: any) => String(a.id) === String(bank_account_id));
          if (acc) {
            merchantSnapshot = {
              merchant_bank_name: acc.bank_name,
              merchant_account_number: acc.account_number,
              merchant_ifsc: acc.ifsc_code,
              merchant_account_holder: acc.account_holder
            };
          }
        }

        if (!merchantSnapshot.merchant_bank_name && bank_account_id) {
          const expertProfile = await this.expertFacade.getExpertByUserId(userId);
          if (expertProfile) {
            const bankAccount = await this.dataSource.getRepository('BankAccount').findOne({
              where: { id: bank_account_id as string, expert_id: expertProfile.id }
            }) as any;
            if (bankAccount) {
              merchantSnapshot = {
                merchant_bank_name: bankAccount.bank_name,
                merchant_account_number: bankAccount.account_number,
                merchant_ifsc: bankAccount.ifsc_code,
                merchant_account_holder: bankAccount.account_holder_name
              };
            }
          }
        }

        if (!merchantSnapshot.merchant_bank_name) throw new BadRequestException('Invalid bank account selected');
      } else {
        // Fallback to legacy profiles
        const merchant = await this.merchantFacade.getProfileByUserId(userId);

        if (merchant && merchant.bankName) {
            merchantSnapshot = {
                merchant_bank_name: merchant.bankName,
                merchant_account_number: merchant.accountNumber,
                merchant_ifsc: merchant.ifsc,
                merchant_account_holder: merchant.accountHolder || 'N/A'
            };
        } else {
            const agent = await this.agentFacade.getProfile(userId) as any;
            if (agent && agent.bank_name) {
                merchantSnapshot = {
                    merchant_bank_name: agent.bank_name,
                    merchant_account_number: agent.account_number,
                    merchant_ifsc: agent.ifsc_code,
                    merchant_account_holder: agent.account_holder || 'Agent'
                };
            } else {
                throw new BadRequestException('No bank details found. Please update your profile.');
            }
        }
      }

      // D. Debit Wallet
      wallet.balance = balance_before - amount;
      const balance_after = wallet.balance;
      await queryRunner.manager.save(wallet);

      // E. Create Transaction Record (Ledger)
      const transaction = queryRunner.manager.create(Transaction, {
        wallet_id: wallet.id,
        amount,
        type: TransactionType.DEBIT,
        purpose: TransactionPurpose.WITHDRAWAL,
        balance_before,
        balance_after,
      });
      await queryRunner.manager.save(transaction);

      // F. Create Withdrawal Record
      const HIGH_VALUE_THRESHOLD = 5000;
      
      let dbBankAccountId: string | null = null;
      if (bank_account_id) {
         dbBankAccountId = bank_account_id as string;
      }

      let withdrawalData: any = {
        amount,
        bank_account_id: dbBankAccountId,
        status: WithdrawalStatus.PENDING,
        ip_address: securityMetadata?.ip,
        user_agent: securityMetadata?.ua,
        is_high_value: amount >= HIGH_VALUE_THRESHOLD,
        ...merchantSnapshot,
      };

      if (wallet.expert_id) withdrawalData.expert_id = wallet.expert_id;
      else if (wallet.merchant_id) withdrawalData.merchant_id = wallet.merchant_id;
      else if (wallet.agent_id) withdrawalData.agent_profile_id = wallet.agent_id;

      const withdrawal = queryRunner.manager.create(Withdrawal, withdrawalData);
      await queryRunner.manager.save(withdrawal);

      // G. Generate Custom IDs (transaction_no and withdrawal_no)
      try {
        const { generateTransactionNo } = await import('../../../../common/utils/transaction-no.util');
        
        const rolePrefix = hasRoles(user.roles, 'EXPERT') ? 'EXPERT' : 
                           hasRoles(user.roles, 'MERCHANT') ? 'MERCHANT' : 
                           hasRoles(user.roles, 'AGENT') ? 'AGENT' : 'CLIENT';

        // Update Transaction No
        transaction.transaction_no = generateTransactionNo(rolePrefix, TransactionPurpose.WITHDRAWAL, transaction.id);
        await queryRunner.manager.save(transaction);

        // Update Withdrawal No
        withdrawal.withdrawal_no = generateTransactionNo(rolePrefix, TransactionPurpose.WITHDRAWAL, withdrawal.id);
        await queryRunner.manager.save(withdrawal);

        // Send instant notification
        await this.notificationFacade.create(
            userId,
            NotificationType.GENERAL,
            'Withdrawal Request Received',
            `A payout request of ₹${amount.toLocaleString('en-IN')} (${withdrawal.withdrawal_no}) has been submitted successfully. It is currently under review by our team.`,
            { withdrawalId: withdrawal.id, amount, status: 'pending' }
        );
      } catch (err) {
        console.error(`[RequestWithdrawal] FAILED to generate custom IDs:`, err);
      }

      // G. Save Idempotency
      if (idempotencyKey) {
        const idempotency = queryRunner.manager.create(Idempotency, {
          key: idempotencyKey,
          payload_hash: currentPayloadHash,
          response_payload: withdrawal,
        });
        await queryRunner.manager.save(idempotency);
      }

      await queryRunner.commitTransaction();
      return withdrawal;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}


