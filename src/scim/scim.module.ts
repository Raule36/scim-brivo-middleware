import { BrivoModule } from '@brivo/brivo.module';
import { ScimBasicAuthGuard } from '@common/guards';
import { Module } from '@nestjs/common';

import { GroupProvisioningPort, UserProvisioningPort } from './application/ports';
import { ScimGroupService, ScimUserService } from './application/services';
import { BrivoGroupAdapter, BrivoUserAdapter } from './infrastructure';
import { BrivoFilterMapper, BrivoGroupMapper, BrivoUserMapper } from './infrastructure/mappers';
import { ScimGroupController, ScimUserController } from './presentation/controllers';

@Module({
  imports: [BrivoModule],
  controllers: [ScimUserController, ScimGroupController],
  providers: [
    ScimBasicAuthGuard,
    ScimUserService,
    BrivoFilterMapper,
    ScimGroupService,
    BrivoUserMapper,
    BrivoGroupMapper,
    {
      provide: UserProvisioningPort,
      useClass: BrivoUserAdapter,
    },
    {
      provide: GroupProvisioningPort,
      useClass: BrivoGroupAdapter,
    },
  ],
})
export class ScimModule {}
