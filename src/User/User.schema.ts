import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    toObject(): { [x: string]: any; password: any; } {
        throw new Error('Method not implemented.');
    }
    _id: string;
    
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
