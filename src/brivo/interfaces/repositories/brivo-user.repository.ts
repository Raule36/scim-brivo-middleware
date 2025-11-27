import { BrivoFilter } from '../brivo-filter';
import { BrivoUserDto, CreateBrivoUserDto } from '../dto';

export abstract class BrivoUserRepository {
  abstract findAll(
    offset?: number,
    pageSize?: number,
    filter?: BrivoFilter,
  ): Promise<{ items: BrivoUserDto[]; total: number }>;
  abstract findById(id: number): Promise<BrivoUserDto | null>;
  abstract create(dto: CreateBrivoUserDto): Promise<BrivoUserDto>;
  abstract update(id: number, dto: Partial<BrivoUserDto>): Promise<BrivoUserDto>;
  abstract delete(id: number): Promise<void>;
}
