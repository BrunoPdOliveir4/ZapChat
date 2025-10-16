import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { UserService } from 'src/User/User.service';

@WebSocketGateway( { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}
  private onlineUsers = new Map<string, Set<string>>(); 

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.query?.token;
  
    try {
      const payload = this.jwtService.verify(token as string);
      const userId = payload.sub;
  
      client.data.user = { id: userId, username: payload.username };
      client.join(userId);
  
      // Armazena o socket.id para o userId
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)?.add(client.id);
  
      console.log(`User ${payload.username} connected`);
    } catch (err) {
      console.log('Invalid JWT');
      client.disconnect();
    }
  }
  

  handleDisconnect(client: Socket) {
    const userId = client.data?.user?.id;
    if (userId) {
      const sockets = this.onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.onlineUsers.delete(userId);
          console.log(`User ${client.data.user.username} is now offline`);
        }
      }
    }
  
    console.log(`Client disconnected: ${client.id}`);
  }
  


  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
 
    const { userId, chatId, content } = data;
    if (!chatId || !content) {
      return client.emit('error', { message: 'chatId and content are required.' });
    }
    
    let message = await this.chatService.sendMessage(
      userId,
      chatId,
      content,
    );
    console.log(client.data.user)
    const newMessage = {
      _id: message._id,
      chat: message.chat,
      content: message.content,
      createdAt: Date.now(),
      sender: {_id: userId, username: client.data.user.username}
    }

    const participants = await this.chatService.getChatParticipants(chatId);

    for (const participant of participants) {
      this.server.to(participant._id.toString()).emit('receiveMessage', newMessage);
    }

  }


  @SubscribeMessage('createChat')
  async handleCreateChat(
    @MessageBody()
    data: { participants: string[]; isGroupChat?: boolean; chatName?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const users = await Promise.all(
        data.participants.map((username) => this.userService.findByUsername(username))
      );
      console.log(data)
      const participants = users.map((user) => ({
        username: user.username,
        _id: user._id.toString(),
      }));

      const chat = await this.chatService.createChat(
        participants,
        data.isGroupChat,
        data.chatName,
      );
      console.log(chat);
      participants.forEach((user) => {
        this.server.to(user._id).emit('chatCreated', chat);
      });

    } catch (error) {
      console.error('Erro ao criar chat:', error.message);
      client.emit('error', { message: error.message || 'Erro ao criar chat.' });
    }
  }



  @SubscribeMessage('isOnline')
  async handleOnline(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const participants = await this.chatService.getChatParticipants(data.chatId);

    const onlineStatus = participants.map((participant) => {
      const userId = participant._id.toString();
      const isOnline = this.onlineUsers.has(userId) && this.onlineUsers.get(userId)!.size > 0;

      return {
        userId,
        username: participant.username,
        online: isOnline,
      };
    });

    client.emit('onlineStatus', onlineStatus);
  }

}
