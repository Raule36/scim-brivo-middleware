import { BrivoApiClient, BrivoFilter } from '@brivo/application';
import {
  BrivoGroupDto,
  BrivoGroupWithMembersDto,
  BrivoListDto,
  BrivoUserDto,
  CreateBrivoGroupDto,
  CreateBrivoUserDto,
  UpdateBrivoGroupDto,
} from '@brivo/contracts';
import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';

import { BrivoConfig, brivoConfig } from '../config';
import { BrivoBaseHttpClient } from './brivo-base-http.client';
import { BrivoOAuthService } from './brivo-oauth.service';

export class BrivoHttpClient extends BrivoBaseHttpClient implements BrivoApiClient {
  constructor(
    httpService: HttpService,
    @Inject(brivoConfig.KEY)
    config: BrivoConfig,
    oauthService: BrivoOAuthService,
  ) {
    super(httpService, config, oauthService);
  }

  public async getUsers(
    offset?: number,
    pageSize?: number,
    filter?: BrivoFilter,
  ): Promise<BrivoListDto<BrivoUserDto>> {
    return this.get<BrivoListDto<BrivoUserDto>>('/users', {
      params: {
        offset,
        pageSize,
        filter: filter?.toQueryString(),
      },
    });
  }

  public getUser(id: number): Promise<BrivoUserDto> {
    return this.get<BrivoUserDto>(`/users/${id}`);
  }

  public updateUser(id: number, dto: Partial<BrivoUserDto>): Promise<BrivoUserDto> {
    return this.put<BrivoUserDto>(`/users/${id}`, dto);
  }

  public createUser(dto: CreateBrivoUserDto): Promise<BrivoUserDto> {
    return this.post<BrivoUserDto>('/users', dto);
  }

  public deleteUser(id: number): Promise<void> {
    return this.delete(`/users/${id}`);
  }

  public async getGroups(
    offset?: number,
    pageSize?: number,
    filter?: BrivoFilter,
  ): Promise<BrivoListDto<BrivoGroupWithMembersDto>> {
    const groupList = await this.get<BrivoListDto<BrivoGroupDto>>('/groups', {
      params: {
        offset,
        pageSize,
        filter: filter?.toQueryString(),
      },
    });

    const groupsWithMembers = await Promise.all(
      groupList.data.map(async (group) => this.enrichGroupWithMembers(group)),
    );

    return {
      ...groupList,
      data: groupsWithMembers,
    };
  }

  public async getGroup(id: number): Promise<BrivoGroupWithMembersDto> {
    const group = await this.get<BrivoGroupDto>(`/groups/${id}`);
    return this.enrichGroupWithMembers(group);
  }

  public async updateGroup(
    id: number,
    dto: UpdateBrivoGroupDto,
  ): Promise<BrivoGroupWithMembersDto> {
    const group = await this.put<BrivoGroupDto>(`/groups/${id}`, dto);
    return this.enrichGroupWithMembers(group);
  }

  public async createGroup(dto: CreateBrivoGroupDto): Promise<BrivoGroupWithMembersDto> {
    const group = await this.post<BrivoGroupDto>('/groups', dto);
    return this.enrichGroupWithMembers(group);
  }

  public deleteGroup(id: number): Promise<void> {
    return this.delete(`/groups/${id}`);
  }

  public addUserToGroup(groupId: number, userId: number): Promise<void> {
    return this.put(`/groups/${groupId}/users/${userId}`);
  }

  public removeUserFromGroup(groupId: number, userId: number): Promise<void> {
    return this.delete(`/groups/${groupId}/users/${userId}`);
  }

  private async enrichGroupWithMembers(group: BrivoGroupDto): Promise<BrivoGroupWithMembersDto> {
    const membersResponse = await this.getGroupMembers(group.id);
    return {
      ...group,
      members: membersResponse.data,
    };
  }

  private getGroupMembers(
    groupId: number,
    offset?: number,
    pageSize?: number,
  ): Promise<BrivoListDto<BrivoUserDto>> {
    const params: Record<string, number | undefined> = {
      offset,
      pageSize,
    };

    return this.get<BrivoListDto<BrivoUserDto>>(`/groups/${groupId}/users`, { params });
  }
}
