// src/repositories/posts.repository.ts
import prisma from "../utils/prisma";
import {
  Post,
  Prisma,
  PostType,
  RecruitmentStatus,
  Comment,
} from "@prisma/client"; // ✨ RecruitmentStatus 임포트 ✨

// Comment 타입에 사용자 정보와 대댓글 포함 타입을 정의합니다.
type CommentWithUserAndReplies = Comment & {
  user: { nickname: string; profileImage: string | null } | null;
  replies: (Comment & {
    user: { nickname: string; profileImage: string | null } | null;
  })[];
};

// PostWithRelations 타입을 Prisma의 findUnique/findMany 결과에 맞게 재정의합니다.
type PostWithRelations = Post & {
  user: { nickname: string; profileImage: string | null } | null;
  comments: CommentWithUserAndReplies[];
  // Prisma의 _count는 자동 생성된 타입에 포함될 수 있으므로, 명시적으로 추가하지 않아도 될 수 있습니다.
  // 필요한 경우 PrismaClientOptions의 log 속성에서 쿼리 로그를 확인하여 정확한 구조를 파악하세요.
  // _count?: { comments: number };
};

export class PostRepository {
  public async findByUserId(userId: number, type?: PostType): Promise<Post[]> {
    const where: Prisma.PostWhereInput = {
      userId: userId,
    };

    if (type) {
      where.type = type;
    }

    return prisma.post.findMany({
      where,
      include: {
        user: { select: { nickname: true, profileImage: true } },
        _count: { select: { comments: true } }, // _count 포함
        book: {
          select: { title: true, author: true, cover: true, isbn13: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * 모든 게시물 또는 특정 타입의 게시물 목록 조회
   * @param query
   * @returns
   */
  public async findMany(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
    type?: PostType;
  }): Promise<Post[]> {
    const { page = 1, pageSize = 10, sort, type } = query;
    const skip = (page - 1) * pageSize;

    const findManyOptions: Prisma.PostFindManyArgs = {
      skip,
      take: pageSize,
      include: {
        user: {
          select: { nickname: true, profileImage: true },
        },
        _count: {
          select: { comments: true },
        },
        book: {
          select: {
            title: true,
            author: true,
            cover: true,
            isbn13: true,
          },
        },
      },
    };

    if (type) {
      findManyOptions.where = { type: type };
    }

    if (sort === "latest") {
      findManyOptions.orderBy = { createdAt: "desc" };
    } else if (sort === "oldest") {
      findManyOptions.orderBy = { createdAt: "asc" };
    }
    // 'popular' 정렬 (views 필드 오류로 인해 주석 처리)
    // else if (sort === "popular") {
    //   findManyOptions.orderBy = { views: "desc" };
    // }
    else {
      findManyOptions.orderBy = { createdAt: "desc" };
    }

    const posts = await prisma.post.findMany(findManyOptions);
    return posts;
  }

  /**
   * 새로운 게시물 생성
   * @param postData
   * @returns
   * @remarks
   */
  public async create(postData: {
    userId: number;
    title: string;
    content: string;
    type: PostType;
    maxMembers?: number;
    recruitmentStatus?: RecruitmentStatus;
    isbn13?: string;
  }): Promise<Post> {
    const newPost = await prisma.post.create({
      data: {
        // ✨ data 객체 직접 구성 ✨
        userId: postData.userId, // PostUncheckedCreateInput 스타일로 userId 직접 할당
        title: postData.title,
        content: postData.content,
        type: postData.type,
        // 선택적 필드는 undefined가 아닐 경우에만 포함
        ...(postData.maxMembers !== undefined && {
          maxMembers: postData.maxMembers,
        }),
        ...(postData.recruitmentStatus !== undefined && {
          recruitmentStatus: postData.recruitmentStatus,
        }),
        ...(postData.isbn13 !== undefined &&
          postData.isbn13 !== null && { isbn13: postData.isbn13 }), // ✨ isbn13이 null도 아닐 경우에만 포함 ✨
      } as Prisma.PostUncheckedCreateInput, // ✨ PostUncheckedCreateInput으로 명시적 타입 단언 ✨
    });
    return newPost;
  }

  /**
   * 특정 게시물 업데이트
   * @param postId
   * @param updateData
   * @returns
   */
  public async update(
    postId: number,
    updateData: Partial<Post>
  ): Promise<Post> {
    const updatedPost = await prisma.post.update({
      where: { postId: postId },
      data: { ...updateData, updatedAt: new Date() },
    });
    return updatedPost;
  }

  /**
   * 특정 게시물 삭제
   * @param postId
   * @returns
   */
  public async delete(postId: number): Promise<void> {
    const result = await prisma.post.deleteMany({
      where: { postId: postId },
    });
    // return result.count; // ✨ return result.count; 제거 ✨
  }

  /**
   * 특정 게시물 ID로 게시물 조회
   * @param postId
   * @returns
   */
  public async findById(postId: number): Promise<PostWithRelations | null> {
    const post = await prisma.post.findUnique({
      where: { postId: postId },
      include: {
        user: {
          select: { nickname: true, profileImage: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { nickname: true, profileImage: true } },
            replies: {
              include: {
                user: { select: { nickname: true, profileImage: true } },
              },
            },
          },
        },
        book: {
          select: {
            title: true,
            author: true,
            cover: true,
            isbn13: true,
            toc: true,
            story: true,
          },
        },
      },
    });
    return post as PostWithRelations | null;
  }

  /**
   * 게시물 조회수 증가 (views 필드 오류로 인해 주석 처리)
   * @param postId
   * @returns
   */
  // public async incrementViews(postId: number): Promise<Post> {
  //   const updatedPost = await prisma.post.update({
  //     where: { postId: postId },
  //     data: { views: { increment: 1 } },
  //   });
  //   return updatedPost;
  // }
}
