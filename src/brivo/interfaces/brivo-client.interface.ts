import { BrivoFilter } from './brivo-filter';
import {
  BrivoGroupWithMembersDto,
  BrivoListDto,
  BrivoUserDto,
  CreateBrivoGroupDto,
  CreateBrivoUserDto,
  UpdateBrivoGroupDto,
} from './dto';

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

  abstract addUserToGroup(groupId: number, userId: number): Promise<void>;
  abstract removeUserFromGroup(groupId: number, userId: number): Promise<void>;
  abstract getGroups(
    offset?: number,
    pageSize?: number,
    filter?: BrivoFilter,
  ): Promise<BrivoListDto<BrivoGroupWithMembersDto>>;
  abstract getGroup(id: number): Promise<BrivoGroupWithMembersDto | null>;
  abstract updateGroup(id: number, dto: UpdateBrivoGroupDto): Promise<BrivoGroupWithMembersDto>;
  abstract createGroup(dto: CreateBrivoGroupDto): Promise<BrivoGroupWithMembersDto>;
  abstract deleteGroup(id: number): Promise<void>;
}
