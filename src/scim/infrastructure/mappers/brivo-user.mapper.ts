import { BrivoUserDto, CreateBrivoUserDto } from '@brivo/interfaces/dto';
import { Injectable } from '@nestjs/common';

import { CreateScimUserDto, ScimUserDto, UpdateScimUserDto } from '../../contracts/dto';

type BrivoEmailType = 'Work' | 'Home';

interface BrivoNameFields {
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface BrivoEmail {
  address: string;
  type: BrivoEmailType;
}

@Injectable()
export class BrivoUserMapper {
  private readonly DEFAULT_EMAIL_TYPE: BrivoEmailType = 'Work';

  public toScim(brivo: BrivoUserDto): ScimUserDto {
    const emails = brivo.emails.map((email) => ({
      value: email.address ?? '',
      type: this.mapBrivoEmailTypeToScim(email.type),
      primary: false,
      display: email.address ?? undefined,
    }));

    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: String(brivo.id),
      externalId: brivo.externalId,
      userName: brivo.externalId ?? String(brivo.id),
      displayName: `${brivo.firstName} ${brivo.lastName}`.trim(),
      name: {
        givenName: brivo.firstName,
        familyName: brivo.lastName,
        middleName: brivo.middleName,
      },
      emails,
      active: brivo.suspended !== true,
      groups: [],
      meta: {
        resourceType: 'User',
        created: brivo.created,
        lastModified: brivo.updated,
      },
    };
  }

  public toCreateBrivo(scim: CreateScimUserDto): CreateBrivoUserDto {
    const { firstName, lastName, middleName } = this.extractNameFields(scim);

    return {
      firstName,
      lastName,
      middleName,
      emails: this.extractEmails(scim),
      phoneNumbers: [],
      externalId: scim.externalId,
      suspended: !scim.active,
      customFields: [],
    };
  }

  public toUpdateBrivo(scim: UpdateScimUserDto): Partial<BrivoUserDto> {
    const { firstName, lastName, middleName } = this.extractNameFields(scim);

    return {
      firstName,
      lastName,
      middleName,
      emails: this.extractEmails(scim),
      externalId: scim.externalId,
      suspended: !scim.active,
    };
  }

  private extractNameFields(scim: CreateScimUserDto): BrivoNameFields {
    return {
      firstName: scim.name?.givenName ?? scim.displayName ?? scim.userName,
      lastName: scim.name?.familyName ?? '',
      middleName: scim.name?.middleName,
    };
  }

  private extractEmails(scim: CreateScimUserDto): BrivoEmail[] {
    return (scim.emails ?? []).map((email) => ({
      address: email.value,
      type: this.mapScimEmailTypeToBrivo(email.type),
    }));
  }

  private mapScimEmailTypeToBrivo(type?: string): BrivoEmailType {
    if (type?.toLowerCase() === 'home') {
      return 'Home';
    }
    return this.DEFAULT_EMAIL_TYPE;
  }

  private mapBrivoEmailTypeToScim(type: BrivoEmailType): string {
    return type === 'Home' ? 'home' : 'work';
  }
}
