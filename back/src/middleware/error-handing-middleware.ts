// src/middleware/error-handing-middleware.ts

import { Request, Response, NextFunction } from "express";

// CustomError 클래스를 이 파일 내부에 정의합니다.
// 이 클래스는 Error 클래스를 상속받아 사용자 정의 에러를 생성하며, HTTP 상태 코드를 포함할 수 있습니다.
export class CustomError extends Error {
  statusCode: number; // HTTP 상태 코드를 저장할 속성

  constructor(statusCode: number, message: string) {
    super(message); // Error 클래스의 생성자를 호출하여 메시지를 설정합니다.
    this.statusCode = statusCode; // 사용자 정의 상태 코드를 설정합니다.

    // TypeScript에서 상속받은 클래스의 인스턴스화를 올바르게 처리하기 위한 코드
    // 이 줄은 CustomError의 프로토타입 체인을 정확하게 설정하여
    // `instanceof CustomError` 검사가 올바르게 작동하도록 합니다.
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// 이 미들웨어는 모든 에러를 중앙에서 처리하여 클라이언트에게 일관된 응답을 제공합니다.
export default function (
  err: Error, // err의 타입을 Error로 넓게 설정하여 모든 종류의 에러를 받을 수 있게 합니다.
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("에러 핸들링 미들웨어:", err); // 서버 콘솔에 에러 로그 출력

  // err가 CustomError의 인스턴스인지 확인합니다.
  if (err instanceof CustomError) {
    // CustomError인 경우, 정의된 statusCode와 message를 사용합니다.
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // CustomError가 아닌 일반 Error이거나, 서비스 계층에서 throw new Error("문자열")로 던져진 경우를 처리합니다.
  switch (err.message) {
    case "InputValidation":
    case "PasswordValidation":
      return res.status(400).json({
        // .send 대신 .json 사용
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

    case "Comment not found": // comments.controller에서 throw하는 메시지 추가
      return res.status(404).json({
        errorMessage: "댓글을 찾을 수 없습니다.",
      });
    case "Unauthorized: You can only update your own comments.": // comments.controller에서 throw하는 메시지 추가
    case "Unauthorized: You can only delete your own comments.":
      return res.status(403).json({
        errorMessage: "권한이 없습니다: 자신의 댓글만 수정/삭제할 수 있습니다.",
      });
    case "Associated team post not found for this comment.": // team-comments.service에서 throw하는 메시지 추가
      return res.status(404).json({
        errorMessage: "연결된 팀 게시물을 찾을 수 없습니다.",
      });
    case "Unauthorized: You are not a member of this team.": // team-comments.service에서 throw하는 메시지 추가
      return res.status(403).json({
        errorMessage: "권한 없음: 이 팀의 멤버가 아닙니다.",
      });
    case "Parent comment not found or does not belong to this post.": // team-comments.service에서 throw하는 메시지 추가
      return res.status(400).json({
        errorMessage: "부모 댓글을 찾을 수 없거나 이 게시물에 속하지 않습니다.",
      });

    case "Need login":
    case "TokenNotMatched":
      return res.status(401).json({
        errorMessage: "로그인을 해주세요",
      });

    case "Aladin":
      return res.status(500).json({
        // 알라딘 API 오류는 500으로 변경
        errorMessage: "알라딘 API 오류",
      });

    default:
      // 정의되지 않은 에러는 500 Internal Server Error로 처리합니다.
      return res.status(500).json({
        errorMessage: err.message || "서버 오류가 발생했습니다.", // err.message를 포함
      });
  }
}
