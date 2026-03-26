import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { Role } from '@/modules/role/entities/roles.entity';

@Injectable()
export class GetAgentStatsUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  async execute() {
    const agentRole = await this.roleRepository.findOne({ where: { name: 'agent' } });
    if (!agentRole) return { totalAgents: 0, activeAgents: 0, blockedAgents: 0 };

    const totalAgents = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role', 'role.id = :roleId', { roleId: agentRole.id })
      .getCount();

    const activeAgents = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role', 'role.id = :roleId', { roleId: agentRole.id })
      .where('user.is_blocked = :blocked', { blocked: false })
      .getCount();

    const blockedAgents = totalAgents - activeAgents;

    return {
      totalAgents,
      activeAgents,
      blockedAgents,
      totalListings: 0, // Will be implemented with commission logic later
      pendingPayouts: 0, // Will be implemented with payout logic later
      pendingApproval: 0,
    };
  }
}
