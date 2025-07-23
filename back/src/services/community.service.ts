import prisma from "../utils/prisma";
import {
  PostType,
  CommunityStatus,
  TeamRole,
  ApplicationStatus,
} from "@prisma/client";

export const communityService = {
  // 퍼블릭 커뮤니티 (모집글) 목록 조회
  async getPublicCommunities({
    page,
    size,
    sort,
  }: {
    page: number;
    size: number;
    sort: string;
  }) {
    const skip = (page - 1) * size;
    const orderBy: any = {};
    if (sort === "latest") {
      orderBy.createdAt = "desc";
    }

    const communities = await prisma.post.findMany({
      where: {
        type: PostType.RECRUITMENT, // 모집글만 조회
        // team 관계가 null이거나, team의 status가 RECRUITING인 경우를 OR 조건으로 처리
        OR: [
          {
            team: null, // 팀이 아직 생성되지 않은 모집글
          },
          {
            team: {
              is: {
                // team 관계가 존재하고, 그 team의 status가 RECRUITING인 경우
                status: CommunityStatus.RECRUITING,
              },
            },
          },
        ],
      },
      select: {
        postId: true,
        title: true,
        content: true,
        maxMembers: true,
        createdAt: true,
        user: {
          // 작성자 (모집장) 정보
          select: {
            nickname: true,
          },
        },
        team: {
          // 모집글과 연결된 팀 정보 (현재 모집 인원 파악용)
          select: {
            status: true, // 상태 정보도 가져와서 매핑에 사용
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy,
      skip,
      take: size,
    });

    const totalCount = await prisma.post.count({
      where: {
        type: PostType.RECRUITMENT,
        OR: [
          {
            team: null,
          },
          {
            team: {
              is: {
                status: CommunityStatus.RECRUITING,
              },
            },
          },
        ],
      },
    });
    const totalPages = Math.ceil(totalCount / size);

    const formattedCommunities = communities.map((post) => ({
      id: post.postId,
      title: post.title,
      description: post.content, // 스키마에 description이 없으므로 content를 사용
      maxMembers: post.maxMembers,
      currentMembers: post.team ? post.team._count.members : 0, // 현재 팀원 수
      status: post.team ? post.team.status : CommunityStatus.RECRUITING, // 팀이 없으면 모집중으로 간주
      createdAt: post.createdAt,
      authorNickname: post.user.nickname,
    }));

    return { communities: formattedCommunities, totalPages, currentPage: page };
  },

  // 특정 도서 관련 커뮤니티 목록 조회
  async getCommunitiesByBook(
    bookIsbn13: string,
    { page, size }: { page: number; size: number }
  ) {
    const skip = (page - 1) * size;

    const communities = await prisma.teamCommunity.findMany({
      where: {
        bookIsbn13: bookIsbn13,
        status: {
          in: [CommunityStatus.RECRUITING, CommunityStatus.ACTIVE], // 모집중이거나 활동중인 팀만
        },
      },
      select: {
        teamId: true,
        status: true,
        createdAt: true,
        recruitmentPost: {
          // 모집글 정보 (이름, 설명, 모집인원)
          select: {
            title: true,
            content: true,
            maxMembers: true,
            user: {
              select: { nickname: true },
            },
          },
        },
        book: {
          // 책 정보
          select: {
            title: true,
            author: true,
            cover: true,
          },
        },
        _count: {
          // 현재 멤버 수
          select: { members: true },
        },
      },
      skip,
      take: size,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.teamCommunity.count({
      where: { bookIsbn13: bookIsbn13 },
    });
    const totalPages = Math.ceil(totalCount / size);

    const formattedCommunities = communities.map((team) => ({
      id: team.teamId,
      title: team.recruitmentPost.title,
      description: team.recruitmentPost.content,
      bookTitle: team.book?.title,
      bookCover: team.book?.cover,
      status: team.status,
      maxMembers: team.recruitmentPost.maxMembers,
      currentMembers: team._count.members,
      leaderNickname: team.recruitmentPost.user.nickname,
    }));

    return { communities: formattedCommunities, totalPages, currentPage: page };
  },

  // 커뮤니티 가입 신청
  async applyForCommunity(
    userId: number,
    postId: number,
    applicationMessage: string
  ) {
    // 이미 지원했는지 확인
    const existingApplication = await prisma.teamApplication.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingApplication) {
      throw new Error("이미 이 커뮤니티에 지원했습니다.");
    }

    // 모집글이 존재하는지 확인
    const recruitmentPost = await prisma.post.findUnique({
      where: { postId: postId },
      select: { type: true },
    });

    if (!recruitmentPost || recruitmentPost.type !== PostType.RECRUITMENT) {
      throw new Error("유효한 모집글이 아닙니다.");
    }

    await prisma.teamApplication.create({
      data: {
        userId,
        postId,
        applicationMessage,
        status: ApplicationStatus.PENDING, // 대기 상태로 생성
      },
    });
  },

  // 도서 기반 커뮤니티 생성 (모집글 작성 후 팀 생성)
  async createTeamCommunity(
    userId: number,
    data: {
      bookId: string;
      name: string;
      description: string;
      category: string;
      maxMembers?: number;
    }
  ) {
    const { bookId, name, description, maxMembers } = data; // category는 Post 모델에는 없음

    // 1. 모집글 (Post) 생성
    const newPost = await prisma.post.create({
      data: {
        userId,
        type: PostType.RECRUITMENT, // 모집글 타입으로 설정
        title: name, // 커뮤니티 이름이 모집글 제목이 됨
        content: description, // 커뮤니티 설명이 모집글 내용이 됨
        maxMembers: maxMembers, // 모집 인원 설정
      },
    });

    // 2. TeamCommunity 생성 (모집글과 연결)
    const newTeamCommunity = await prisma.teamCommunity.create({
      data: {
        postId: newPost.postId,
        bookIsbn13: bookId, // 팀에서 읽을 책 ISBN (선택 사항일 경우 null 가능)
        status: CommunityStatus.RECRUITING, // 초기 상태는 모집중
      },
    });

    // 3. 팀장 (TeamMember)으로 사용자 추가
    await prisma.teamMember.create({
      data: {
        userId: userId,
        teamId: newTeamCommunity.teamId,
        role: TeamRole.LEADER, // 생성자가 팀장이 됨
      },
    });

    return newTeamCommunity; // 생성된 팀 커뮤니티 정보 반환
  },
};
