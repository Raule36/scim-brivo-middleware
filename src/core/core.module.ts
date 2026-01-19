import path from 'node:path';

import { DynamicModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import { validateEnv } from './config/env.schema';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [path.join(__dirname, '**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'core/migrations/*{.ts,.js}')],
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
