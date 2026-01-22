import { BrivoFilter, BrivoUserRepository } from '@brivo/application';
import { BrivoUserDto, CreateBrivoUserDto } from '@brivo/contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BrivoUserEntity } from '../entitites';
import { FilterUtils } from '../filter.utils';

@Injectable()
export class OrmBrivoUserRepository implements BrivoUserRepository {
  constructor(@InjectRepository(BrivoUserEntity) private repository: Repository<BrivoUserEntity>) {}

  public async create(dto: CreateBrivoUserDto): Promise<BrivoUserDto> {
    const entity = BrivoUserEntity.toPartialEntity(dto);
    const saved = await this.repository.save(entity);
    return saved.toDto();
  }

  public async update(id: number, dto: Partial<BrivoUserDto>): Promise<BrivoUserDto> {
    const existing = await this.repository.findOne({ where: { id: id } });
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }
    const partialEntity = BrivoUserEntity.toPartialEntity(dto);
    const merged = this.repository.merge(existing, partialEntity);
    const saved = await this.repository.save(merged);
    return saved.toDto();
  }

  public async findAll(
    offset = 1,
    pageSize = 100,
    filter?: BrivoFilter,
  ): Promise<{ items: BrivoUserDto[]; total: number }> {
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

  public async findById(id: number): Promise<BrivoUserDto | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity?.toDto() || null;
  }

  public async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
