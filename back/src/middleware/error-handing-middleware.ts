// src/middleware/error-handing-middleware.ts

import { Request, Response, NextFunction } from "express";

// CustomError 사용자 정의 에러 생성, HTTP 상태 코드 포함
export class CustomError extends Error {
  statusCode: number; // HTTP 상태 코드를 저장할 속성

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// 모든 에러를 중앙에서 처리
export default function (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("에러 핸들링 미들웨어:", err);

  // err가 CustomError의 인스턴스인지 확인
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // CustomError가 아닌 일반 Error/서비스 계층 throw new Error("문자열")로 던져진 경우
  switch (err.message) {
    case "InputValidation":
    case "PasswordValidation":
      return res.status(400).json({
        errorMessage: "잘못된 입력입니다",
      });

    case "ExistEmail":
      return res.status(400).json({
        errorMessage: "가입된 이메일 존재",
      });

    case "ExistNickname":
      return res.status(400).json({
        errorMessage: "사용중인 닉네임",
      });

    case "CurrentPasswordMismatch":
      return res.status(400).json({
        errorMessage: "현재 비밀번호가 올바르지 않습니다",
      });

    case "PasswordFieldRequired":
      return res.status(400).json({
        errorMessage: "모든 비밀번호 필드를 입력해주세요",
      });

    case "PasswordMismatch":
      return res.status(400).json({
        errorMessage: "새 비밀번호와 비밀번호 확인이 일치하지 않습니다",
      });

    case "PasswordTooShort":
      return res.status(400).json({
        errorMessage: "새 비밀번호는 최소 8자 이상이어야 합니다",
      });

    case "PasswordSame":
      return res.status(400).json({
        errorMessage: "현재 비밀번호와 새 비밀번호가 동일합니다",
      });

    case "Forbidden":
      return res.status(403).json({
        errorMessage: "접근 권한이 없습니다",
      });

    case "Password":
      return res.status(400).json({
        errorMessage: "패스워드 불일치",
      });

    case "UserNotFound":
      return res.status(404).json({
        errorMessage: "해당 유저가 없습니다",
      });

    case "PostNotFound":
      return res.status(404).json({
        errorMessage: "해당 게시글이 없습니다",
      });

    case "Comment not found":
      return res.status(404).json({
        errorMessage: "댓글을 찾을 수 없습니다.",
      });
    case "Unauthorized: You can only update your own comments.":
    case "Unauthorized: You can only delete your own comments.":
      return res.status(403).json({
        errorMessage: "권한이 없습니다: 자신의 댓글만 수정/삭제할 수 있습니다.",
      });
    case "Associated team post not found for this comment.":
      return res.status(404).json({
        errorMessage: "연결된 팀 게시물을 찾을 수 없습니다.",
      });
    case "Unauthorized: You are not a member of this team.":
      return res.status(403).json({
        errorMessage: "권한 없음: 이 팀의 멤버가 아닙니다.",
      });
    case "Parent comment not found or does not belong to this post.":
      return res.status(400).json({
        errorMessage: "부모 댓글을 찾을 수 없거나 이 게시물에 속하지 않습니다.",
      });

    case "Need login":
    case "TokenNotMatched":
      return res.status(401).send({
        errorMessage: "회원 전용 서비스입니다",
      });

    case "Aladin":
      return res.send({
        errorMessage: "알라딘 API 오류",
      });

    case "ExistWish":
      return res.send({
        errorMessage: "이미 위시리스트에 존재하는 도서입니다.",
      });

    case "BookNotFound":
      return res.send({
        errorMessage: "존재하지 않은 도서입니다.",
      });

    case "RatingRequiredForCompletion":
      return res.send({
        errorMessage: "평점을 입력해야 합니다.",
      });

    case "InvalidRatingRange":
      return res.send({
        errorMessage: "평점은 1~5점 사이로 입력해 주세요.",
      });

    default:
      return res.status(500).send({
        errorMessage: "서버 오류",
      });
  }
}
