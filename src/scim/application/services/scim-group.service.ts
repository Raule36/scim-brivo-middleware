import { Injectable } from '@nestjs/common';

import {
  CreateScimGroupDto,
  ScimGroupDto,
  ScimGroupListDto,
  UpdateScimGroupDto,
} from '../../contracts/dto';
import { GroupProvisioningPort } from '../ports';

@Injectable()
export class ScimGroupService {
  constructor(private readonly groupProvisioning: GroupProvisioningPort) {}

  public getAll(startIndex = 1, count = 100, filter?: string): Promise<ScimGroupListDto> {
    return this.groupProvisioning.findAll(startIndex, count, filter);
  }

  public getById(id: string): Promise<ScimGroupDto> {
    return this.groupProvisioning.findById(id);
  }

  public create(dto: CreateScimGroupDto): Promise<ScimGroupDto> {
    return this.groupProvisioning.create(dto);
  }

  public update(id: string, dto: UpdateScimGroupDto): Promise<ScimGroupDto> {
    return this.groupProvisioning.update(id, dto);
  }

  public delete(id: string): Promise<void> {
    return this.groupProvisioning.delete(id);
  }
}
