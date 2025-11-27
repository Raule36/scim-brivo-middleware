import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BrivoUserDto } from '../../interfaces/dto';

type BrivoEmail = {
  address?: string;
  type: 'Work' | 'Home';
};

type BrivoPhoneNumber = {
  number: string;
  type: 'Work' | 'Home';
};

@Entity('brivo_users')
export class BrivoUserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  firstName!: string;

  @Column({ type: 'text' })
  lastName!: string;

  @Column({ type: 'text' })
  middleName?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated!: Date;

  @Column({
    type: 'jsonb',
    nullable: false,
    default: () => `'[]'`,
  })
  emails!: BrivoEmail[];

  @Column({
    type: 'jsonb',
    nullable: false,
    default: () => `'[]'`,
  })
  phoneNumbers!: BrivoPhoneNumber[];

  @Column({ type: 'varchar', nullable: true })
  externalId?: string;

  @Column({ type: 'boolean', nullable: true })
  suspended?: boolean;

  @Column({
    type: 'int',
    array: true,
    nullable: true,
  })
  groupIds?: number[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  customFields?: (string | number | boolean)[];

  public toDto(): BrivoUserDto {
    return {
      id: this.id,

      firstName: this.firstName,
      lastName: this.lastName,
      middleName: this.middleName ?? undefined,

      created: this.created.toISOString(),
      updated: this.updated.toISOString(),

      emails: this.emails ?? [],
      phoneNumbers: this.phoneNumbers ?? [],

      externalId: this.externalId ?? undefined,
      suspended: this.suspended ?? undefined,

      groupIds: this.groupIds ?? undefined,

      customFields: this.customFields ?? undefined,
    };
  }

  static toPartialEntity(dto: Partial<BrivoUserDto>): Partial<BrivoUserEntity> {
    const partial: Partial<BrivoUserEntity> = new BrivoUserEntity();

    if (dto.firstName !== undefined) partial.firstName = dto.firstName;
    if (dto.lastName !== undefined) partial.lastName = dto.lastName;
    if (dto.middleName !== undefined) partial.middleName = dto.middleName ?? null;
    if (dto.emails !== undefined) partial.emails = dto.emails;
    if (dto.phoneNumbers !== undefined) partial.phoneNumbers = dto.phoneNumbers;
    if (dto.externalId !== undefined) partial.externalId = dto.externalId;
    if (dto.suspended !== undefined) partial.suspended = dto.suspended;
    if (dto.groupIds !== undefined) partial.groupIds = dto.groupIds ?? null;
    if (dto.customFields !== undefined) partial.customFields = dto.customFields ?? null;

    return partial;
  }
}
