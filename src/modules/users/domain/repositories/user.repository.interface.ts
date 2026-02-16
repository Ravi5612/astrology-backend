import { User } from '../../infrastructure/persistence/entities/user.entity';
import { QueryRunner } from 'typeorm';

// For now, we are skipping a pure domain interface and using the TypeORM repository directly in the infrastructure service,
// but we should define the contract.
// However, looking at the auth module, they use a Repository class in infrastructure that extends BaseService.
// Let's follow that pattern.

export interface UserRepository {
    create(data: Partial<User>, queryRunner?: QueryRunner): Promise<User>;
    findAll(queryRunner?: QueryRunner): Promise<User[]>;
    findByEmail(email: string, queryRunner?: QueryRunner): Promise<User | null>;
    findByEmailWithPassword(email: string, queryRunner?: QueryRunner): Promise<User | null>;
    findById(id: number, all?: boolean, queryRunner?: QueryRunner): Promise<User | null>;
    update(id: number, data: Partial<User>, queryRunner?: QueryRunner): Promise<User>;
    delete(id: number, queryRunner?: QueryRunner): Promise<void>;
}
