// src/users/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
  BeforeInsert,
  AfterInsert,
} from 'typeorm';
import { OAuthAccount } from '../../auth/infrastructure/persistence/entities/oauth-accounts.entity';
import { Credential } from '../../auth/infrastructure/persistence/entities/credential.entity';
import { Role } from '@/modules/role/entities/roles.entity';
import { Exclude } from 'class-transformer';
import { ProfileClient } from '@/modules/client/profile/entities/profile-client.entity';
import { ProfileExpert } from '../../expert/profile/entities/profile-expert.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  @Exclude()
  password?: string; // argon2 hash

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  email_verified_at: Date | null;

  @Column({ nullable: true })
  name?: string;

  @ManyToMany(() => Role, (r) => r.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => OAuthAccount, (oa) => oa.user)
  oauthAccounts: OAuthAccount[];

  @OneToMany(() => Credential, (c) => c.user)
  credentials: Credential[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => ProfileClient, (p) => p.user, { cascade: true })
  profile_client?: ProfileClient;

  @OneToOne(() => ProfileExpert, (p) => p.user, { cascade: true })
  profile_expert?: ProfileExpert;
}
