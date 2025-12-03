import { BrivoModule } from '@brivo';
import { Module } from '@nestjs/common';
import { GroupProvisioningPort, UserProvisioningPort } from '@scim/application';
import { ScimGroupService, ScimUserService } from '@scim/application';
import {
  BrivoFilterMapper,
  BrivoGroupAdapter,
  BrivoGroupMapper,
  BrivoUserAdapter,
  BrivoUserMapper,
} from '@scim/infrastructure';
import { ScimGroupController, ScimUserController } from '@scim/presentation';

import { ScimBasicAuthGuard } from './presentation/guards';

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
