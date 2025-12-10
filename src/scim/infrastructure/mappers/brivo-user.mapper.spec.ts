import { BrivoUserDto, CreateBrivoUserDto, UpdateBrivoUserDto } from '@brivo/contracts';
import { CreateScimUserDto, ScimUserDto, UpdateScimUserDto } from '@scim/contracts';

import { BrivoUserMapper } from './brivo-user.mapper';

describe('BrivoUserMapper', () => {
  let mapper: BrivoUserMapper;

  beforeEach(() => {
    mapper = new BrivoUserMapper();
  });

  it('should map scim create user to brivo format', () => {
    const scim: CreateScimUserDto = {
      userName: 'john.doe',
      active: true,
      name: {
        givenName: 'John',
        familyName: 'Doe',
        middleName: 'Michael',
      },
      emails: [
        { value: 'work@example.com', type: 'work' },
        { value: 'home@example.com', type: 'home' },
      ],
    };

    const createBrivoUserDto: CreateBrivoUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      emails: [
        { address: 'work@example.com', type: 'work' },
        { address: 'home@example.com', type: 'home' },
      ],
      phoneNumbers: [],
      externalId: 'john.doe',
      suspended: false,
      customFields: [],
    };

    const result: CreateBrivoUserDto = mapper.toCreateBrivo(scim);

    expect(result).toEqual(createBrivoUserDto);
  });

  it('should map scim update user to brivo format', () => {
    const scim: UpdateScimUserDto = {
      userName: 'john.doe',
      active: true,
      name: {
        givenName: 'John',
        familyName: 'Doe',
        middleName: 'Michael',
      },
      emails: [
        { value: 'work@example.com', type: 'work' },
        { value: 'home@example.com', type: 'home' },
      ],
    };

    const createBrivoUserDto: UpdateBrivoUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      emails: [
        { address: 'work@example.com', type: 'work' },
        { address: 'home@example.com', type: 'home' },
      ],
      phoneNumbers: [],
      externalId: 'john.doe',
      suspended: false,
      customFields: [],
    };

    const result: UpdateBrivoUserDto = mapper.toUpdateBrivo(scim);

    expect(result).toEqual(createBrivoUserDto);
  });

  it('should map complete brivo user to scim format', () => {
    const brivoUserDto: BrivoUserDto = {
      id: 12345,
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      created: '2010-06-15T04:00:00Z',
      updated: '2018-03-14T04:00:00Z',
      emails: [
        { address: 'work@example.com', type: 'work' },
        { address: 'home@example.com', type: 'home' },
      ],
      phoneNumbers: [],
      externalId: 'john.doe',
      suspended: false,
      customFields: [],
    };

    const scimUser: ScimUserDto = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: '12345',
      userName: 'john.doe',
      displayName: 'John Doe',
      name: {
        givenName: 'John',
        familyName: 'Doe',
        middleName: 'Michael',
      },
      emails: [
        { value: 'work@example.com', type: 'work' },
        { value: 'home@example.com', type: 'home' },
      ],
      active: true,
      groups: [],
      meta: {
        resourceType: 'User',
        created: '2010-06-15T04:00:00Z',
        lastModified: '2018-03-14T04:00:00Z',
      },
    };

    const result = mapper.toScim(brivoUserDto);

    expect(result).toEqual(scimUser);
  });

  it('should fallback to displayName when name.givenName is missing', () => {
    const scimUser: CreateScimUserDto = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: 'john.doe',
      displayName: 'John Doe',
      emails: [],
      active: true,
      groups: [],
    };

    const result = mapper.toCreateBrivo(scimUser);

    expect(result.firstName).toBe('John Doe');
  });

  it('should fallback to userName when both name and displayName are missing', () => {
    const scimUser: CreateScimUserDto = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: 'john.doe',
      emails: [],
      active: true,
      groups: [],
    };

    const result = mapper.toCreateBrivo(scimUser);

    expect(result.firstName).toBe('john.doe');
  });

  it('should set empty lastName when familyName is missing', () => {
    const scimUser: CreateScimUserDto = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: 'john.doe',
      name: { givenName: 'John' },
      emails: [],
      active: true,
      groups: [],
    };

    const result = mapper.toCreateBrivo(scimUser);

    expect(result.lastName).toBe('');
  });
});
