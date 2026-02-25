import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'call',
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('CallGateway');
    private expertSockets = new Map<number, string>(); // expertId -> socketId

    handleConnection(client: Socket) {
        this.logger.log(`Client connected to call: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected from call: ${client.id}`);
        for (const [expertId, socketId] of this.expertSockets.entries()) {
            if (socketId === client.id) {
                this.expertSockets.delete(expertId);
                this.logger.log(`Expert ${expertId} unregistered from call due to disconnect`);
                break;
            }
        }
    }

    @SubscribeMessage('register_expert')
    handleRegisterExpert(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { expertId: number },
    ) {
        this.expertSockets.set(payload.expertId, client.id);
        client.join(`expert_${payload.expertId}`);
        this.logger.log(`Expert ${payload.expertId} registered for calls`);
        return { status: 'registered' };
    }

    notifyExpertNewCall(expertId: number, callData: any) {
        this.server.to(`expert_${expertId}`).emit('new_call_request', callData);
        this.logger.log(`Notified expert room expert_${expertId} of new call ${callData.session.id}`);
    }

    @SubscribeMessage('join_call_room')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { sessionId: number },
    ) {
        client.join(`call_room_${payload.sessionId}`);
        this.logger.log(`Client ${client.id} joined call_room_${payload.sessionId}`);
        return { status: 'joined' };
    }
}
