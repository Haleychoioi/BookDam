// import { useEffect, useState } from "react";
// import axios from "axios";
// import type { LibraryStats } from "../types/tasteAnalysis.types";

// export const useTasteAnalysis = () => {
//   const [data, setData] = useState<LibraryStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchTasteAnalysis = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("/api/mypage/taste-analysis", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setData(response.data);
//       } catch (err: any) {
//         setError(err.response?.data?.message || "데이터를 불러오는 데 실패했습니다.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTasteAnalysis();
//   }, []);

//   return { data, loading, error };
// };
