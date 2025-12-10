import { BrivoFilterMapper } from './brivo-filter.mapper';

describe('BrivoFilterMapper', () => {
  let mapper: BrivoFilterMapper;

  beforeEach(() => {
    mapper = new BrivoFilterMapper();
  });

  describe('edge cases', () => {
    it('should return empty filter when input is undefined', () => {
      const result = mapper.fromScim(undefined);

      expect(result.isEmpty()).toBe(true);
    });

    it('should return empty filter when input is empty string', () => {
      const result = mapper.fromScim('');

      expect(result.isEmpty()).toBe(true);
    });

    it('should return empty filter for invalid filter syntax', () => {
      const result = mapper.fromScim('this is not a valid filter');

      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('simple eq filters', () => {
    it('should map userName to externalId', () => {
      const result = mapper.fromScim('userName eq "john@example.com"');

      expect(result.getItems()).toEqual([
        { field: 'externalId', operator: 'eq', values: ['john@example.com'] },
      ]);
    });

    it('should map name.givenName to firstName', () => {
      const result = mapper.fromScim('name.givenName eq "John"');

      expect(result.getItems()).toEqual([{ field: 'firstName', operator: 'eq', values: ['John'] }]);
    });

    it('should map name.familyName to lastName', () => {
      const result = mapper.fromScim('name.familyName eq "Doe"');

      expect(result.getItems()).toEqual([{ field: 'lastName', operator: 'eq', values: ['Doe'] }]);
    });

    it('should map id field', () => {
      const result = mapper.fromScim('id eq "12345"');

      expect(result.getItems()).toEqual([{ field: 'id', operator: 'eq', values: ['12345'] }]);
    });
  });

  describe('active field transformation', () => {
    it('should transform active true to user_status active', () => {
      const result = mapper.fromScim('active eq true');

      expect(result.getItems()).toEqual([
        { field: 'user_status', operator: 'eq', values: ['active'] },
      ]);
    });

    it('should transform active false to user_status suspended', () => {
      const result = mapper.fromScim('active eq false');

      expect(result.getItems()).toEqual([
        { field: 'user_status', operator: 'eq', values: ['suspended'] },
      ]);
    });

    it('should transform string "true" to user_status active', () => {
      const result = mapper.fromScim('active eq "true"');

      expect(result.getItems()).toEqual([
        { field: 'user_status', operator: 'eq', values: ['active'] },
      ]);
    });

    it('should transform string "false" to user_status suspended', () => {
      const result = mapper.fromScim('active eq "false"');

      expect(result.getItems()).toEqual([
        { field: 'user_status', operator: 'eq', values: ['suspended'] },
      ]);
    });
  });

  describe('other operators', () => {
    it('should handle ne operator for id', () => {
      const result = mapper.fromScim('id ne "999"');

      expect(result.getItems()).toEqual([{ field: 'id', operator: 'ne', values: ['999'] }]);
    });

    it('should handle gt operator for id', () => {
      const result = mapper.fromScim('id gt "100"');

      expect(result.getItems()).toEqual([{ field: 'id', operator: 'gt', values: ['100'] }]);
    });

    it('should handle lt operator for id', () => {
      const result = mapper.fromScim('id lt "1000"');

      expect(result.getItems()).toEqual([{ field: 'id', operator: 'lt', values: ['1000'] }]);
    });
  });

  describe('AND filters', () => {
    it('should handle two conditions with AND', () => {
      const result = mapper.fromScim('userName eq "john@test.com" and active eq true');

      expect(result.getItems()).toHaveLength(2);
      expect(result.getItems()).toContainEqual({
        field: 'externalId',
        operator: 'eq',
        values: ['john@test.com'],
      });
      expect(result.getItems()).toContainEqual({
        field: 'user_status',
        operator: 'eq',
        values: ['active'],
      });
    });

    it('should handle multiple AND conditions', () => {
      const result = mapper.fromScim(
        'name.givenName eq "John" and name.familyName eq "Doe" and active eq true',
      );

      expect(result.getItems()).toHaveLength(3);
    });
  });

  describe('unsupported fields and operators', () => {
    it('should ignore unsupported SCIM fields', () => {
      const result = mapper.fromScim('emails.value eq "test@test.com"');

      expect(result.isEmpty()).toBe(true);
    });

    it('should ignore unsupported operators like co (contains)', () => {
      const result = mapper.fromScim('userName co "john"');

      expect(result.isEmpty()).toBe(true);
    });

    it('should ignore unsupported operators like sw (starts with)', () => {
      const result = mapper.fromScim('userName sw "john"');

      expect(result.isEmpty()).toBe(true);
    });

    it('should ignore unsupported operators like pr (present)', () => {
      const result = mapper.fromScim('externalId pr');

      expect(result.isEmpty()).toBe(true);
    });

    it('should process supported parts of mixed filter', () => {
      const result = mapper.fromScim('userName eq "john@test.com" and displayName co "John"');

      expect(result.getItems()).toHaveLength(1);
      expect(result.getItems()[0]).toEqual({
        field: 'externalId',
        operator: 'eq',
        values: ['john@test.com'],
      });
    });
  });

  describe('toQueryString output', () => {
    it('should produce correct Brivo API query string', () => {
      const result = mapper.fromScim('userName eq "john@test.com"');

      expect(result.toQueryString()).toBe('externalId__eq:john@test.com');
    });

    it('should produce correct query string for multiple filters', () => {
      const result = mapper.fromScim('name.givenName eq "John" and name.familyName eq "Doe"');

      expect(result.toQueryString()).toBe('firstName__eq:John;lastName__eq:Doe');
    });

    it('should produce correct query string for active filter', () => {
      const result = mapper.fromScim('active eq true');

      expect(result.toQueryString()).toBe('user_status__eq:active');
    });
  });
});
