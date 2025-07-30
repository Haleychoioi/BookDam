import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
    message: string;
}

export default function (
 err: CustomError, 
 req: Request, 
 res: Response, 
 next: NextFunction
) {
 switch (err.message) {
   case "InputValidation":
   case "PasswordValidation":
     return res.status(400).send({
       errorMessage: "잘못된 입력입니다"
     });

   case "ExistEmail": 
     return res.status(400).send({
       errorMessage: "가입된 이메일 존재"
     });

     case "ExistNickname": 
     return res.status(400).send({
       errorMessage: "사용중인 닉네임"
     });

   case "Forbidden": 
     return res.status(403).send({
       errorMessage: "접근 권한이 없습니다"
     });

   case "Password": 
     return res.status(400).send({
       errorMessage: "패스워드 불일치"
     });

   case "UserNotFound": 
     return res.status(404).send({
       errorMessage: "해당 유저가 없습니다"
     });

   case "PostNotFound": 
     return res.status(404).send({
       errorMessage: "해당 게시글이 없습니다"
     });

   case "Need login":
   case "TokenNotMatched":
     return res.status(401).send({
       errorMessage: "회원 전용 서비스입니다"
     });
     
     case "Aladin" : 
     return res.send({
      errorMessage: "알라딘 API 오류"
     });

     case "ExistWish" : 
     return res.send({
      errorMessage: "이미 위시리스트에 존재하는 도서입니다."
     });

     case "BookNotFound" : 
     return res.send({
      errorMessage: "존재하지 않은 도서입니다."
     });

     case "RatingRequiredForCompletion" : 
     return res.send({
      errorMessage: "평점을 입력해야 합니다."
     });

     case "InvalidRatingRange" : 
     return res.send({
      errorMessage: "평점은 1~5점 사이로 입력해 주세요."
     });

   default: 
     return res.status(500).send({
       errorMessage: "서버 오류"
     });
 }
};