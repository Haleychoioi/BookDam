import chatRepository from "./chat.repository";

class ChatService {

    // 특정 팀의 멤버인지 확인
    async isUserTeamMember(userId: number, teamId: number): Promise<boolean> {

        const membership = await chatRepository.findMembership(userId, teamId);
        return !!membership; // boolean 타입으로 변환하기 위해 사용 = Boolean(membership)
    }

    // 메세지 생성
    async addMessageToTeamChat(userId: number, teamId: number, message: string) {

        const savedMessage = await chatRepository.createMessage(userId, teamId, message);

        return savedMessage;
    }
}

export default new ChatService();