import { Injectable } from '@nestjs/common';
import {
  CreateScimUserDto,
  PatchOperationDto,
  PatchUserDto,
  ScimUserDto,
  ScimUserListDto,
  UpdateScimUserDto,
} from '@scim/contracts';

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

  public async patch(id: string, dto: PatchUserDto): Promise<ScimUserDto> {
    const existingUser = await this.userProvisioning.findById(id);

    for (const operation of dto.Operations ?? []) {
      if (operation.op === 'replace') {
        await this.handleReplaceOperation(id, existingUser, operation);
      }
    }

    return this.userProvisioning.findById(id);
  }

  private async handleReplaceOperation(
    id: string,
    existingUser: ScimUserDto,
    operation: PatchOperationDto,
  ): Promise<void> {
    const value = operation.value as Record<string, unknown>;

    if (value && 'active' in value) {
      const updateDto: UpdateScimUserDto = {
        ...this.toUpdateDto(existingUser),
        active: value.active as boolean,
      };
      await this.userProvisioning.update(id, updateDto);
    }
  }

  private toUpdateDto(user: ScimUserDto): UpdateScimUserDto {
    return {
      schemas: user.schemas,
      userName: user.userName,
      displayName: user.displayName,
      name: user.name,
      emails: user.emails,
      active: user.active,
      groups: user.groups,
    };
  }

  public delete(id: string): Promise<void> {
    return this.userProvisioning.delete(id);
  }
}
