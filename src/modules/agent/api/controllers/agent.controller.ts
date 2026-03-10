import { Controller, Get, UseGuards, Patch, Body, Post, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/api/guards/auth.guard';
import { RolesGuard } from '@/modules/auth/api/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { AgentProfile } from '../../infrastructure/persistence/entities/agent-profile.entity';
import { DatabaseService } from '@/core/database/database.service';

@Controller({
    path: 'agent',
    version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('agent')
export class AgentController {
    constructor(private readonly db: DatabaseService) { }

    @Get('profile')
    async getProfile(@CurrentUser() user: User) {
        const profile = await this.db.transaction(async (queryRunner) => {
            return queryRunner.manager.findOne(AgentProfile, {
                where: { user_id: user.id },
                relations: ['user'] as any
            });
        });
        return profile;
    }

    @Patch('profile')
    async updateProfile(
        @CurrentUser() user: User,
        @Body() body: any
    ) {
        await this.db.transaction(async (queryRunner) => {
            await queryRunner.manager.update(AgentProfile, { user_id: user.id }, {
                bank_name: body.bank_name,
                account_number: body.account_number,
                ifsc_code: body.ifsc_code,
            });
        });
        return { success: true };
    }

    @Get('dashboard/stats')
    async getStats(@CurrentUser() user: User) {
        const stats = await this.db.transaction(async (queryRunner) => {
            const profile = await queryRunner.manager.findOne(AgentProfile, {
                where: { user_id: user.id }
            });

            // Count experts referred by this agent
            const totalExperts = await queryRunner.manager.count(User, {
                where: { referred_by_id: user.id }
            });

            return {
                totalListings: totalExperts,
                activeListings: totalExperts, // Simulating for now
                pendingPayouts: 0,
                totalEarnings: profile?.total_earnings || 0,
                recentActivity: []
            };
        });
        return stats;
    }

    @Get('listings')
    async getListings(
        @CurrentUser() user: User,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 50,
        @Query('type') type?: string,
        @Query('search') search?: string,
    ) {
        const listings = await this.db.transaction(async (queryRunner) => {
            const qb = queryRunner.manager
                .createQueryBuilder(User, 'u')
                .leftJoinAndSelect('u.roles', 'role')
                .leftJoinAndSelect('u.profile_expert', 'pe')
                .leftJoinAndSelect('u.profile_client', 'pc')
                .where('u.referred_by_id = :agentId', { agentId: user.id });

            // Filter by role/type
            if (type === 'astrologer') {
                qb.andWhere('role.name = :role', { role: 'expert' });
            } else if (type === 'client') {
                qb.andWhere('role.name = :role', { role: 'user' });
            }

            // Search by name / email
            if (search && search.trim()) {
                qb.andWhere(
                    '(LOWER(u.name) LIKE :search OR LOWER(u.email) LIKE :search)',
                    { search: `%${search.trim().toLowerCase()}%` }
                );
            }

            qb.orderBy('u.created_at', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);

            const [users, total] = await qb.getManyAndCount();

            return {
                data: users.map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    phone: (u as any).profile_client?.phone ?? (u as any).profile_expert?.phone ?? null,
                    status: 'active',
                    type: u.roles.some(r => r.name === 'expert') ? 'astrologer' : 'client',
                    createdAt: u.created_at,
                    avatar: u.avatar ?? null,
                })),
                total,
                page,
                limit
            };
        });
        return listings;
    }
}
