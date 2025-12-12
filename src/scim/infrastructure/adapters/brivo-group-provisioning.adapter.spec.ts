import { BrivoApiClient } from '@brivo/application';
import { ScimBadRequestException } from '@scim/application';
import { ScimGroupDto } from '@scim/contracts';

import { BrivoFilterMapper, BrivoGroupMapper } from '../mappers';
import { BrivoGroupAdapter } from './brivo-group-provisioning.adapter';

describe('BrivoGroupAdapter', () => {
  let adapter: BrivoGroupAdapter;
  let mockBrivoClient: jest.Mocked<BrivoApiClient>;
  let mockFilterMapper: jest.Mocked<BrivoFilterMapper>;
  let mockGroupMapper: jest.Mocked<BrivoGroupMapper>;

  beforeEach(() => {
    mockBrivoClient = {
      getGroup: jest.fn(),
      getGroups: jest.fn(),
      createGroup: jest.fn(),
      updateGroup: jest.fn(),
      deleteGroup: jest.fn(),
      addUserToGroup: jest.fn(),
      removeUserFromGroup: jest.fn(),
    } as any;

    mockFilterMapper = {
      fromScim: jest.fn(),
    } as any;

    mockGroupMapper = {
      toScim: jest.fn(),
      toCreateBrivo: jest.fn(),
    } as any;

    adapter = new BrivoGroupAdapter(mockBrivoClient, mockFilterMapper, mockGroupMapper);
  });

  describe('findById', () => {
    it('should return mapped scim group when found', async () => {
      const brivoGroup = {
        id: 123,
        name: 'Test Group',
        members: [{ id: 1, firstName: 'John', lastName: 'Doe' }],
      };
      const expectedScimGroup: ScimGroupDto = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
        id: '123',
        displayName: 'Test Group',
      };

      mockBrivoClient.getGroup.mockResolvedValue(brivoGroup);
      mockGroupMapper.toScim.mockReturnValue(expectedScimGroup);

      const result = await adapter.findById('123');

      expect(mockBrivoClient.getGroup).toHaveBeenCalledWith(123);
      expect(mockGroupMapper.toScim).toHaveBeenCalledWith(brivoGroup);
      expect(result).toEqual(expectedScimGroup);
    });

    it('should throw ScimBadRequestException for invalid id', async () => {
      await expect(adapter.findById('not-a-number')).rejects.toThrow(ScimBadRequestException);

      expect(mockBrivoClient.getGroup).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update group name when displayName provided', async () => {
      const existingGroup = {
        id: 100,
        name: 'Old Name',
        members: [],
      };
      const updateDto: ScimGroupDto = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
        id: '100',
        displayName: 'New Name',
      };

      mockBrivoClient.getGroup.mockResolvedValue(existingGroup);
      mockBrivoClient.updateGroup.mockResolvedValue({ ...existingGroup, name: 'New Name' });
      mockGroupMapper.toScim.mockReturnValue({ id: '100', displayName: 'New Name', schemas: [] });

      await adapter.update('100', updateDto);

      expect(mockBrivoClient.updateGroup).toHaveBeenCalledWith(100, { name: 'New Name' });
    });

    it('should add new members to group', async () => {
      const existingGroup = {
        id: 100,
        name: 'Test',
        members: [{ id: 1, firstName: 'John', lastName: 'Doe' }],
      };
      const updateDto: ScimGroupDto = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
        id: '100',
        displayName: 'Test',
        members: [{ value: '1' }, { value: '2' }, { value: '3' }],
      };

      mockBrivoClient.getGroup.mockResolvedValue(existingGroup);
      mockGroupMapper.toScim.mockReturnValue({ id: '100', displayName: 'Test', schemas: [] });

      await adapter.update('100', updateDto);

      expect(mockBrivoClient.addUserToGroup).toHaveBeenCalledWith(100, 2);
      expect(mockBrivoClient.addUserToGroup).toHaveBeenCalledWith(100, 3);
      expect(mockBrivoClient.addUserToGroup).toHaveBeenCalledTimes(2);
    });

    it('should remove members from group', async () => {
      const existingGroup = {
        id: 100,
        name: 'Test',
        members: [
          { id: 1, firstName: 'John', lastName: 'Doe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith' },
          { id: 3, firstName: 'Bob', lastName: 'Wilson' },
        ],
      };
      const updateDto: ScimGroupDto = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
        id: '100',
        displayName: 'Test',
        members: [{ value: '1' }],
      };

      mockBrivoClient.getGroup.mockResolvedValue(existingGroup);
      mockGroupMapper.toScim.mockReturnValue({ id: '100', displayName: 'Test', schemas: [] });

      await adapter.update('100', updateDto);

      expect(mockBrivoClient.removeUserFromGroup).toHaveBeenCalledWith(100, 2);
      expect(mockBrivoClient.removeUserFromGroup).toHaveBeenCalledWith(100, 3);
      expect(mockBrivoClient.removeUserFromGroup).toHaveBeenCalledTimes(2);
    });

    it('should handle replacing all members', async () => {
      const existingGroup = {
        id: 100,
        name: 'Test',
        members: [
          { id: 1, firstName: 'John', lastName: 'Doe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith' },
        ],
      };
      const updateDto: ScimGroupDto = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'] as const,
        id: '100',
        displayName: 'Test',
        members: [{ value: '3' }, { value: '4' }],
      };

      mockBrivoClient.getGroup.mockResolvedValue(existingGroup);
      mockGroupMapper.toScim.mockReturnValue({ id: '100', displayName: 'Test', schemas: [] });

      await adapter.update('100', updateDto);

      expect(mockBrivoClient.removeUserFromGroup).toHaveBeenCalledWith(100, 1);
      expect(mockBrivoClient.removeUserFromGroup).toHaveBeenCalledWith(100, 2);
      expect(mockBrivoClient.addUserToGroup).toHaveBeenCalledWith(100, 3);
      expect(mockBrivoClient.addUserToGroup).toHaveBeenCalledWith(100, 4);
    });

    it('should not modify members when members not in dto', async () => {
      const existingGroup = {
        id: 100,
        name: 'Test',
        members: [{ id: 1, firstName: 'John', lastName: 'Doe' }],
      };
      const updateDto: ScimGroupDto = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'] as const,
        id: '100',
        displayName: 'New Name',
      };

      mockBrivoClient.getGroup.mockResolvedValue(existingGroup);
      mockGroupMapper.toScim.mockReturnValue({ id: '100', displayName: 'New Name', schemas: [] });

      await adapter.update('100', updateDto);

      expect(mockBrivoClient.addUserToGroup).not.toHaveBeenCalled();
      expect(mockBrivoClient.removeUserFromGroup).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete group by id', async () => {
      mockBrivoClient.deleteGroup.mockResolvedValue(undefined);

      await adapter.delete('123');

      expect(mockBrivoClient.deleteGroup).toHaveBeenCalledWith(123);
    });

    it('should throw ScimBadRequestException for invalid id', async () => {
      await expect(adapter.delete('invalid')).rejects.toThrow(ScimBadRequestException);
    });
  });
});
