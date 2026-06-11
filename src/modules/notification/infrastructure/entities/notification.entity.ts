import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/modules/users/infrastructure/entities/user.entity';
import { UuidPrimaryKeyColumn } from '@/common/decorators/primary-key.decorator';

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_PLACED = 'order_placed',
  ORDER_PACKED = 'order_packed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  WALLET_RECHARGE = 'wallet_recharge',
  PUJA_BOOKING = 'puja_booking',
  GENERAL = 'general',
}

@Entity({ schema: 'support', name: 'notifications' })
export class Notification {
  @UuidPrimaryKeyColumn()
  id!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  user_id!: string | null;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERAL,
    nullable: true,
  })
  type!: NotificationType | null;

  @Column({ type: 'character varying', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'is_read', default: false })
  is_read!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown>; // orderId, etc.

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;
}
