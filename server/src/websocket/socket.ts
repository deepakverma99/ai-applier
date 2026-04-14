import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

class SocketService {
  private io: Server | null = null;

  init(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log('⚡ User connected:', socket.id);

      socket.on('join', (userId: string) => {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their room`);
      });

      socket.on('disconnect', () => {
        console.log('❌ User disconnected');
      });
    });
  }

  emitToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(userId).emit(event, data);
    }
  }
}

export const socketService = new SocketService();
