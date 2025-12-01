import {
  CreateScimGroupDto,
  ScimGroupDto,
  ScimGroupListDto,
  UpdateScimGroupDto,
} from '@scim/contracts';

export abstract class GroupProvisioningPort {
  abstract findAll(startIndex: number, count: number, filter?: string): Promise<ScimGroupListDto>;
  abstract findById(id: string): Promise<ScimGroupDto>;
  abstract create(dto: CreateScimGroupDto): Promise<ScimGroupDto>;
  abstract update(id: string, dto: UpdateScimGroupDto): Promise<ScimGroupDto>;
  abstract delete(id: string): Promise<void>;
}
