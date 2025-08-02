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
        // ✨ 404 에러에 대한 alert를 제거합니다. ✨
        // alert(data.message || "요청한 리소스를 찾을 수 없습니다."); // 이 줄을 삭제
        // Promise.reject만 하여 useQuery가 에러를 잡도록 합니다.
      } else {
        // 그 외의 다른 에러는 서버 응답 메시지를 우선 표시하거나 일반 오류 메시지를 표시
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
