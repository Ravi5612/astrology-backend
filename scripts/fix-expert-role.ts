import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/modules/users/infrastructure/persistence/entities/user.entity';
import { Role } from '../src/modules/role/entities/roles.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const userId = 133;
    const user = await queryRunner.manager.findOne(User, {
      where: { id: userId },
      relations: ['roles']
    });

    if (!user) {
      console.log(`User ${userId} not found.`);
      return;
    }

    console.log(`Current roles for user ${userId}:`, user.roles.map(r => r.name));

    let expertRole = await queryRunner.manager.findOne(Role, { where: { name: 'expert' } });
    if (!expertRole) {
      expertRole = queryRunner.manager.create(Role, { name: 'expert' });
      await queryRunner.manager.save(expertRole);
    }

    if (!user.roles.find(r => r.name === 'expert')) {
      user.roles.push(expertRole);
      await queryRunner.manager.save(user);
      console.log(`Expert role successfully added to User ${userId}.`);
    } else {
      console.log(`User ${userId} already has the expert role.`);
    }

  } catch (error) {
    console.error('Error fixing roles:', error);
  } finally {
    await queryRunner.release();
    await app.close();
  }
}

bootstrap();
