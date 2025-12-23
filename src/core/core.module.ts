import { DynamicModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as bodyParser from 'body-parser';

@Module({})
export class CoreModule {
  static forRoot(): DynamicModule {
    return {
      module: CoreModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            host: config.get('DB_HOST'),
            port: config.get('DB_PORT'),
            username: config.get('DB_USER'),
            password: config.get('DB_PASSWORD'),
            database: config.get('DB_NAME'),
            autoLoadEntities: true,
            synchronize: true,
            logging: true,
            ssl: { rejectUnauthorized: false },
          }),
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
