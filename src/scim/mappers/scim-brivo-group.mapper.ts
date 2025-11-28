import { BrivoGroupWithMembersDto, CreateBrivoGroupDto } from '@brivo/interfaces/dto';

import { CreateScimGroupDto, ScimGroupDto, ScimGroupMemberDto } from '../interfaces/dto';

export class ScimBrivoGroupMapper {
  static toScim(brivoGroup: BrivoGroupWithMembersDto): ScimGroupDto {
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

  static toScimList(brivoGroups: BrivoGroupWithMembersDto[]): ScimGroupDto[] {
    return brivoGroups.map((group) => this.toScim(group));
  }

  static toCreateBrivo(dto: CreateScimGroupDto): CreateBrivoGroupDto {
    return {
      name: dto.displayName,
    };
  }
}
