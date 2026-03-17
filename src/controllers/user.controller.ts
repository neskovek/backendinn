import { Controller, Get, Delete, Param, Body, Put, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { SessionUser } from 'src/decorators/sessionUser.decorator';

@ApiTags('users')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findAll(Number(page) || 1, Number(limit) || 100);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateUserDto, @SessionUser() user: any) {
    if (
      user.role !== 'admin'
      && user.sub !== id
    ) throw new ForbiddenException('Access denied');

    return this.usersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @SessionUser() user: any) {
    if (
      user.role !== 'admin'
      && user.sub !== id
    ) throw new ForbiddenException('Access denied');
  
    return this.usersService.delete(id);
  }
}
