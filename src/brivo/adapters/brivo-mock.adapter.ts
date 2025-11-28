import { Injectable } from '@nestjs/common';

import { BrivoClient, BrivoFilter } from '../interfaces';
import {
  BrivoGroupWithMembersDto,
  BrivoListDto,
  BrivoUserDto,
  CreateBrivoGroupDto,
  CreateBrivoUserDto,
  UpdateBrivoGroupDto,
} from '../interfaces/dto';
import { BrivoGroupRepository, BrivoUserRepository } from '../interfaces/repositories';

@Injectable()
export class BrivoMockAdapter implements BrivoClient {
  constructor(
    private readonly userRepository: BrivoUserRepository,
    private readonly groupRepository: BrivoGroupRepository,
  ) {}

  public createUser(dto: CreateBrivoUserDto): Promise<BrivoUserDto> {
    return this.userRepository.create(dto);
  }

  public updateUser(id: number, dto: Partial<BrivoUserDto>): Promise<BrivoUserDto> {
    return this.userRepository.update(id, dto);
  }

  public deleteUser(id: number): Promise<void> {
    return this.userRepository.delete(id);
  }

  public getUser(id: number): Promise<BrivoUserDto | null> {
    return this.userRepository.findById(id);
  }

  public async getUsers(
    offset = 1,
    pageSize = 100,
    filter?: BrivoFilter,
  ): Promise<BrivoListDto<BrivoUserDto>> {
    const { total, items } = await this.userRepository.findAll(
      Math.min(offset - 1, 0),
      pageSize,
      filter,
    );
    return {
      offset: offset,
      pageSize,
      count: total,
      data: items,
    };
  }

  public createGroup(dto: CreateBrivoGroupDto): Promise<BrivoGroupWithMembersDto> {
    return this.groupRepository.create(dto);
  }

  public deleteGroup(id: number): Promise<void> {
    return this.groupRepository.delete(id);
  }

  public getGroup(id: number): Promise<BrivoGroupWithMembersDto | null> {
    return this.groupRepository.findById(id);
  }

  public async getGroups(
    offset = 1,
    pageSize = 100,
    filter?: BrivoFilter,
  ): Promise<BrivoListDto<BrivoGroupWithMembersDto>> {
    const { total, items } = await this.groupRepository.findAll(
      Math.min(offset - 1, 0),
      pageSize,
      filter,
    );
    return {
      offset: offset,
      pageSize,
      count: total,
      data: items,
    };
  }

  public updateGroup(id: number, dto: UpdateBrivoGroupDto): Promise<BrivoGroupWithMembersDto> {
    return this.groupRepository.update(id, dto);
  }

  public addUserToGroup(groupId: number, userId: number): Promise<void> {
    return this.groupRepository.addMembers(groupId, [userId]);
  }

  public removeUserFromGroup(groupId: number, userId: number): Promise<void> {
    return this.groupRepository.removeMembers(groupId, [userId]);
  }
}
