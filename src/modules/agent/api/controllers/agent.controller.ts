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
        @Query('limit') limit: number = 10
    ) {
        const listings = await this.db.transaction(async (queryRunner) => {
            const [users, total] = await queryRunner.manager.findAndCount(User, {
                where: { referred_by_id: user.id },
                take: limit,
                skip: (page - 1) * limit,
                order: { created_at: 'DESC' } as any,
                relations: ['roles', 'profile_expert'] as any
            });

            return {
                data: users.map(u => ({
                    id: u.id,
                    name: u.name,
                    status: 'active',
                    type: u.roles.some(r => r.name === 'expert') ? 'astrologer' : 'client',
                    createdAt: u.created_at
                })),
                total,
                page,
                limit
            };
        });
        return listings;
    }
}
