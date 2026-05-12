// src/auth/oauth-account.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/modules/users/infrastructure/entities/user.entity';

@Entity('oauth_accounts')
export class OAuthAccount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({type: 'character varying', length: 255})
  provider!: string;

  @Column({type: 'character varying', length: 255})
  provider_id!: string;

  @Column({ nullable: true, type: 'text' })
  email!: string | null;

  @ManyToOne(() => User, (u) => u.oauth_accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
