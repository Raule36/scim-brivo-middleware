import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ScimGroupService } from '@scim/application';
import {
  CreateScimGroupDto,
  ScimGroupDto,
  ScimGroupListDto,
  UpdateScimGroupDto,
} from '@scim/contracts';
import { s_CreateGroup, s_Group } from '@scim/contracts';

import { ZodValidationPipe } from '../pipes';

@Controller('scim/v2/Groups')
export class ScimGroupController {
  constructor(private readonly groupService: ScimGroupService) {}

  @Get()
  @Header('Content-Type', 'application/scim+json')
  public getUsers(
    @Query('startIndex', new DefaultValuePipe(1), ParseIntPipe) startIndex: number,
    @Query('count', new DefaultValuePipe(100), ParseIntPipe) count: number,
    @Query('filter') filter?: string,
  ): Promise<ScimGroupListDto> {
    return this.groupService.getAll(startIndex, count, filter);
  }

  @Get(':id')
  @Header('Content-Type', 'application/scim+json')
  public getUserById(@Param('id') id: string): Promise<ScimGroupDto> {
    return this.groupService.getById(id);
  }

  @Post()
  @Header('Content-Type', 'application/scim+json')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(s_CreateGroup))
  public create(@Body() body: CreateScimGroupDto): Promise<ScimGroupDto> {
    return this.groupService.create(body);
  }

  @Put(':id')
  @Header('Content-Type', 'application/scim+json')
  public update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(s_Group)) body: UpdateScimGroupDto,
  ): Promise<ScimGroupDto> {
    return this.groupService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public delete(@Param('id') id: string): Promise<void> {
    return this.groupService.delete(id);
  }
}
