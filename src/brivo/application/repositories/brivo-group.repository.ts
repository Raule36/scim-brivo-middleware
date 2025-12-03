import { BrivoGroupWithMembersDto, CreateBrivoGroupDto } from '@brivo/contracts';

import { BrivoFilter } from '../brivo-filter';

export abstract class BrivoGroupRepository {
  abstract findAll(
    offset?: number,
    pageSize?: number,
    filter?: BrivoFilter,
  ): Promise<{ items: BrivoGroupWithMembersDto[]; total: number }>;
  abstract findById(id: number): Promise<BrivoGroupWithMembersDto | null>;
  abstract create(dto: CreateBrivoGroupDto): Promise<BrivoGroupWithMembersDto>;
  abstract update(
    id: number,
    dto: Partial<BrivoGroupWithMembersDto>,
  ): Promise<BrivoGroupWithMembersDto>;
  abstract delete(id: number): Promise<void>;

  abstract addMembers(groupId: number, memberIds: number[]): Promise<void>;
  abstract removeMembers(groupId: number, memberIds: number[]): Promise<void>;
}
