import { BrivoApiClient } from '@brivo/application';
import { BrivoListDto, BrivoUserDto } from '@brivo/contracts';
import { Injectable } from '@nestjs/common';
import { ScimBadRequestException, ScimNotFoundException } from '@scim/application';
import { UserProvisioningPort } from '@scim/application';
import {
  CreateScimUserDto,
  ScimUserDto,
  ScimUserListDto,
  UpdateScimUserDto,
} from '@scim/contracts';

import { BrivoFilterMapper, BrivoUserMapper } from './mappers';

@Injectable()
export class BrivoUserAdapter implements UserProvisioningPort {
  constructor(
    private readonly brivoClient: BrivoApiClient,
    private readonly filterMapper: BrivoFilterMapper,
    private readonly userMapper: BrivoUserMapper,
  ) {}

  public async findAll(
    startIndex: number,
    count: number,
    filter?: string,
  ): Promise<ScimUserListDto> {
    const brivoFilter = this.filterMapper.fromScim(filter);
    const brivoUserList: BrivoListDto<BrivoUserDto> = await this.brivoClient.getUsers(
      startIndex,
      count,
      brivoFilter,
    );

    const scimUsers: ScimUserDto[] = brivoUserList.data.map((user) => this.userMapper.toScim(user));

    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: brivoUserList.count,
      Resources: scimUsers,
      startIndex,
      itemsPerPage: scimUsers.length,
    };
  }

  public async findById(id: string): Promise<ScimUserDto> {
    const brivoId = this.parseId(id);
    const brivoUser = await this.brivoClient.getUser(brivoId);
    return this.userMapper.toScim(brivoUser);
  }

  public async create(dto: CreateScimUserDto): Promise<ScimUserDto> {
    const brivoCreateDto = this.userMapper.toCreateBrivo(dto);
    const brivoUser = await this.brivoClient.createUser(brivoCreateDto);
    return this.userMapper.toScim(brivoUser);
  }

  public async update(id: string, dto: UpdateScimUserDto): Promise<ScimUserDto> {
    const brivoId = this.parseId(id);

    const brivoUpdateDto = this.userMapper.toUpdateBrivo(dto);
    const updatedUser = await this.brivoClient.updateUser(brivoId, brivoUpdateDto);

    return this.userMapper.toScim(updatedUser);
  }

  public async delete(id: string): Promise<void> {
    const brivoId = this.parseId(id);

    const existingUser = await this.brivoClient.getUser(brivoId);
    if (!existingUser) {
      throw new ScimNotFoundException(`User with id ${id} not found`);
    }

    await this.brivoClient.deleteUser(brivoId);
  }

  private parseId(scimId: string): number {
    const brivoId = parseInt(scimId, 10);
    if (isNaN(brivoId)) {
      throw new ScimBadRequestException(`Invalid User id: ${scimId}`);
    }
    return brivoId;
  }
}
