import { PostRepository } from "../repositories/posts.repository";
import { TeamPostRepository } from "../repositories/team-posts.repository";
import { Post, PostType, RecruitmentStatus, TeamPost } from "@prisma/client";
import { CustomError } from "../middleware/error-handing-middleware";

export class PostService {
  private postRepository: PostRepository;
  private teamPostRepository: TeamPostRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.teamPostRepository = new TeamPostRepository();
  }

  public async getUserPosts(
    userId: number,
    query: {
      page?: number;
      pageSize?: number;
      sort?: string;
      type?: string;
    }
  ) {
    const { page = 1, pageSize = 10, sort = "latest", type } = query;

    let combinedPosts: any[] = [];

    console.log(
      `[PostService] getUserPosts - userId: ${userId}, type: ${type || "ALL"}`
    );

    if (type === "TEAM") {
      const teamPosts = await this.teamPostRepository.findByUserId(userId);
      combinedPosts = teamPosts.map((p) => ({
        ...p,
        type: "TEAM",
        source: "TEAM",
      }));
      console.log(
        `[PostService] Fetched TEAM posts count: ${teamPosts.length}`
      );
    } else if (type === "GENERAL" || type === "RECRUITMENT") {
      const postType = type as PostType;
      const publicPosts = await this.postRepository.findByUserId(
        userId,
        postType
      );
      combinedPosts = publicPosts.map((p) => ({ ...p, source: "PUBLIC" }));
      console.log(
        `[PostService] Fetched PUBLIC posts (type: ${type}) count: ${publicPosts.length}`
      );
    } else {
      const publicPosts = await this.postRepository.findByUserId(userId);
      const teamPosts = await this.teamPostRepository.findByUserId(userId);

      combinedPosts.push(
        ...publicPosts.map((p) => ({ ...p, source: "PUBLIC" }))
      );
      combinedPosts.push(
        ...teamPosts.map((p) => ({ ...p, type: "TEAM", source: "TEAM" }))
      );
      console.log(
        `[PostService] Fetched ALL posts - Public: ${publicPosts.length}, Team: ${teamPosts.length}`
      );
    }

    console.log(
      `[PostService] combinedPosts total count before pagination: ${combinedPosts.length}`
    );

    combinedPosts.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sort === "oldest" ? dateA - dateB : dateB - dateA;
    });

    const totalCount = combinedPosts.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const skip = (page - 1) * pageSize;
    const paginatedPosts = combinedPosts.slice(skip, skip + pageSize);

    console.log(
      `[PostService] paginatedPosts count: ${paginatedPosts.length}, TotalCount: ${totalCount}`
    );

    return {
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * 전체 게시판 게시물 목록 조회 (일반글 및 공개된 모집글 포함)
   * @param query
   * @returns
   * @throws
   */
  public async findAllPosts(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<Post[]> {
    const posts = await this.postRepository.findMany(query);

    // 타입 정보 추가
    return posts.map(post => ({
      ...post,
      typeLabel: post.type === PostType.RECRUITMENT ? '모집글' : '일반글'
    }));
  }

  /**
   * 전체 게시판에 게시물 작성 (일반글)
   * @param postData
   * @returns
   * @throws
   */
  public async createPost(postData: {
    userId: number;
    title: string;
    content: string;
  }): Promise<Post> {
    const newPost = await this.postRepository.create({
      ...postData,
      type: PostType.GENERAL,
    });
    return newPost;
  }

  /**
   * 특정 게시물의 상세 정보 조회
   * @param postId
   * @returns
   * @throws
   */
  public async findPostById(postId: number): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new CustomError(404, "Post not found");
    }
    return post;
  }

  /**
   * 특정 게시물 수정
   * @param postId
   * @param updateData
   * @returns
   * @throws
   */
  public async updatePost(
    postId: number,
    updateData: { title?: string; content?: string; userId: number }
  ): Promise<Post> {
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new CustomError(404, "Post not found");
    }

    // 수정 권한 확인: 요청하는 userId가 게시물 작성자인지 확인
    if (existingPost.userId !== updateData.userId) {
      throw new CustomError(
        403,
        "Unauthorized: You can only update your own posts."
      );
    }

    const updatedPost = await this.postRepository.update(postId, updateData);
    return updatedPost;
  }

  /**
   * 특정 게시물 삭제
   * @param postId
   * @param requestingUserId
   * @returns
   * @throws
   */
  public async deletePost(
    postId: number,
    requestingUserId: number
  ): Promise<void> {
    // 반환 타입을 Promise<void>로 변경
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new CustomError(404, "Post not found");
    }

    // 삭제 권한 확인: 요청하는 userId가 게시물 작성자인지 확인
    if (existingPost.userId !== requestingUserId) {
      throw new CustomError(
        403,
        "Unauthorized: You can only delete your own posts."
      );
    }

    try {
      await this.postRepository.delete(postId);
    } catch (error) {
      throw error;
    }
  }
}
