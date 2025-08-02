// src/repositories/posts.repository.ts
import prisma from "../utils/prisma";
import { Post, PostType, RecruitmentStatus, Prisma } from "@prisma/client";

export class PostRepository {

  public async findByUserId(
    userId: number,
    type?: PostType
  ): Promise<Post[]> {
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
        _count: { select: { comments: true } },
        book: {
          select: { title: true, author: true, cover: true, isbn13: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * 모든 게시물 조회 (전체 게시판 일반 게시물 및 모집 중인 모집글 포함)
   * @param query
   * @returns
   * @remarks
   */
  public async findMany(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<Post[]> {
    const { page = 1, pageSize = 10, sort } = query;
    const skip = (page - 1) * pageSize;

    const findManyOptions: Prisma.PostFindManyArgs = {
      where: {
        team: null, // TeamCommunity와의 관계가 없는 게시물 (퍼블릭 게시물)
        OR: [
          // 일반 게시물 또는 모집 중인 모집글을 포함하도록 OR 조건 추가
          { type: PostType.GENERAL },
          {
            type: PostType.RECRUITMENT,
            recruitmentStatus: RecruitmentStatus.RECRUITING,
          },
        ],
      },
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            nickname: true,
            profileImage: true,
          },
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

    if (sort === "latest") {
      findManyOptions.orderBy = { createdAt: "desc" };
    } else {
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
    type?: PostType;
    maxMembers?: number;
    recruitmentStatus?: RecruitmentStatus;
    isbn13?: string;
  }): Promise<Post> {
    const newPost = await prisma.post.create({
      data: postData,
    });
    return newPost;
  }

  /**
   * 특정 게시물 ID로 게시물 조회
   * @param postId
   * @returns
   */
  public async findById(postId: number): Promise<Post | null> {
    const post = await prisma.post.findUnique({
      where: { postId: postId },
      include: {
        user: {
          select: {
            nickname: true,
            profileImage: true,
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                nickname: true,
                profileImage: true,
              },
            },
            replies: {
              // 대댓글 포함 (1단계만)
              include: {
                user: {
                  select: {
                    nickname: true,
                    profileImage: true,
                  },
                },
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
    return post;
  }

  /**
   * 특정 게시물 업데이트
   * @param postId
   * @param updateData
   * @returns
   * @remarks
   */
  public async update(
    postId: number,
    updateData: Partial<Post>
  ): Promise<Post> {
    const updatedPost = await prisma.post.update({
      where: { postId: postId },
      data: updateData,
    });
    return updatedPost;
  }

  /**
   * 특정 게시물 삭제
   * @param postId
   * @returns
   * @remarks
   */
  public async delete(postId: number): Promise<void> {
    await prisma.post.delete({
      where: { postId: postId },
    });
  }
}
