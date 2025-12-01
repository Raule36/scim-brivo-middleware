import {
  CreateScimUserDto,
  ScimUserDto,
  ScimUserListDto,
  UpdateScimUserDto,
} from '@scim/contracts';

export abstract class UserProvisioningPort {
  abstract findAll(startIndex: number, count: number, filter?: string): Promise<ScimUserListDto>;
  abstract findById(id: string): Promise<ScimUserDto>;
  abstract create(dto: CreateScimUserDto): Promise<ScimUserDto>;
  abstract update(id: string, dto: UpdateScimUserDto): Promise<ScimUserDto>;
  abstract delete(id: string): Promise<void>;
}
