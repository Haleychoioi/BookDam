bookDam: 독서와 사람을 연결하는 플랫폼
bookDam은 독서 경험을 공유하고 확장하는 데 초점을 맞춘 소셜 커뮤니티 플랫폼입니다. 사용자는 다양한 책을 탐색하고, 관심 있는 커뮤니티에 참여하며, 개인 독서 기록을 관리할 수 있습니다.

📚 기술 스택
이 프로젝트는 React와 Node.js 기반의 풀스택 애플리케이션으로 구성되어 있습니다.

프론트엔드 (Frontend)

React: UI 개발을 위한 핵심 라이브러리.

TypeScript: 정적 타입 체크를 통한 코드 안정성 확보.

Tailwind CSS: 유틸리티 우선의 CSS 프레임워크.

React Query: 서버 상태 관리 및 데이터 캐싱.

React Router: 클라이언트 측 라우팅.

백엔드 (Backend)

Node.js & Express: 서버 구축 및 API 개발.

TypeScript: 서버 측 코드 안정성 확보.

Prisma: ORM (Object-Relational Mapper)으로 데이터베이스 접근 관리.

MySQL: 관계형 데이터베이스.

JWT: 사용자 인증 및 권한 관리.

✨ 주요 기능
도서 검색 및 정보 제공:

알라딘 API를 활용한 도서 검색 기능.

베스트셀러, 신간 등 다양한 도서 목록 제공.

커뮤니티 활동:

도서 기반 커뮤니티 생성 및 참여.

커뮤니티 게시판에서 팀 게시물 작성, 댓글 및 대댓글 기능.

커뮤니티 가입 신청 및 관리 (팀장).

마이페이지:

내 서재 관리 (읽고 싶은 책, 읽는 중, 읽은 책).

관심 도서를 모아볼 수 있는 위시리스트.

독서 기록을 분석한 취향 분석 데이터 제공.

자유 게시판:

일반 게시글을 작성하고 모든 사용자와 소통할 수 있는 게시판.

🚀 시작하기 (Setup)
전제 조건 (Prerequisites)
Node.js (v18 이상)

MySQL 데이터베이스

Aladin API 키

Gmail 계정 정보 (비밀번호 찾기 기능용)

백엔드 설정
src.zip 폴더 압축 해제 후, 백엔드 프로젝트 루트 디렉터리로 이동합니다.

필요한 패키지를 설치합니다.

Bash

npm install
.env 파일을 생성하고 다음 환경 변수를 설정합니다.

코드 스니펫

# DB

DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT

JWT_SECRET="your_jwt_secret_key"
SALT_ROUNDS=10

# Aladin API

ALADIN_API_KEY="your_aladin_api_key"

# Email

EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_email_password" # 앱 비밀번호 사용 권장

# CORS

CORS_ORIGIN="http://localhost:5173"
데이터베이스 마이그레이션을 실행하여 테이블을 생성합니다.

Bash

npx prisma migrate dev --name init
백엔드 서버를 시작합니다.

Bash

npm run dev
프론트엔드 설정
프론트엔드 프로젝트 루트 디렉터리로 이동합니다.

필요한 패키지를 설치합니다.

Bash

npm install
.env 파일을 생성하고 백엔드 API 서버 URL을 설정합니다.

코드 스니펫

VITE_API_BASE_URL="http://localhost:3000/api"
프론트엔드 개발 서버를 시작합니다.

Bash

npm run dev
브라우저에서 http://localhost:5173에 접속하여 애플리케이션을 확인합니다.

🤝 기여 (Contributors)
최아름: https://github.com/Haleychoioi

박민재: https://github.com/boonmojae

이하민: https://github.com/haminee01

김가연: https://github.com/gayeon-00
