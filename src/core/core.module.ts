import { DynamicModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as bodyParser from 'body-parser';

import { validateEnv } from './config/env-root.config';
import AppDataSource from './data-source';

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
              ...AppDataSource.options,
              autoLoadEntities: true,
              migrationsRun: true,
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
