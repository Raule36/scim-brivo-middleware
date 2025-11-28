import { BrivoClient, BrivoFilter } from '@brivo/interfaces';
import { BrivoGroupWithMembersDto, BrivoListDto, BrivoUserDto } from '@brivo/interfaces/dto';
import { Injectable } from '@nestjs/common';
import { ScimBrivoFilterMapper, ScimBrivoGroupMapper, ScimBrivoUserMapper } from '@scim/mappers';

import { ScimNotFoundException } from '../exceptions/scim-exception';
import {
  CreateScimGroupDto,
  ScimGroupDto,
  ScimListDto,
  UpdateScimGroupDto,
} from '../interfaces/dto';

@Injectable()
export class ScimGroupService {
  constructor(
    private readonly brivoClient: BrivoClient,
    private readonly scimBrivoFilterMapper: ScimBrivoFilterMapper,
  ) {}

  public async getAll(startIndex = 1, count = 100, filter?: string): Promise<ScimListDto> {
    const brivoFilter: BrivoFilter | undefined = this.scimBrivoFilterMapper.mapFromString(filter);
    const brivoGroupList: BrivoListDto<BrivoGroupWithMembersDto> = await this.brivoClient.getGroups(
      startIndex,
      count,
      brivoFilter,
    );
    const scimGroups: ScimGroupDto[] = ScimBrivoGroupMapper.toScimList(brivoGroupList.data);

    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: brivoGroupList.count,
      Resources: scimGroups,
      startIndex,
      itemsPerPage: brivoGroupList.pageSize,
    } as ScimListDto;
  }

  public async getById(id: string): Promise<ScimGroupDto> {
    const brivoGroup: BrivoGroupWithMembersDto = await this.findBrivoGroupOrThrow(id);
    return ScimBrivoGroupMapper.toScim(brivoGroup);
  }

  public async create(dto: CreateScimGroupDto): Promise<ScimGroupDto> {
    const created: BrivoGroupWithMembersDto = await this.brivoClient.createGroup(
      ScimBrivoGroupMapper.toCreateBrivo(dto),
    );
    return ScimBrivoGroupMapper.toScim(created);
  }

  public async update(id: string, dto: UpdateScimGroupDto): Promise<ScimGroupDto> {
    const brivoId = ScimBrivoUserMapper.parseBrivoId(id);
    const brivoGroup: BrivoGroupWithMembersDto = await this.findBrivoGroupOrThrow(id);
    const brivoGroupMemberIds = (brivoGroup.members || []).map((member) => member.id);

    if ('displayName' in dto) {
      await this.brivoClient.updateGroup(
        brivoId,
        ScimBrivoGroupMapper.toCreateBrivo(dto as CreateScimGroupDto),
      );
    }

    if (dto.members) {
      const scimGroupMemberIds = dto.members.map((el) =>
        ScimBrivoUserMapper.parseBrivoId(el.value),
      );

      const addMembers = scimGroupMemberIds.filter((id) => !brivoGroupMemberIds.includes(id));

      const removeMembers = brivoGroupMemberIds.filter((id) => !scimGroupMemberIds.includes(id));

      await Promise.all([
        ...addMembers.map((id) => this.brivoClient.addUserToGroup(brivoId, id)),
        ...removeMembers.map((id) => this.brivoClient.removeUserFromGroup(brivoId, id)),
      ]);
    }

    const updated = await this.findBrivoGroupOrThrow(id);
    return ScimBrivoGroupMapper.toScim(updated);
  }

  public async delete(id: string): Promise<void> {
    return this.brivoClient.deleteGroup(ScimBrivoUserMapper.parseBrivoId(id));
  }

  private async findBrivoGroupOrThrow(id: string): Promise<BrivoGroupWithMembersDto> {
    const brivoId = ScimBrivoUserMapper.parseBrivoId(id);

    const brivoGroup = await this.brivoClient.getGroup(brivoId);
    if (!brivoGroup) {
      throw new ScimNotFoundException(`User with id ${id} not found`);
    }

    return brivoGroup;
  }
}
