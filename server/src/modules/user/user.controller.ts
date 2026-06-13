import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './user.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * 用户管理控制器
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Post()
  @Roles('chairman', 'hr')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @Roles('chairman', 'hr')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('chairman', 'hr')
  async remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Put(':id/role')
  @Roles('chairman', 'hr')
  async changeRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.userService.update(+id, { role: body.role } as UpdateUserDto);
  }

  @Post(':id/reset-password')
  @Roles('chairman', 'hr')
  async resetPassword(@Param('id') id: string) {
    return this.userService.resetPassword(+id);
  }
}
