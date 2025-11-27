import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BrivoUserRepository } from '../interfaces/repositories';
import { BrivoUserEntity } from './entitites';
import { OrmBrivoUserRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([BrivoUserEntity])],
  providers: [
    {
      provide: BrivoUserRepository,
      useClass: OrmBrivoUserRepository,
    },
  ],
  exports: [BrivoUserRepository],
})
export class PersistenceModule {}
