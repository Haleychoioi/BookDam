import { Server, Socket } from 'socket.io';
import chatService from "./chat.service";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from './chat.types';

// 타입
// Server => Socket.IO 서버, 채팅방 전체 / Socket => 개별 클라이언트와의 연결, 채팅방에 들어와있는 한명의 사용자
type IoServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type IoSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

class ChatController {

    public registerHandlers(io: IoServer, socket: IoSocket): void {
        // join_room이 오면 handleJoinRoom 실행
        socket.on('join_room', this.handleJoinRoom(io, socket));

        socket.on('send_message', this.handleSendMessage(io, socket));
    }

    // 필수적인 객체를 실제 로직이 실행되기 전에 미리 주입 => 실제 로직 함수는 (teamId) 이벤트에 꼭 필요한 데이터에만 집중할 수 있음
                                                            // return 생략 / 반환된 함수가 클라이언트로부터 teamId를 받아 실제 입장 로직 처리
    private handleJoinRoom = (io: IoServer, socket: IoSocket) => async ({ teamId }: { teamId: number }) => {
        try {
            const userId = socket.data.user?.userId;
            if (!userId) {
            return socket.emit('error_message', '인증 정보가 없습니다.');
            }

            const isMember = await chatService.isUserTeamMember(userId, teamId);

            if (isMember) {
                await socket.join(String(teamId));
                socket.emit('system_message', '채팅방에 입장했습니다.');
            } else {
                socket.emit('error_message', '이 팀의 멤버가 아닙니다');
            }
        } catch (error) {
            socket.emit('error_message', '방 입장에 실패했습니다.');
        }
    };


    private handleSendMessage = (io: IoServer, socket: IoSocket) => async ({ teamId, message }: { teamId: number; message: string; }) => {
    try {
        const userId = socket.data.user?.userId;
        const nickname = socket.data.user?.nickname;

        if (!userId || !nickname) {
            return socket.emit('error_message', '인증 정보가 없습니다.');
        }

        if (!socket.rooms.has(String(teamId))) {
            return socket.emit('error_message', '참여하지 않은 방입니다.');
        }

        const savedMessage = await chatService.addMessageToTeamChat(userId, teamId, message);

        // 같은 방의 모든 클라이언트에게 메시지 브로드캐스트
        io.to(String(teamId)).emit('receive_message', {
            authorNickname: nickname,
            content: savedMessage.content,
            createdAt: savedMessage.createdAt,
        });

    } catch(error) {
        console.error(`[Socket Error] Message send failed in room ${teamId}:`, error);
        socket.emit('error_message', '메시지 전송에 실패했습니다.');
    }
};

}

export default new ChatController();