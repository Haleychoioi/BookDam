import axios from "axios";

const API_BASE_URL = "http://localhost:3000"; // env 파일로 분리

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 백엔드 authenticate-middleware가 Bearer 토큰을 기대
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 백엔드 error-handing-middleware에서 보낸 errorMessage를 활용
    if (
      error.response &&
      error.response.data &&
      error.response.data.errorMessage
    ) {
      console.error("API Error:", error.response.data.errorMessage);
      alert(error.response.data.errorMessage); // 사용자에게 에러 메시지 표시

      // 토큰 만료 등 로그인 필요 에러 시 리디렉션
      if (error.response.data.errorMessage === "로그인을 해주세요") {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
    } else {
      console.error("API Error:", error.message);
      alert("알 수 없는 오류가 발생했습니다.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
