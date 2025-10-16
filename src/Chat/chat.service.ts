import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { Message } from './schemas/message.schema';
import { CryptoService } from 'src/utils/crypt.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @Inject(CryptoService) private crypter: CryptoService
  ) {}

  async createChat(
    participants: { username: string; _id: string }[],
    isGroupChat = false,
    chatName?: string,
  ): Promise<Chat> {
    const sortedIds = participants.map(p => p._id).sort();
  
    const existingChats = await this.chatModel.find({
      participants: { $all: sortedIds, $size: sortedIds.length },
    });
  
    for (const chat of existingChats) {
      const existingIds = chat.participants.map(p => p.toString()).sort();
  
      const sameParticipants = JSON.stringify(existingIds) === JSON.stringify(sortedIds);
      const sameChatName = chat.chatName === chatName;
  
      if (sameParticipants && (!chatName || sameChatName)) {
        throw new Error('Já existe um chat com os mesmos participantes e nome.');
      }
    }
  
    const chat = new this.chatModel({
      participants: sortedIds, // apenas _ids no Mongo
      isGroupChat,
      chatName,
    });
  
    const savedChat = await chat.save();
  
    // retorna com nomes
    return {
      ...savedChat.toObject(),
      participants,
    } as any;
  }
  

  async getUserChats(userId: string): Promise<Chat[]> {
    return this.chatModel.find({ participants: userId }).populate('participants');
  }

  async sendMessage(senderId: string, chatId: string, content: string): Promise<Message> {
    try {
      // Certifique-se de que a criptografia seja completada antes de salvar
      const hashedMessage = await this.crypter.encrypt(content, chatId);
      const message = new this.messageModel({ sender: senderId, chat: chatId, content: hashedMessage });
      const newMessage = await await message.save();
      newMessage.content = await this.crypter.decrypt(message.content, chatId);
      return newMessage;
    } catch (error) {
      // Tratamento de erro adequado
      throw new Error('Erro ao enviar a mensagem');
    }
  }

  async getMessagesByChat(chatId: string, beforeDate?: Date, limit = 10): Promise<Message[]> {
    try {
      const query: any = { chat: chatId };
  
      // Se uma data de referência foi passada, buscar mensagens mais antigas que ela
      if (beforeDate) {
        query.createdAt = { $lt: beforeDate };
      }
  
      // Buscando as mensagens
      const messages = await this.messageModel
        .find(query)
        .sort({ createdAt: -1 }) // Ordena por data mais recente primeiro
        .limit(limit)
        .populate('sender', 'username'); // Popula o campo sender com o username
  
      // Decriptografando as mensagens
      for (const message of messages) {
        try {
          message.content = await this.crypter.decrypt(message.content, chatId); // Decriptografando
        } catch (error) {
          console.error('Erro ao decriptar a mensagem:', error);
          message.content = 'Erro ao decriptar a mensagem';
        }
      }
  
      // Retorna as mensagens em ordem crescente (as mais antigas primeiro)
      return messages.reverse();
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw new Error('Erro ao buscar mensagens');
    }
  }
  

  async getUserChatsLastMessages(personId: string): Promise<{ chat: Chat; messages: Message[] }[]> {
    try {
      const chats = await this.chatModel
        .find({ participants: personId })
        .populate('participants', 'username'); // Populando participantes
  
      const results = await Promise.all(
        chats.map(async (chat) => {
          const messages = await this.messageModel
            .find({ chat: chat.id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('sender', 'username'); // Populando o sender com username
  
          // Decriptografando as mensagens
          for (const message of messages) {
            try {
              message.content = await this.crypter.decrypt(message.content, chat.id);
            } catch (error) {
              console.error('Erro ao decriptar a mensagem:', error);
              message.content = 'Erro ao decriptar a mensagem';
            }
          }
  
          return { chat, messages: messages.reverse() };
        })
      );
  
      return results;
    } catch (error) {
      console.error('Erro ao buscar chats e mensagens:', error);
      throw new Error('Erro ao buscar chats ou mensagens');
    }
  }
  
  async getChatParticipants(chatId: string): Promise<{ _id: string; username: string }[]> {
    const chat = await this.chatModel
      .findById(chatId)
      .populate('participants', 'username'); // pega _id e username

    if (!chat) throw new Error('Chat não encontrado');

    return chat.participants.map((participant: any) => ({
      _id: participant._id,
      username: participant.username,
    }));
  }

}
