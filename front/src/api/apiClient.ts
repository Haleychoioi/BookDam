// src/api/apiClient.ts

import axios from "axios";
import { AuthRequiredError } from "../types";

// 1. Axios 기본 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 요청 인터셉터 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 응답 인터셉터 추가
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`API Error: Status ${status}`, data);

      if (
        status === 401 ||
        (status === 500 && data && data.message === "TokenNotMatched")
      ) {
        return Promise.reject(new AuthRequiredError());
      } else if (status === 404) {
        // 404 에러는 보통 Not Found 메시지로 충분하므로 여기서 alert 제거 (개별 페이지에서 처리)
      } else if (status === 400 || status === 409) {
        // ✨ 400 Bad Request 및 409 Conflict 에러에 대한 alert 제거 ✨
        // 이 에러들은 RegisterPage 등에서 UI에 직접 메시지를 표시하므로, 여기서 alert를 띄우지 않습니다.
        // `errorMessage` 또는 `errors` 객체를 통해 구체적인 메시지를 전달하므로, 여기서의 alert는 중복됩니다.
      } else {
        // 그 외의 다른 예상치 못한 서버 에러는 alert 유지
        alert(data.message || "알 수 없는 오류가 발생했습니다.");
      }
    } else if (error.request) {
      console.error("Network Error:", error.message);
      alert("네트워크 연결에 문제가 있습니다. 다시 시도해주세요.");
    } else {
      console.error("Error:", error.message);
      alert("알 수 없는 오류가 발생했습니다.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
