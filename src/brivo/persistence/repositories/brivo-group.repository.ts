import { BrivoFilter } from '@brivo/interfaces';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BrivoGroupWithMembersDto,
  CreateBrivoGroupDto,
  UpdateBrivoGroupDto,
} from '../../interfaces/dto';
import { BrivoGroupRepository } from '../../interfaces/repositories';
import { BrivoGroupEntity } from '../entitites';
import { FilterUtils } from '../filter.utils';

@Injectable()
export class OrmBrivoGroupRepository implements BrivoGroupRepository {
  constructor(
    @InjectRepository(BrivoGroupEntity) private repository: Repository<BrivoGroupEntity>,
  ) {}

  public addMembers(groupId: number, memberIds: number[]): Promise<void> {
    return this.repository
      .createQueryBuilder()
      .relation(BrivoGroupEntity, 'members')
      .of(groupId)
      .add(memberIds);
  }

  public removeMembers(groupId: number, memberIds: number[]): Promise<void> {
    return this.repository
      .createQueryBuilder()
      .relation(BrivoGroupEntity, 'members')
      .of(groupId)
      .remove(memberIds);
  }

  public async create(dto: CreateBrivoGroupDto): Promise<BrivoGroupWithMembersDto> {
    const entity = BrivoGroupEntity.toPartialEntity(dto);
    const saved = await this.repository.save(entity);
    return saved.toDto();
  }

  public async update(id: number, dto: UpdateBrivoGroupDto): Promise<BrivoGroupWithMembersDto> {
    const existing = await this.repository.findOne({ where: { id: id } });
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }
    const partialEntity = BrivoGroupEntity.toPartialEntity(dto);
    const merged = this.repository.merge(existing, partialEntity);
    const saved = await this.repository.save(merged);

    return saved.toDto();
  }

  public async findAll(
    offset = 1,
    pageSize = 100,
    filter?: BrivoFilter,
  ): Promise<{ items: BrivoGroupWithMembersDto[]; total: number }> {
    const queryBuilder = this.repository.createQueryBuilder('user');

    if (filter) {
      FilterUtils.apply(queryBuilder, filter, 'user');
    }

    const [entities, total] = await queryBuilder.skip(offset).take(pageSize).getManyAndCount();

    return {
      items: entities.map((entity) => entity.toDto()),
      total,
    };
  }

  public async findById(id: number): Promise<BrivoGroupWithMembersDto | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity?.toDto() || null;
  }

  public async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
