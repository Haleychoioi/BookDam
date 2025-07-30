
// 클라이언트 -> 서버
interface JoinRoomPayload {
  teamId: number;
}

// 클라이언트 -> 서버
interface SendMessagePayload {
  teamId: number;
  message: string;
}

// 서버 -> 클라이언트
interface ReceiveMessagePayload {
  authorNickname: string;
  content: string;
  createdAt: Date;
}


// 응답을 바로 받지 않는 일방적인 전달
// 요청과 응답이 서로 다른 이벤트로 오가는 비동기 방식이어서 => void 사용 / 보내는, 받는 이벤트가 서로 다른, 분리된 통신이라는것을 타입으로 명시

// 클라이언트가 서버로 보내는 이벤트 목록
export interface ClientToServerEvents {
  join_room: (data: JoinRoomPayload) => void; 
  send_message: (data: SendMessagePayload) => void;
}

// 서버가 클라이언트로 보내는 이벤트 목록
export interface ServerToClientEvents {
  receive_message: (payload: ReceiveMessagePayload) => void;
  system_message: (message: string) => void;
  error_message: (message: string) => void;
}


export interface SocketData {
  user: {
    userId: number;
    nickname: string;
  };
}

export interface InterServerEvents {}