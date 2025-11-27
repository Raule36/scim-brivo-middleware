import { BrivoClient, BrivoFilter } from '@brivo/interfaces';
import { BrivoListDto, BrivoUserDto } from '@brivo/interfaces/dto';
import { Injectable } from '@nestjs/common';
import { ScimBrivoMapper } from '@scim/mappers';
import { ScimBrivoFilterMapper } from '@scim/mappers/scim-brivo-filter.mapper';

import { ScimNotFoundException } from '../exceptions/scim-exception';
import { CreateScimUserDto, ScimListDto, ScimUserDto, UpdateScimUserDto } from '../interfaces/dto';

@Injectable()
export class ScimUserService {
  constructor(
    private readonly brivoClient: BrivoClient,
    private readonly scimBrivoFilterMapper: ScimBrivoFilterMapper,
  ) {}

  public async getAll(startIndex = 1, count = 100, filter?: string): Promise<ScimListDto> {
    const brivoFilter: BrivoFilter | undefined = this.scimBrivoFilterMapper.mapFromString(filter);
    const brivoUserList: BrivoListDto<BrivoUserDto> = await this.brivoClient.getUsers(
      startIndex,
      count,
      brivoFilter,
    );
    const scimUsers: ScimUserDto[] = brivoUserList.data.map((user) =>
      ScimBrivoMapper.mapBrivoUserToScim(user),
    );

    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: brivoUserList.count,
      Resources: scimUsers,
      startIndex,
      itemsPerPage: scimUsers.length,
    } as ScimListDto;
  }

  public async getById(id: string): Promise<ScimUserDto> {
    const brivoId = ScimBrivoMapper.parseBrivoId(id);

    const brivoUser: BrivoUserDto | null = await this.brivoClient.getUser(brivoId);
    if (!brivoUser) {
      throw new ScimNotFoundException(`User with ${id} not found`);
    }

    return ScimBrivoMapper.mapBrivoUserToScim(brivoUser);
  }

  public async create(dto: CreateScimUserDto): Promise<ScimUserDto> {
    const brivoUserDto: BrivoUserDto = await this.brivoClient.createUser(
      ScimBrivoMapper.mapCreateScimUserToBrivo(dto),
    );
    return ScimBrivoMapper.mapBrivoUserToScim(brivoUserDto);
  }

  public async update(id: string, dto: UpdateScimUserDto): Promise<ScimUserDto> {
    await this.findBrivoUserOrThrow(id);

    const brivoId: number = ScimBrivoMapper.parseBrivoId(id);
    const updateData: Partial<BrivoUserDto> = ScimBrivoMapper.mapUpdateScimUserToBrivo(dto);
    const updatedUser: BrivoUserDto = await this.brivoClient.updateUser(brivoId, updateData);

    return ScimBrivoMapper.mapBrivoUserToScim(updatedUser);
  }

  public async delete(id: string): Promise<void> {
    await this.findBrivoUserOrThrow(id);
    await this.brivoClient.deleteUser(ScimBrivoMapper.parseBrivoId(id));
  }

  private async findBrivoUserOrThrow(id: string): Promise<BrivoUserDto> {
    const brivoId = ScimBrivoMapper.parseBrivoId(id);

    const brivoUser = await this.brivoClient.getUser(brivoId);
    if (!brivoUser) {
      throw new ScimNotFoundException(`User with id ${id} not found`);
    }

    return brivoUser;
  }
}
