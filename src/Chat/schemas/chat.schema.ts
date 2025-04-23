import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../User/User.schema';

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  participants: User[];

  @Prop({ default: false })
  isGroupChat: boolean;

  @Prop()
  chatName?: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
