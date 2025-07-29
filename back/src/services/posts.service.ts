// src/services/posts.service.ts

import { PostRepository } from "../repositories/posts.repository";
import { Post, PostType, RecruitmentStatus } from "@prisma/client"; // RecruitmentStatus 임포트 (주석용)
import { CustomError } from "../middleware/error-handing-middleware"; // CustomError 임포트

export class PostService {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  /**
   * 전체 게시판 게시물 목록을 조회합니다. (일반글 및 공개된 모집글 포함)
   * UX 플로우: "퍼블릭 커뮤니티 게시글 (일반글 + 모집글)은 커뮤니티 페이지에 들어가면 전체 게시물을 볼 수 있고"
   * PostRepository의 findMany 메서드가 일반 게시물과 공개된 모집글을 모두 조회하도록 구현되어야 합니다.
   * @param query - 페이지네이션 및 정렬 옵션
   * @returns Post 배열
   * @throws CustomError 게시물이 없을 때 (선택적)
   */
  public async findAllPosts(query: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<Post[]> {
    const posts = await this.postRepository.findMany(query);
    // 게시물이 없는 경우 404 에러를 던질지, 빈 배열을 반환할지는 API 정책에 따라 다릅니다.
    // 여기서는 "목록 조회"이므로 빈 배열 반환이 더 자연스러울 수 있습니다.
    // 만약 "어떤 것도 찾을 수 없음"을 명확히 하고 싶다면 아래 주석을 해제하세요.
    // if (posts.length === 0) {
    //   throw new CustomError(404, "No posts found.");
    // }
    return posts;
  }

  /**
   * 전체 게시판에 게시물을 작성합니다. (일반글)
   * UX 플로우: "게시물 작성 버튼을 클릭하면 게시물(일반글)을 작성할 수 있음."
   * @param postData - 작성할 게시물 데이터 { userId, title, content }
   * @returns 생성된 Post 객체
   * @throws CustomError 사용자 ID가 유효하지 않을 때 (TODO 주석 처리된 부분에 따라)
   */
  public async createPost(postData: {
    userId: number;
    title: string;
    content: string;
  }): Promise<Post> {
    // TODO: (선택 사항) userId에 해당하는 User가 존재하는지 확인하는 로직 (UserRepository 필요)
    // if (!user) { throw new CustomError(404, "User not found."); }
    // TODO: (선택 사항) content 길이 제한 등 추가 유효성 검사

    const newPost = await this.postRepository.create({
      ...postData,
      type: PostType.GENERAL, // 일반 게시글로 설정
      // 이 메서드는 일반 게시글 작성을 위한 것이므로, 모집글 관련 필드는 여기서 설정하지 않습니다.
    });
    return newPost;
  }

  /**
   * 특정 게시물의 상세 정보를 조회합니다.
   * @param postId - 조회할 게시물 ID
   * @returns Post 객체
   * @throws CustomError 게시물을 찾을 수 없을 때
   */
  public async findPostById(postId: number): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new CustomError(404, "Post not found"); // 게시물을 찾을 수 없을 때 에러 발생
    }
    return post;
  }

  /**
   * 특정 게시물을 수정합니다.
   * @param postId - 수정할 게시물 ID
   * @param updateData - 업데이트할 데이터 { title?, content?, userId } (userId는 권한 확인용)
   * @returns 업데이트된 Post 객체
   * @throws CustomError 게시물을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async updatePost(
    postId: number,
    updateData: { title?: string; content?: string; userId: number }
  ): Promise<Post> {
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new CustomError(404, "Post not found"); // 게시물 없음 에러
    }

    // 수정 권한 확인: 요청하는 userId가 게시물 작성자인지 확인
    if (existingPost.userId !== updateData.userId) {
      throw new CustomError(
        403,
        "Unauthorized: You can only update your own posts."
      ); // 권한 없음 에러
    }

    const updatedPost = await this.postRepository.update(postId, updateData);
    return updatedPost;
  }

  /**
   * 특정 게시물을 삭제합니다.
   * @param postId - 삭제할 게시물 ID
   * @param requestingUserId - 요청하는 사용자 ID (권한 확인용)
   * @returns void (성공 시 아무것도 반환하지 않음)
   * @throws CustomError 게시물을 찾을 수 없을 때 또는 권한이 없을 때
   */
  public async deletePost(
    postId: number,
    requestingUserId: number
  ): Promise<void> {
    // 반환 타입을 Promise<void>로 변경
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new CustomError(404, "Post not found"); // 게시물 없음 에러
    }

    // 삭제 권한 확인: 요청하는 userId가 게시물 작성자인지 확인
    if (existingPost.userId !== requestingUserId) {
      throw new CustomError(
        403,
        "Unauthorized: You can only delete your own posts."
      ); // 권한 없음 에러
    }

    // 레포지토리의 delete 메서드를 호출합니다.
    // Prisma의 delete는 해당 레코드를 찾을 수 없으면 NotFoundError를 던지므로,
    // 여기서 별도의 deletedCount 확인은 필요 없습니다.
    try {
      await this.postRepository.delete(postId);
    } catch (error) {
      // Prisma NotFoundError 등을 CustomError로 변환하여 던질 수 있습니다.
      // 여기서는 레포지토리에서 다른 예상치 못한 에러가 발생하면 그대로 next로 전달합니다.
      throw error;
    }
    // 성공 시 아무것도 반환하지 않습니다 (void)
  }
}
