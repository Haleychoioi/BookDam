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
       errorMessage: "로그인을 해주세요"
     });
     
     case "Aladin" : 
     return res.send({
      errorMessage: "알라딘 API 오류"
     });

   default: 
     return res.status(500).send({
       errorMessage: "서버 오류"
     });
 }
};