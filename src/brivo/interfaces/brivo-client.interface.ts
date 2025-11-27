import { BrivoFilter } from './brivo-filter';
import { BrivoListDto, BrivoUserDto, CreateBrivoUserDto } from './dto';

export abstract class BrivoClient {
  abstract getUsers(
    offset?: number,
    pageSize?: number,
    filter?: BrivoFilter,
  ): Promise<BrivoListDto<BrivoUserDto>>;
  abstract getUser(id: number): Promise<BrivoUserDto | null>;
  abstract updateUser(id: number, dto: Partial<BrivoUserDto>): Promise<BrivoUserDto>;
  abstract createUser(dto: CreateBrivoUserDto): Promise<BrivoUserDto>;
  abstract deleteUser(id: number): Promise<void>;
}
