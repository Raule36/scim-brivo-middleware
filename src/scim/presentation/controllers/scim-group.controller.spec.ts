import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ScimGroupService } from '@scim/application';
import { CreateScimGroupDto } from '@scim/contracts';
import request from 'supertest';

import { ScimExceptionFilter } from '../filters';
import { ScimBasicAuthGuard } from '../guards';
import { ScimGroupController } from './scim-group.controller';

describe('ScimGroupController', () => {
  let app: INestApplication;
  let mockGroupService: jest.Mocked<ScimGroupService>;

  beforeEach(async () => {
    mockGroupService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ScimGroupController],
      providers: [{ provide: ScimGroupService, useValue: mockGroupService }],
    })
      .overrideGuard(ScimBasicAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();

    app.useGlobalFilters(new ScimExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /scim/v2/Groups', () => {
    it('sshould return 200 with Content-Type application/scim+json', async () => {
      mockGroupService.getAll.mockResolvedValue({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 0,
        startIndex: 1,
        itemsPerPage: 0,
        Resources: [],
      });

      await request(app.getHttpServer())
        .get('/scim/v2/Groups')
        .expect(200)
        .expect('Content-Type', /application\/scim\+json/);
    });

    it('should pass query parameters to service', async () => {
      mockGroupService.getAll.mockResolvedValue({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 0,
        startIndex: 10,
        itemsPerPage: 0,
        Resources: [],
      });

      await request(app.getHttpServer()).get('/scim/v2/Groups?startIndex=10&count=25').expect(200);

      expect(mockGroupService.getAll).toHaveBeenCalledWith(10, 25, undefined);
    });
  });

  describe('POST /scim/v2/Groups', () => {
    it('should return 201 for valid group', async () => {
      const createDto: CreateScimGroupDto = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
        displayName: 'New Team',
      };
      mockGroupService.create.mockResolvedValue({ ...createDto, id: '123' });

      await request(app.getHttpServer()).post('/scim/v2/Groups').send(createDto).expect(201);
    });

    it('should return 400 for invalid body', async () => {
      await request(app.getHttpServer())
        .post('/scim/v2/Groups')
        .send({ schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'] })
        .expect(400);
    });
  });

  describe('DELETE /scim/v2/Groups/:id', () => {
    it('should return 204 with no content', async () => {
      mockGroupService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/scim/v2/Groups/123').expect(204).expect('');
    });
  });
});
