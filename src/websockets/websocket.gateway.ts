import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: false,
  },
})
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  // Emitir un evento personalizado
  emitEvent(eventName: string, data: any) {
    this.server.emit(eventName, data);
  }
}
