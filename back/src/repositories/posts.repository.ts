// src/repositories/posts.repository.ts

import prisma from "../utils/prisma";
import { Post, PostType, RecruitmentStatus, Prisma } from "@prisma/client"; // RecruitmentStatus import 추가

export class PostRepository {
  /**
   * 모든 게시물을 조회합니다. (전체 게시판 일반 게시물만 해당)
   * @param query - 페이지네이션 및 정렬 옵션 { page, pageSize, sort }
   * @returns Post 배열
   * @remarks 해당 조건에 맞는 게시물이 없으면 빈 배열을 반환합니다.
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
          // 새롭게 추가된 book 관계 포함 (Post 모델에 bookId가 연결되어 있다면)
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
      findManyOptions.orderBy = { createdAt: "desc" }; // 기본 정렬 추가 (최신순)
    }

    const posts = await prisma.post.findMany(findManyOptions);
    return posts;
  }

  /**
   * 새로운 게시물을 생성합니다.
   * @param postData - 생성할 게시물 데이터 (recruitmentStatus, isbn13 필드 추가)
   * @returns 생성된 Post 객체
   * @remarks Prisma의 `create`는 연결된 `userId`나 다른 제약 조건 위반 시 에러를 던질 수 있습니다.
   * 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
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
   * @returns Post 객체 또는 null (게시물을 찾을 수 없는 경우)
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
          orderBy: { createdAt: "asc" }, // 댓글은 오래된 순으로 정렬 (일반적인 댓글 목록)
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
          // 새롭게 추가된 book 관계 포함 (Post 모델에 bookId가 연결되어 있다면)
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
   * @param updateData - 업데이트할 데이터 (Partial<Post> 타입)
   * @returns 업데이트된 Post 객체
   * @remarks Prisma의 `update`는 `postId`에 해당하는 레코드가 없으면 `RecordNotFound` 에러를 던집니다.
   * 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
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
   * @returns void
   * @remarks Prisma의 `delete`는 `postId`에 해당하는 레코드가 없으면 `RecordNotFound` 에러를 던집니다.
   * 이 에러는 서비스 계층으로 전파되어 CustomError로 처리됩니다.
   */
  public async delete(postId: number): Promise<void> {
    await prisma.post.delete({
      where: { postId: postId },
    });
  }
}
