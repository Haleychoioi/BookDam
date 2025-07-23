import prisma from "../utils/prisma"; // Prisma 클라이언트 임포트

export const postService = {
  // 게시물 목록 조회
  async getPosts({
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
    // TODO: 다른 정렬 기준 추가 ('popular' 등)

    // communityId가 없는(NULL) 일반 게시물만 포함
    const posts = await prisma.post.findMany({
      where: {
        type: "GENERAL",
        team: null, // team 관계가 없는 게시물 (모집글이 아닌 일반글)
      },
      select: {
        postId: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          // 작성자 정보 포함
          select: {
            userId: true,
            nickname: true,
          },
        },
        _count: {
          // 댓글 수 포함
          select: { comments: true },
        },
      },
      orderBy,
      skip,
      take: size,
    });

    const totalCount = await prisma.post.count({
      where: {
        type: "GENERAL",
        team: null,
      },
    });
    const totalPages = Math.ceil(totalCount / size);

    const formattedPosts = posts.map((post) => ({
      id: post.postId,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.user.nickname,
      commentCount: post._count.comments,
      type: "general",
    }));

    return { posts: formattedPosts, totalPages, currentPage: page };
  },

  // 게시물 작성
  async createPost(
    userId: number,
    { title, content }: { title: string; content: string }
  ) {
    const newPost = await prisma.post.create({
      data: {
        userId,
        title,
        content,
        type: "GENERAL",
        // maxMembers는 RECRUITMENT 타입일 때만 사용하므로 여기에선 설정 안함
      },
    });
    return newPost;
  },

  // 특정 게시물 상세 조회
  async getPostById(postId: number) {
    const post = await prisma.post.findUnique({
      where: {
        postId: postId,
        type: "GENERAL",
        team: null,
      },
      include: {
        user: {
          // 작성자 정보 포함
          select: {
            userId: true,
            nickname: true,
            email: true, // 필요한 경우
          },
        },
        _count: {
          // 댓글 수 포함
          select: { comments: true },
        },
      },
    });

    if (!post) return null;

    return {
      id: post.postId,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.user.nickname,
      authorId: post.user.userId,
      commentCount: post._count.comments,
      type: "general",
      // communityId: null // 명세에 `communityId`는 없으나 혹시 필요할 경우
    };
  },

  // 특정 게시물 수정
  async updatePost(
    postId: number,
    userId: number,
    { title, content }: { title: string; content: string }
  ) {
    const post = await prisma.post.findUnique({
      where: { postId },
      select: { userId: true },
    });

    if (!post || post.userId !== userId) {
      return null;
    }

    const updatedPost = await prisma.post.update({
      where: { postId },
      data: { title, content },
    });
    return updatedPost;
  },

  // 특정 게시물 삭제
  async deletePost(postId: number, userId: number) {
    const post = await prisma.post.findUnique({
      where: { postId },
      select: { userId: true },
    });

    if (!post || post.userId !== userId) {
      return false;
    }

    await prisma.post.delete({
      where: { postId },
    });
    return true;
  },
};
