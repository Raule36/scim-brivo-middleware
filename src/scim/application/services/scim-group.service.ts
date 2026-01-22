import { Injectable } from '@nestjs/common';
import {
  CreateScimGroupDto,
  PatchGroupDto,
  PatchOperationDto,
  ScimGroupDto,
  ScimGroupListDto,
  ScimGroupMemberDto,
  UpdateScimGroupDto,
} from '@scim/contracts';

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

  public async patch(id: string, dto: PatchGroupDto): Promise<ScimGroupDto> {
    const existingGroup = await this.groupProvisioning.findById(id);
    const currentMembers = existingGroup.members ?? [];

    let displayName = existingGroup.displayName;
    let members = [...currentMembers];

    for (const operation of dto.Operations ?? []) {
      switch (operation.op) {
        case 'add':
          members = this.handleAddOperation(members, operation);
          break;
        case 'replace':
          displayName = this.handleReplaceOperation(displayName, operation);
          break;
        case 'remove':
          members = this.handleRemoveOperation(members, operation);
          break;
      }
    }

    const updateDto: UpdateScimGroupDto = {
      schemas: existingGroup.schemas,
      displayName,
      members,
    };

    return this.groupProvisioning.update(id, updateDto);
  }

  private handleAddOperation(
    members: ScimGroupMemberDto[],
    operation: PatchOperationDto,
  ): ScimGroupMemberDto[] {
    if (operation.path !== 'members') {
      return members;
    }

    const newMembers = operation.value as Array<{ value: string; display?: string }>;
    const existingIds = new Set(members.map((m) => m.value));

    for (const member of newMembers) {
      if (!existingIds.has(member.value)) {
        members.push({ value: member.value, type: 'User' });
      }
    }

    return members;
  }

  private handleReplaceOperation(currentDisplayName: string, operation: PatchOperationDto): string {
    const value = operation.value as Record<string, unknown> | undefined;

    if (value && 'displayName' in value) {
      return value.displayName as string;
    }

    return currentDisplayName;
  }

  private handleRemoveOperation(
    members: ScimGroupMemberDto[],
    operation: PatchOperationDto,
  ): ScimGroupMemberDto[] {
    if (!operation.path?.startsWith('members')) {
      return members;
    }

    const memberIdToRemove = this.extractMemberIdFromPath(operation.path);

    if (memberIdToRemove) {
      return members.filter((m) => m.value !== memberIdToRemove);
    }

    return members;
  }

  private extractMemberIdFromPath(path: string): string | null {
    const match = path.match(/members\[value eq "(\d+)"\]/);
    return match ? match[1]! : null;
  }
}
