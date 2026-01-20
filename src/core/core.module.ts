import path from 'node:path';

import { DynamicModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import { validateEnv } from './config/env-root.config';

dotenv.config();

const validatedEnv = validateEnv(process.env as Record<string, unknown>);

const isProduction = validatedEnv.NODE_ENV === 'production';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: validatedEnv.DB_HOST,
  port: validatedEnv.DB_PORT,
  username: validatedEnv.DB_USER,
  password: validatedEnv.DB_PASSWORD,
  database: validatedEnv.DB_NAME,
  entities: [path.join(__dirname, '**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
  logging: !isProduction,
  ...(isProduction && {
    ssl: { rejectUnauthorized: false },
  }),
};

@Module({})
export class CoreModule {
  static forRoot(): DynamicModule {
    return {
      module: CoreModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
          validate: validateEnv,
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: () => {
            return {
              ...dataSourceOptions,
              autoLoadEntities: true,
              migrationsRun: true,
              synchronize: false,
            };
          },
        }),
      ],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        bodyParser.json({
          type: ['application/json', 'application/scim+json'],
        }),
        bodyParser.urlencoded({ extended: true }),
      )
      .forRoutes('*');
  }
}

export default new DataSource(dataSourceOptions);
