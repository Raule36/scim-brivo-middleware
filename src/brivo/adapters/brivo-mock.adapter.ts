import { Injectable } from '@nestjs/common';

import { BrivoClient, BrivoFilter } from '../interfaces';
import { BrivoListDto, BrivoUserDto, CreateBrivoUserDto } from '../interfaces/dto';
import { BrivoUserRepository } from '../interfaces/repositories';

@Injectable()
export class BrivoMockAdapter implements BrivoClient {
  constructor(private readonly repository: BrivoUserRepository) {}

  public createUser(dto: CreateBrivoUserDto): Promise<BrivoUserDto> {
    return this.repository.create(dto);
  }

  public updateUser(id: number, dto: Partial<BrivoUserDto>): Promise<BrivoUserDto> {
    return this.repository.update(id, dto);
  }

  public deleteUser(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  public getUser(id: number): Promise<BrivoUserDto | null> {
    return this.repository.findById(id);
  }

  public async getUsers(
    offset = 1,
    pageSize = 100,
    filter?: BrivoFilter,
  ): Promise<BrivoListDto<BrivoUserDto>> {
    const { total, items } = await this.repository.findAll(
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
}
