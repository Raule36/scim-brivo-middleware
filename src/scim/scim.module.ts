import { BrivoModule } from '@brivo/brivo.module';
import { ScimBasicAuthGuard } from '@common/guards';
import { Module, Type } from '@nestjs/common';
import { ScimBrivoFilterMapper } from '@scim/mappers';

import * as controllers from './controllers';
import { ScimGroupService, ScimUserService } from './services';

@Module({
  imports: [BrivoModule],
  controllers: Array.from(Object.values(controllers)) as unknown as Type[],
  providers: [ScimBasicAuthGuard, ScimUserService, ScimBrivoFilterMapper, ScimGroupService],
})
export class ScimModule {}
