import { BrivoGroupRepository, BrivoUserRepository } from '@brivo/application';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BrivoGroupEntity, BrivoUserEntity } from './entitites';
import { OrmBrivoGroupRepository, OrmBrivoUserRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([BrivoUserEntity, BrivoGroupEntity])],
  providers: [
    {
      provide: BrivoUserRepository,
      useClass: OrmBrivoUserRepository,
    },
    {
      provide: BrivoGroupRepository,
      useClass: OrmBrivoGroupRepository,
    },
  ],
  exports: [BrivoUserRepository, BrivoGroupRepository],
})
export class PersistenceModule {}
