import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationDto } from './dto/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/cosmetics')
  async getUserCosmetics(@Param('id') id: string) {
    return this.usersService.getUserCosmetics(id);
  }
}
