import 'reflect-metadata';

import path from 'node:path';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { validateEnv } from './config/env-root.config';

dotenv.config();

const validatedEnv = validateEnv(process.env as Record<string, unknown>);
const isProduction = validatedEnv.NODE_ENV === 'production';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: validatedEnv.DB_HOST,
  port: validatedEnv.DB_PORT,
  username: validatedEnv.DB_USER,
  password: validatedEnv.DB_PASSWORD,
  database: validatedEnv.DB_NAME,

  entities: [path.join(__dirname, '**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],

  logging: !isProduction,
  synchronize: false,

  ...(isProduction && {
    ssl: { rejectUnauthorized: false },
  }),
});

export default AppDataSource;
