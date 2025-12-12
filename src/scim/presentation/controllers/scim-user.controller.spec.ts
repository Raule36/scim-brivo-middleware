import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ScimUserService } from '@scim/application';
import { CreateScimUserDto } from '@scim/contracts';
import request from 'supertest';

import { ScimExceptionFilter } from '../filters';
import { ScimBasicAuthGuard } from '../guards';
import { ScimUserController } from './scim-user.controller';

describe('ScimUserController (integration)', () => {
  let app: INestApplication;
  let mockUserService: jest.Mocked<ScimUserService>;

  beforeEach(async () => {
    mockUserService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ScimUserController],
      providers: [{ provide: ScimUserService, useValue: mockUserService }],
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

  describe('GET /scim/v2/Users', () => {
    it('should return 200 with Content-Type application/scim+json', async () => {
      mockUserService.getAll.mockResolvedValue({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 0,
        startIndex: 1,
        itemsPerPage: 0,
        Resources: [],
      });

      await request(app.getHttpServer())
        .get('/scim/v2/Users')
        .expect(200)
        .expect('Content-Type', /application\/scim\+json/);
    });

    it('should pass query parameters to service', async () => {
      mockUserService.getAll.mockResolvedValue({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 0,
        startIndex: 10,
        itemsPerPage: 0,
        Resources: [],
      });

      await request(app.getHttpServer())
        .get('/scim/v2/Users?startIndex=10&count=25&filter=userName%20eq%20%22john%22')
        .expect(200);

      expect(mockUserService.getAll).toHaveBeenCalledWith(10, 25, 'userName eq "john"');
    });
  });

  describe('POST /scim/v2/Users', () => {
    it('should return 201 when user created', async () => {
      const createDto: CreateScimUserDto = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName: 'new@test.com',
        active: true,
        groups: [],
        emails: [],
      };

      const createdUser = { ...createDto, id: '456', emails: [], groups: [], meta: {} };
      mockUserService.create.mockResolvedValue(createdUser);

      await request(app.getHttpServer()).post('/scim/v2/Users').send(createDto).expect(201);
    });

    it('should return 400 for invalid body', async () => {
      const invalidDto = { invalid: 'data' };

      const response = await request(app.getHttpServer())
        .post('/scim/v2/Users')
        .send(invalidDto)
        .expect(400);

      expect(response.body.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:Error');
    });
  });

  describe('DELETE /scim/v2/Users/:id', () => {
    it('should return 204 with no content', async () => {
      mockUserService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/scim/v2/Users/123').expect(204).expect('');
    });
  });
});
