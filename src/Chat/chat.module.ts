import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtStrategy } from 'src/Infra/Guards/jwt/jwt.strategy';
import { ChatController } from './chat.controller';
import { JwtConfigModule } from 'src/Infra/Guards/jwt/jwt.module';
import { CryptModule } from 'src/utils/crypt.module';
import { UserModule } from 'src/User/User.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    JwtConfigModule,
    CryptModule,
    UserModule
  ],
  providers: [ChatService, ChatGateway, JwtStrategy],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
