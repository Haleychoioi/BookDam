// src/repositories/posts.repository.ts

import prisma from "../utils/prisma";
import { Post, PostType, RecruitmentStatus, Prisma } from "@prisma/client"; // RecruitmentStatus import 추가

export class PostRepository {
  /**
   * 모든 게시물을 조회합니다. (전체 게시판 일반 게시물만 해당)
   * @param query - 페이지네이션 및 정렬 옵션 { page, pageSize, sort }
   * @returns Post 배열
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
        team: null, // TeamCommunity와의 관계가 없는 게시물 (즉, 퍼블릭 게시물)
        type: PostType.GENERAL, // '전체 게시판'은 일반 게시물만 포함
      },
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            nickname: true, // 작성자 닉네임 포함
            profileImage: true, // 새롭게 추가된 프로필 이미지 포함
          },
        },
        _count: {
          select: { comments: true }, // 댓글 수 포함
        },
        book: {
          // 새롭게 추가된 book 관계 포함
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
    }

    const posts = await prisma.post.findMany(findManyOptions);
    return posts;
  }

  /**
   * 새로운 게시물을 생성합니다.
   * @param postData - 생성할 게시물 데이터 (recruitmentStatus, isbn13 필드 추가)
   * @returns 생성된 Post 객체
   */
  public async create(postData: {
    userId: number;
    title: string;
    content: string;
    type?: PostType;
    maxMembers?: number;
    recruitmentStatus?: RecruitmentStatus; // 새롭게 추가된 필드
    isbn13?: string; // 새롭게 추가된 필드
  }): Promise<Post> {
    const newPost = await prisma.post.create({
      data: postData,
    });
    return newPost;
  }

  /**
   * 특정 게시물 ID로 게시물을 조회합니다.
   * @param postId - 조회할 게시물 ID
   * @returns Post 객체 또는 null
   */
  public async findById(postId: number): Promise<Post | null> {
    const post = await prisma.post.findUnique({
      where: { postId: postId },
      include: {
        user: {
          select: {
            nickname: true, // 작성자 닉네임 포함
            profileImage: true, // 새롭게 추가된 프로필 이미지 포함
          },
        },
        comments: {
          orderBy: { createdAt: "asc" }, // 댓글은 최신순으로 정렬
          include: {
            user: {
              select: {
                nickname: true, // 댓글 작성자 닉네임
                profileImage: true, // 새롭게 추가된 프로필 이미지 포함
              },
            },
            replies: {
              // 대댓글 포함 (1단계만)
              include: {
                user: {
                  select: {
                    nickname: true,
                    profileImage: true, // 새롭게 추가된 프로필 이미지 포함
                  },
                },
              },
            },
          },
        },
        book: {
          // 새롭게 추가된 book 관계 포함
          select: {
            title: true,
            author: true,
            cover: true,
            isbn13: true,
            toc: true, // 목차 포함
            story: true, // 줄거리 포함
          },
        },
      },
    });
    return post;
  }

  /**
   * 특정 게시물을 업데이트합니다.
   * @param postId - 업데이트할 게시물 ID
   * @param updateData - 업데이트할 데이터 (recruitmentStatus, isbn13 필드 업데이트 가능하도록 Partial<Post> 유지)
   * @returns 업데이트된 Post 객체
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
   * 특정 게시물을 삭제합니다.
   * @param postId - 삭제할 게시물 ID
   */
  public async delete(postId: number): Promise<void> {
    await prisma.post.delete({
      where: { postId: postId },
    });
  }
}
