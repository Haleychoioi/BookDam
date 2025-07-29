import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tailwind.css";
import App from "./App.tsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 1, // 1분 (60초) 동안 데이터 신선하게 유지. 1분 이내에 같은 쿼리를 요청하면 캐시 사용.
      gcTime: 1000 * 60 * 5, // 5분 동안 비활성 쿼리 캐시 유지. (staleTime 보다 길거나 같게)
      refetchOnWindowFocus: false, // 윈도우에 포커스될 때 자동 재요청 비활성화 (백엔드 호출 감소, 사용자 경험에 따라 조절)
      refetchOnMount: true, // 컴포넌트 마운트 시 자동 재요청 (기본값)
      refetchOnReconnect: true, // 네트워크 재연결 시 자동 재요청 (기본값)

      // ✅ 에러 처리 및 재시도 관련
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30 * 1000), // 재시도 간 지수적 백오프 지연
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
