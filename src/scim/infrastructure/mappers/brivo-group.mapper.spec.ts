import { BrivoGroupWithMembersDto } from '@brivo/contracts';
import { CreateScimGroupDto } from '@scim/contracts';

import { BrivoGroupMapper } from './brivo-group.mapper';

describe('BrivoGroupMapper', () => {
  let mapper: BrivoGroupMapper;

  beforeEach(() => {
    mapper = new BrivoGroupMapper();
  });

  it('should map brivo group with members to scim format', () => {
    const brivoGroup: BrivoGroupWithMembersDto = {
      id: 100,
      name: 'Engineering Team',
      members: [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' },
        { id: 3, firstName: 'Bob', lastName: 'Wilson', externalId: 'ext-3' },
      ],
    };

    const result = mapper.toScim(brivoGroup);

    expect(result).toEqual({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
      id: '100',
      displayName: 'Engineering Team',
      externalId: undefined,
      members: [
        { value: '1', type: 'User' },
        { value: '2', type: 'User' },
        { value: '3', type: 'User' },
      ],
    });
  });

  it('should map displayName to name', () => {
    const scimGroup: CreateScimGroupDto = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
      displayName: 'Marketing Department',
    };

    const result = mapper.toCreateBrivo(scimGroup);

    expect(result.name).toBe('Marketing Department');
  });
});
