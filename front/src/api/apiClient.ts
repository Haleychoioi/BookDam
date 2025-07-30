import axios from "axios";

// 1. Axios 기본 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 요청 인터셉터 추가
// 모든 요청이 서버로 보내지기 전에 실행됩니다.
// 주로 인증 토큰을 헤더에 추가하는 데 사용됩니다.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // 로컬 스토리지에서 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Authorization 헤더에 토큰 추가
    }
    return config; // 수정된 config 반환
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

// 3. 응답 인터셉터 추가
// 서버로부터 응답을 받거나 에러가 발생했을 때 실행됩니다.
// 주로 에러 처리 (예: 401 Unauthorized 시 로그인 페이지로 리다이렉트)에 사용됩니다.
apiClient.interceptors.response.use(
  (response) => {
    // 응답이 성공적일 때 처리
    return response;
  },
  (error) => {
    // 응답 에러 처리
    if (error.response) {
      // 서버에서 응답을 받았지만, 상태 코드가 2xx 범위 밖인 경우
      const { status, data } = error.response;
      console.error(`API Error: Status ${status}`, data);

      if (status === 401) {
        // 401 Unauthorized 에러 처리 (예: 토큰 만료, 유효하지 않은 토큰)
        alert(
          "세션이 만료되었거나 인증 정보가 유효하지 않습니다. 다시 로그인해주세요."
        );
        // TODO: 사용자 리다이렉션 (예: navigate('/login') 또는 전역 상태 관리 툴 사용)
        // React Router의 `useNavigate` 훅은 함수 컴포넌트 내부에서만 사용 가능하므로,
        // 이곳에서는 직접 사용할 수 없습니다. 별도의 전역 상태 관리 라이브러리(Redux, Zustand, Context API 등)를
        // 사용하여 로그인 페이지로 이동하는 로직을 구현하거나, 컴포넌트에서 에러를 처리하도록 할 수 있습니다.
      } else if (status === 404) {
        alert("요청한 리소스를 찾을 수 없습니다.");
      }
      // 다른 상태 코드에 대한 추가 처리...
    } else if (error.request) {
      // 요청이 만들어졌으나 응답을 받지 못한 경우 (네트워크 에러 등)
      console.error("Network Error:", error.message);
      alert("네트워크 연결에 문제가 있습니다. 다시 시도해주세요.");
    } else {
      // 그 외 에러
      console.error("Error:", error.message);
      alert("알 수 없는 오류가 발생했습니다.");
    }
    return Promise.reject(error); // 에러를 호출자에게 전달
  }
);

export default apiClient; // 생성된 axios 인스턴스 내보내기
