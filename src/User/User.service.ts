// src/user/user.service.ts

import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './User.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    async createUser(data: { username: string; password: string }): Promise<User> {
        const uname = data.username;
        const user = await this.userModel.findOne({ uname }).exec();
        if(user){
            throw new BadRequestException('Usuário já existe.')
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        const newUser = new this.userModel({
            username: data.username,
            password: hashedPassword,
        });

        return newUser.save();
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find();
    }
    
    async findById(id: string): Promise<User> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('ID inválido');
        }

        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return user;
    }


    async findByUsername(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username }).exec();
        if (!user) throw new NotFoundException('Usuário não encontrado');
        return user;
    }
 
    async updateUser(id: string, data: { username: string; password: string }): Promise<User> {
        const updatedUser = await this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!updatedUser) throw new NotFoundException('Usuário não encontrado');
        return updatedUser;
    }

    async deleteUser(id: string): Promise<{ message: string }> {
        const result = await this.userModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException('Usuário não encontrado');
        return { message: 'Usuário deletado com sucesso' };
    }
}
