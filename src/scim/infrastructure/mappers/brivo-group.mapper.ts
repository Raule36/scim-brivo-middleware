import { BrivoGroupWithMembersDto, CreateBrivoGroupDto } from '@brivo/interfaces/dto';
import { Injectable } from '@nestjs/common';

import { CreateScimGroupDto, ScimGroupDto, ScimGroupMemberDto } from '../../contracts/dto';

@Injectable()
export class BrivoGroupMapper {
  public toScim(brivoGroup: BrivoGroupWithMembersDto): ScimGroupDto {
    const groupId = brivoGroup.id.toString();

    const members: ScimGroupMemberDto[] = brivoGroup.members
      ? brivoGroup.members.map((member) => ({
          value: member.id.toString(),
          type: 'User' as const,
        }))
      : [];

    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
      id: groupId,
      displayName: brivoGroup.name,
      externalId: undefined,
      members: members.length > 0 ? members : undefined,
    };
  }

  public toScimList(brivoGroups: BrivoGroupWithMembersDto[]): ScimGroupDto[] {
    return brivoGroups.map((group) => this.toScim(group));
  }

  public toCreateBrivo(dto: CreateScimGroupDto): CreateBrivoGroupDto {
    return {
      name: dto.displayName,
    };
  }
}
