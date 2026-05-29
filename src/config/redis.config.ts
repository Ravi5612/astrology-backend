import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  host: string;
  port: number;
}

export default registerAs('redis', (): RedisConfig => {
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  };
});
