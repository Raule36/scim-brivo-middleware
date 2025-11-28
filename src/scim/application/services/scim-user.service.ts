import { Injectable } from '@nestjs/common';

import {
  CreateScimUserDto,
  ScimUserDto,
  ScimUserListDto,
  UpdateScimUserDto,
} from '../../contracts/dto';
import { UserProvisioningPort } from '../ports';

@Injectable()
export class ScimUserService {
  constructor(private readonly userProvisioning: UserProvisioningPort) {}

  public getAll(startIndex = 1, count = 100, filter?: string): Promise<ScimUserListDto> {
    return this.userProvisioning.findAll(startIndex, count, filter);
  }

  public getById(id: string): Promise<ScimUserDto> {
    return this.userProvisioning.findById(id);
  }

  public create(dto: CreateScimUserDto): Promise<ScimUserDto> {
    return this.userProvisioning.create(dto);
  }

  public update(id: string, dto: UpdateScimUserDto): Promise<ScimUserDto> {
    return this.userProvisioning.update(id, dto);
  }

  public delete(id: string): Promise<void> {
    return this.userProvisioning.delete(id);
  }
}
