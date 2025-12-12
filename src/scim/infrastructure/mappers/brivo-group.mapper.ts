import { BrivoGroupWithMembersDto, CreateBrivoGroupDto } from '@brivo/contracts';
import { Injectable } from '@nestjs/common';
import { CreateScimGroupDto, ScimGroupDto, ScimGroupMemberDto } from '@scim/contracts';

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

  public toCreateBrivo(dto: CreateScimGroupDto): CreateBrivoGroupDto {
    return {
      name: dto.displayName,
    };
  }
}
