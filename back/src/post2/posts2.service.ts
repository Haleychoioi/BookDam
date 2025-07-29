import { PostRepository } from './post2.repository';
import type {
  CreatePostRequest,
  ApplyToPostRequest,
  CreatePostResponse,
  ProcessApplicationRequest,
} from './post2.types';
import { ApplicationStatus } from '@prisma/client';

export class PostService {
  constructor(private readonly postRepository: PostRepository) {}


  public createPost = async (
    dto: Omit<CreatePostRequest, 'userId'>,
    userId: number,
  ): Promise<CreatePostResponse> => {
    const postData = { ...dto, userId };
    const newPost = await this.postRepository.createPost(postData);

    return {
      postId: newPost.postId,
      type: newPost.type,
      recruitmentStatus: newPost.recruitmentStatus ?? undefined,
      maxMembers: newPost.maxMembers ?? undefined,
      isbn13: newPost.isbn13 ?? undefined,
    };
  };

  public applyToPost = async (
    postId: number,
    dto: Omit<ApplyToPostRequest, 'userId'>,
    userId: number,
  ) => {
    const post = await this.postRepository.findPostById(postId);
    if (!post || post.type !== 'RECRUITMENT' || post.recruitmentStatus !== 'RECRUITING' || post.user.userId === userId) {
      return { error: 'Validation', message: '지원할 수 없는 모집글입니다.' };
    }

    const existingApplication = await this.postRepository.findApplicationByUser(userId, postId);
    if (existingApplication) {
      return { error: 'Conflict', message: '이미 지원한 모집글입니다.' };
    }

    return this.postRepository.createApplication({ ...dto, userId, postId });
  };
  
  public processApplication = async (
    postId: number,
    applicationId: number,
    requestingUserId: number,
    status: Extract<ApplicationStatus, 'ACCEPTED' | 'REJECTED'>,
  ) => {
    const application = await this.postRepository.findApplicationWithPostAuthor(
      applicationId,
    );

    if (!application || application.postId !== postId) {
      return { error: 'NotFound', message: '해당 지원서를 찾을 수 없습니다.' };
    }

    if (application.post.userId !== requestingUserId) {
      return { error: 'Forbidden', message: '지원서를 처리할 권한이 없습니다.' };
    }

    if (application.status !== 'PENDING') {
      return { error: 'Conflict', message: '이미 처리된 지원서입니다.' };
    }

    return this.postRepository.updateApplicationStatus(applicationId, status);
  };

 
  public createTeamFromPost = async (postId: number, requestingUserId: number) => {
    const post = await this.postRepository.findPostById(postId);
    if (!post || post.user.userId !== requestingUserId || post.team) {
      return { error: 'Validation', message: '팀을 생성할 수 없습니다.' };
    }

    const acceptedApplicants = await this.postRepository.findAcceptedApplicants(postId);
    const memberUserIds = acceptedApplicants
      .map((app) => app.userId)
      .filter((id) => id !== post.user.userId);

    if (memberUserIds.length === 0) {
      return { error: 'Validation', message: '팀을 생성하기 위한 승인된 멤버가 없습니다.' };
    }

    const teamCreationData = {
      postId: post.postId,
      isbn13: post.isbn13 ?? undefined, 
      status: 'ACTIVE' as const,
      postTitle: post.title,
      postContent: post.content,
      postAuthor: post.user.nickname,
      leaderUserId: post.user.userId,
      memberUserIds: memberUserIds,
    };

    return this.postRepository.createTeamWithMembers(teamCreationData);
  };
}
