import { BrivoGroupWithMembersDto } from '@brivo/contracts';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BrivoUserEntity } from './user.entity';

@Entity('brivo_groups')
export class BrivoGroupEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  antipassbackResetTime!: number | null;

  @Column({ type: 'boolean', default: false })
  keypadUnlock!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  immuneToAntipassback!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  excludedFromLockdown!: boolean;

  @ManyToMany(() => BrivoUserEntity, { eager: true })
  @JoinTable({
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  members!: BrivoUserEntity[];

  toDto(): BrivoGroupWithMembersDto {
    return {
      id: this.id,
      name: this.name,
      antipassbackResetTime: this.antipassbackResetTime,
      keypadUnlock: this.keypadUnlock,
      immuneToAntipassback: this.immuneToAntipassback,
      excludedFromLockdown: this.excludedFromLockdown,
      members: this.members?.map((member) => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        externalId: member.externalId,
      })),
    };
  }

  static toPartialEntity(dto: Partial<BrivoGroupWithMembersDto>): Partial<BrivoGroupEntity> {
    const entity = new BrivoGroupEntity();

    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.antipassbackResetTime !== undefined)
      entity.antipassbackResetTime = dto.antipassbackResetTime;
    if (dto.keypadUnlock !== undefined) entity.keypadUnlock = dto.keypadUnlock;
    if (dto.immuneToAntipassback !== undefined)
      entity.immuneToAntipassback = dto.immuneToAntipassback;
    if (dto.excludedFromLockdown !== undefined)
      entity.excludedFromLockdown = dto.excludedFromLockdown;
    return entity;
  }
}
