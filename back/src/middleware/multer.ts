import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// 서버 시작 시 public/images 폴더가 없으면 생성
try {
    fs.readdirSync('public/images');
} catch (error) {
    console.log('public/images 폴더가 없어 새로 생성합니다.');
    fs.mkdirSync('public/images', { recursive: true });
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'public/images/');
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            
            // 랜덤한 문자열로 새로운 파일명 생성
            const randomName = crypto.randomBytes(20).toString('hex');
            const fileName = randomName + Date.now() + ext;
            
            done(null, fileName);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;