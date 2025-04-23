import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
  } from '@nestjs/common';
  import { UserService } from './User.service';
  import { User } from './User.schema';
  import { AuthGuard } from '@nestjs/passport';
  import { ResponseEntity } from '../Utils/Response.entity'; 
  
  @Controller('users')
  export class UserController {
    constructor(private readonly userService: UserService) {}
  
    @Get()
    async findAll(): Promise<ResponseEntity<User[]>>{
      return ResponseEntity.ok(await this.userService.findAll());
    }
    @Post()
    async createUser(
      @Body('username') username: string,
      @Body('password') password: string,
    ): Promise<ResponseEntity<any>> {
      const user = await this.userService.createUser({ username, password });
      return ResponseEntity.created(200, 'Usuário criado com sucesso');
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ResponseEntity<User>> {
      const user = await this.userService.findById(id);
      return ResponseEntity.ok(user, 'Usuário encontrado');
    }

    @Get('/find/:username')
    async findUser(@Param('username') username:string): Promise<ResponseEntity<any>> {
      const user = await this.userService.findByUsername(username);
      return ResponseEntity.ok(username, 'ok');
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    async updateUser(
      @Param('id') id: string,
      @Body('username') username: string,
      @Body('password') password: string,
    ): Promise<ResponseEntity<User>> {
      const user = await this.userService.updateUser(id, { username, password });
      return ResponseEntity.updated(user, 'Usuário atualizado com sucesso');
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteUser(@Param('id') id: string): Promise<ResponseEntity<null>> {
      await this.userService.deleteUser(id);
      return ResponseEntity.deleted('Usuário removido com sucesso');
    }
}
  