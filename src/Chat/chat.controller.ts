import { Controller, Get, Post, Body, Query, UseGuards, UnauthorizedException, NotFoundException, Headers } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../Infra/Guards/jwt/jwt.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('chat')
@UseGuards(JwtAuthGuard)  
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService  // Injeta o JwtService
    ) {}


    @Get()
    async getMyChats(@Headers('authorization') authHeader: string) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token não fornecido ou mal formatado');
        }

        const token = authHeader.replace('Bearer ', '').trim();

        let userId: string;
        try {
        const payload = this.jwtService.decode(token) as { sub: string }; // Decodifica o token
        userId = payload?.sub;
        } catch (e) {
        throw new UnauthorizedException('Token inválido');
        }

        if (!userId) {
        throw new UnauthorizedException('ID do usuário não encontrado no token');
        }

        // Obtém os chats do usuário
        const chats = await this.chatService.getUserChatsLastMessages(userId);
        if (!chats || chats.length === 0) {
        throw new NotFoundException('Nenhum chat encontrado');
        }

        return chats;
    }

    @Get('messages')
    async getMessagesByChat(
        @Query('chatId') chatId: string,
        @Query('limit') limit: string = '10', // Definido como string com valor padrão '10'
        @Query('beforeDate') beforeDate?: string,
    ) {
        const parsedLimit = parseInt(limit, 10); // Converte a string para número inteiro
        
        // Verifica se a conversão foi bem-sucedida e se o valor é maior que 0
        if (isNaN(parsedLimit) || parsedLimit <= 0) {
            throw new Error('Limit inválido, deve ser um número inteiro positivo.');
        }
        
        const dateBefore = beforeDate ? new Date(beforeDate) : undefined; // Convertendo a string para Date
        return this.chatService.getMessagesByChat(chatId, dateBefore, parsedLimit);
    }    

}
