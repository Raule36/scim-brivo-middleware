import { BrivoUserDto, CreateBrivoUserDto, UpdateBrivoUserDto } from '@brivo/contracts';
import { Injectable } from '@nestjs/common';
import {
  CreateScimUserDto,
  ScimUserDto,
  ScimUserEmailDto,
  UpdateScimUserDto,
} from '@scim/contracts';

interface BrivoNameFields {
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface BrivoEmail {
  address: string;
  type: string;
}

@Injectable()
export class BrivoUserMapper {
  private readonly DEFAULT_EMAIL_TYPE: string = 'work';

  public toScim(brivo: BrivoUserDto): ScimUserDto {
    const emails = brivo.emails.map((email) => ({
      value: email.address ?? '',
      type: this.mapBrivoEmailTypeToScim(email.type),
    })) as ScimUserEmailDto[];

    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: String(brivo.id),
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
      externalId: scim.userName,
      suspended: !scim.active,
      customFields: [],
    };
  }

  public toUpdateBrivo(scim: UpdateScimUserDto): UpdateBrivoUserDto {
    const { firstName, lastName, middleName } = this.extractNameFields(scim);

    return {
      firstName,
      lastName,
      middleName,
      emails: this.extractEmails(scim),
      phoneNumbers: [],
      externalId: scim.userName,
      suspended: !scim.active,
      customFields: [],
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

  private mapScimEmailTypeToBrivo(type?: string): string {
    if (type?.toLowerCase() === 'home') {
      return 'home';
    }
    return this.DEFAULT_EMAIL_TYPE;
  }

  private mapBrivoEmailTypeToScim(type: string): string {
    return type.toLowerCase().includes('home') ? 'home' : 'work';
  }
}
