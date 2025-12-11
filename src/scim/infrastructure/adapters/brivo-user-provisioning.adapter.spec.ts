import { BrivoApiClient } from '@brivo/application';
import { BrivoUserDto } from '@brivo/contracts';
import { ScimBadRequestException } from '@scim/application';
import { ScimUserDto } from '@scim/contracts';

import { BrivoFilterMapper, BrivoUserMapper } from '../mappers';
import { BrivoUserAdapter } from './brivo-user-provisioning.adapter';

describe('BrivoUserAdapter', () => {
  let adapter: BrivoUserAdapter;
  let mockBrivoClient: jest.Mocked<BrivoApiClient>;
  let mockFilterMapper: jest.Mocked<BrivoFilterMapper>;
  let mockUserMapper: jest.Mocked<BrivoUserMapper>;

  beforeEach(() => {
    mockBrivoClient = {
      getUser: jest.fn(),
      getUsers: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as any;

    mockFilterMapper = {
      fromScim: jest.fn(),
    } as any;

    mockUserMapper = {
      toScim: jest.fn(),
      toCreateBrivo: jest.fn(),
      toUpdateBrivo: jest.fn(),
    } as any;

    adapter = new BrivoUserAdapter(mockBrivoClient, mockFilterMapper, mockUserMapper);
  });

  describe('findById', () => {
    it('should return mapped scim user when brivo user exists', async () => {
      const brivoUser: BrivoUserDto = {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        emails: [],
        phoneNumbers: [],
        created: '',
        updated: '',
      };

      const expectedScimUser: ScimUserDto = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: '123',
        userName: '123',
        displayName: 'John Doe',
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [],
        active: true,
        groups: [],
        meta: { resourceType: 'User' },
      };

      mockBrivoClient.getUser.mockResolvedValue(brivoUser);
      mockUserMapper.toScim.mockReturnValue(expectedScimUser);

      const result = await adapter.findById('123');

      expect(mockBrivoClient.getUser).toHaveBeenCalledWith(123);
      expect(mockUserMapper.toScim).toHaveBeenCalledWith(brivoUser);
      expect(result).toEqual(expectedScimUser);
    });

    it('should throw ScimBadRequestException for invalid id', async () => {
      await expect(adapter.findById('not-a-number')).rejects.toThrow(ScimBadRequestException);

      expect(mockBrivoClient.getUser).not.toHaveBeenCalled();
    });

    it('should propagate error when brivo client fails', async () => {
      mockBrivoClient.getUser.mockRejectedValue(new Error('API Error'));

      await expect(adapter.findById('123')).rejects.toThrow('API Error');
    });
  });
});
