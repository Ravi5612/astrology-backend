import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { Role } from '@/modules/role/entities/roles.entity';

@Injectable()
export class GetAgentsUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  async execute(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.agent_profile', 'agent_profile')
      .where('role.name = :roleName', { roleName: 'agent' });

    if (params.search) {
      qb.andWhere(
        '(LOWER(user.name) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(agent_profile.phone) LIKE :search)',
        { search: `%${params.search.toLowerCase()}%` },
      );
    }

    if (params.status) {
        // Status can be based on is_blocked or other criteria
        if (params.status === 'active') {
            qb.andWhere('user.is_blocked = :blocked', { blocked: false });
        } else if (params.status === 'blocked') {
            qb.andWhere('user.is_blocked = :blocked', { blocked: true });
        }
    }

    qb.orderBy('user.created_at', 'DESC');
    qb.skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users.map(u => ({
        id: u.id,
        agent_id: u.uid,
        name: u.name,
        email: u.email,
        phone: u.agent_profile?.phone || null,
        avatar: u.avatar,
        status: u.is_blocked ? 'blocked' : 'active',
        createdAt: u.created_at,
        commission_rate: u.agent_profile?.commission_rate || 10.00,
        total_earned: u.agent_profile?.total_earnings || 0,
        total_listings: u.agent_profile?.total_registrations || 0,
        pending_payout: 0,
        kyc: {
            aadhaar_no: u.agent_profile?.aadhaar_no,
            pan_no: u.agent_profile?.pan_no,
            aadhaar_doc: u.agent_profile?.aadhaar_doc,
            pan_doc: u.agent_profile?.pan_doc,
        },
        address: {
            address: u.agent_profile?.address,
            city: u.agent_profile?.city,
            state: u.agent_profile?.state,
        }
      })),
      total,
      page,
      limit,
    };
  }
}
