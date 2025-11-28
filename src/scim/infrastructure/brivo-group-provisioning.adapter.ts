import { BrivoClient } from '@brivo/interfaces';
import { BrivoGroupWithMembersDto, BrivoListDto } from '@brivo/interfaces/dto';
import { Injectable } from '@nestjs/common';
import { ScimBadRequestException, ScimNotFoundException } from '@scim/application/exceptions';

import { GroupProvisioningPort } from '../application/ports';
import {
  CreateScimGroupDto,
  ScimGroupDto,
  ScimGroupListDto,
  UpdateScimGroupDto,
} from '../contracts/dto';
import { BrivoFilterMapper, BrivoGroupMapper } from './mappers';

@Injectable()
export class BrivoGroupAdapter implements GroupProvisioningPort {
  constructor(
    private readonly brivoClient: BrivoClient,
    private readonly filterMapper: BrivoFilterMapper,
    private readonly groupMapper: BrivoGroupMapper,
  ) {}

  async findAll(startIndex: number, count: number, filter?: string): Promise<ScimGroupListDto> {
    const brivoFilter = this.filterMapper.fromScim(filter);
    const brivoGroupList: BrivoListDto<BrivoGroupWithMembersDto> = await this.brivoClient.getGroups(
      startIndex,
      count,
      brivoFilter,
    );

    const scimGroups = brivoGroupList.data.map((group) => this.groupMapper.toScim(group));

    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: brivoGroupList.count,
      Resources: scimGroups,
      startIndex,
      itemsPerPage: brivoGroupList.pageSize,
    };
  }

  async findById(id: string): Promise<ScimGroupDto> {
    const brivoGroup = await this.findBrivoGroupOrThrow(id);
    return this.groupMapper.toScim(brivoGroup);
  }

  async create(dto: CreateScimGroupDto): Promise<ScimGroupDto> {
    const brivoCreateDto = this.groupMapper.toCreateBrivo(dto);
    const createdGroup = await this.brivoClient.createGroup(brivoCreateDto);
    return this.groupMapper.toScim(createdGroup);
  }

  async update(id: string, dto: UpdateScimGroupDto): Promise<ScimGroupDto> {
    const brivoId = this.parseId(id);
    const existingGroup = await this.findBrivoGroupOrThrow(id);

    await this.updateGroupInfo(brivoId, dto);
    await this.syncGroupMembers(brivoId, existingGroup, dto);

    const updatedGroup = await this.findBrivoGroupOrThrow(id);
    return this.groupMapper.toScim(updatedGroup);
  }

  async delete(id: string): Promise<void> {
    const brivoId = this.parseId(id);
    await this.brivoClient.deleteGroup(brivoId);
  }

  private async updateGroupInfo(brivoId: number, dto: UpdateScimGroupDto): Promise<void> {
    if (!('displayName' in dto)) {
      return;
    }

    await this.brivoClient.updateGroup(brivoId, {
      name: dto.displayName!,
    });
  }

  private async syncGroupMembers(
    brivoId: number,
    existingGroup: BrivoGroupWithMembersDto,
    dto: UpdateScimGroupDto,
  ): Promise<void> {
    if (!dto.members) {
      return;
    }

    const currentMemberIds = (existingGroup.members || []).map((m) => m.id);
    const desiredMemberIds = dto.members.map((m) => this.parseId(m.value));

    const toAdd = desiredMemberIds.filter((id) => !currentMemberIds.includes(id));
    const toRemove = currentMemberIds.filter((id) => !desiredMemberIds.includes(id));

    await Promise.all([
      ...toAdd.map((userId) => this.brivoClient.addUserToGroup(brivoId, userId)),
      ...toRemove.map((userId) => this.brivoClient.removeUserFromGroup(brivoId, userId)),
    ]);
  }

  private async findBrivoGroupOrThrow(id: string): Promise<BrivoGroupWithMembersDto> {
    const brivoId = this.parseId(id);
    const brivoGroup = await this.brivoClient.getGroup(brivoId);

    if (!brivoGroup) {
      throw new ScimNotFoundException(`User with id ${id} not found`);
    }

    return brivoGroup;
  }

  private parseId(scimId: string): number {
    const brivoId = parseInt(scimId, 10);
    if (isNaN(brivoId)) {
      throw new ScimBadRequestException(`Invalid User id: ${scimId}`);
    }
    return brivoId;
  }
}
