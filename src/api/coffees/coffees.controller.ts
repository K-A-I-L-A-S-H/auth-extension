import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Request } from 'express';
import { ActiveUser } from '@/lib/decorators/activeUser.decorator';
import { ActiveUserData, UserRoles } from '../iam/types';
import { Roles } from '@/lib/decorators/roles.decorator';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Roles(UserRoles.admin)
  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Get()
  findAll(@ActiveUser() user: ActiveUserData) {
    return this.coffeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coffeesService.findOne(+id);
  }

  @Roles(UserRoles.admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(+id, updateCoffeeDto);
  }

  @Roles(UserRoles.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(+id);
  }
}
