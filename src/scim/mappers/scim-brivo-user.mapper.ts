import { BrivoUserDto, CreateBrivoUserDto } from '@brivo/interfaces/dto';
import { ScimNotFoundException } from '@scim/exceptions/scim-exception';
import { CreateScimUserDto, ScimUserDto, UpdateScimUserDto } from '@scim/interfaces/dto';

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

export class ScimBrivoUserMapper {
  private static readonly DEFAULT_EMAIL_TYPE: BrivoEmailType = 'Work';

  public static mapBrivoUserToScim(brivo: BrivoUserDto): ScimUserDto {
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

  public static mapCreateScimUserToBrivo(scim: CreateScimUserDto): CreateBrivoUserDto {
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

  public static mapUpdateScimUserToBrivo(scim: UpdateScimUserDto): Partial<BrivoUserDto> {
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

  public static parseBrivoId(scimId: string): number {
    const brivoId = parseInt(scimId, 10);
    if (isNaN(brivoId)) {
      throw new ScimNotFoundException(`Invalid user id: ${scimId}`);
    }
    return brivoId;
  }

  private static extractGroupIds(scim: CreateScimUserDto): number[] {
    if (!scim.groups) {
      return [];
    }

    return scim.groups
      .map((g) => g.value)
      .filter((v): v is string => !!v)
      .map((value) => Number.parseInt(value, 10))
      .filter((n) => Number.isFinite(n));
  }

  private static extractNameFields(scim: CreateScimUserDto): BrivoNameFields {
    return {
      firstName: scim.name?.givenName ?? scim.displayName ?? scim.userName,
      lastName: scim.name?.familyName ?? '',
      middleName: scim.name?.middleName,
    };
  }

  private static extractEmails(scim: CreateScimUserDto): BrivoEmail[] {
    return (scim.emails ?? []).map((email) => ({
      address: email.value,
      type: this.mapScimEmailTypeToBrivo(email.type),
    }));
  }

  private static mapScimEmailTypeToBrivo(type?: string): BrivoEmailType {
    if (type?.toLowerCase() === 'home') {
      return 'Home';
    }
    return this.DEFAULT_EMAIL_TYPE;
  }

  private static mapBrivoEmailTypeToScim(type: BrivoEmailType): string {
    return type === 'Home' ? 'home' : 'work';
  }
}
