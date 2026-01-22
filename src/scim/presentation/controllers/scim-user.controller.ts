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
  Patch,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ScimUserService } from '@scim/application';
import {
  CreateScimUserDto,
  PatchUserDto,
  ScimUserDto,
  ScimUserListDto,
  UpdateScimUserDto,
} from '@scim/contracts';
import { s_CreateUser } from '@scim/contracts';

import { ScimExceptionFilter } from '../filters';
import { ScimBasicAuthGuard } from '../guards';
import { ZodValidationPipe } from '../pipes';

@UseFilters(ScimExceptionFilter)
@UseGuards(ScimBasicAuthGuard)
@Controller('scim/v2/Users')
export class ScimUserController {
  constructor(private readonly userService: ScimUserService) {}

  @Get()
  @Header('Content-Type', 'application/scim+json')
  public getUsers(
    @Query('startIndex', new DefaultValuePipe(1), ParseIntPipe) startIndex: number,
    @Query('count', new DefaultValuePipe(100), ParseIntPipe) count: number,
    @Query('filter') filter?: string,
  ): Promise<ScimUserListDto> {
    return this.userService.getAll(startIndex, count, filter);
  }

  @Get(':id')
  @Header('Content-Type', 'application/scim+json')
  public getUserById(@Param('id') id: string): Promise<ScimUserDto> {
    return this.userService.getById(id);
  }

  @Post()
  @Header('Content-Type', 'application/scim+json')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(s_CreateUser))
  public create(@Body() body: CreateScimUserDto): Promise<ScimUserDto> {
    return this.userService.create(body);
  }

  @Patch(':id')
  @Header('Content-Type', 'application/scim+json')
  public patch(@Param('id') id: string, @Body() body: PatchUserDto): Promise<ScimUserDto> {
    return this.userService.patch(id, body);
  }

  @Put(':id')
  @Header('Content-Type', 'application/scim+json')
  public update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(s_CreateUser)) body: UpdateScimUserDto,
  ): Promise<ScimUserDto> {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public delete(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }
}
