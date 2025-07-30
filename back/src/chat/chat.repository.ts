import prisma from '../utils/prisma'

class ChatRepository {

    // 팀멤버 존재 여부
    async findMembership(userId: number, teamId: number) {
        return await prisma.teamMember.findUnique({
            where: { userId_teamId: {userId, teamId}}
        });
    }

    // 팀 채팅 메세지 생성
    async createMessage(userId: number, teamId: number, message: string) {
        return await prisma.teamChatMessage.create({
            data: {
                userId,
                teamId,
                content: message,
                messageType: 'MESSAGE'
            },
            include: {
                user: { select: { nickname: true }}
            }
        });
    }

};

export default new ChatRepository();