import React, { useEffect, useState } from "react";
import type { LibraryStats } from "../../types/tasteAnalysis.types";
import apiClient from "../../api/apiClient";
import MyPageHeader from "../../components/mypage/MyPageHeader";

const TasteAnalysisPage: React.FC = () => {
  const [data, setData] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/mypage/taste-analysis");
        setData(res.data);
      } catch (error) {
        console.error("분석 정보 불러오기 실패", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // if (loading) return <p className="text-center mt-10">로딩 중...</p>;
  // if (!data || data.totalBooks === 0) {
  //   return <p className="text-center mt-10 text-gray-500">아직 평점을 등록한 도서가 없어요 😢</p>;
  // }


  //서재에 추가, 완독 기준

  return (
    <div className="container mx-auto px-4 py-10 space-y-12">
      <section className="container mx-auto py-12 px-4">
        <MyPageHeader
          title="독서 취향 분석"
          description="지금까지의 서재 활동을 바탕으로 나만의 독서 취향을 확인할 수 있습니다."
        />
      </section>

    {/* 로딩 중일 때만 표시 */}
    {loading && (
      <p className="text-center mt-10">로딩 중...</p>
    )}

    {/*  데이터는 있지만 책이 없을 때 */}
    {!loading && data && data.totalBooks === 0 && (
      <p className="text-center mt-10 text-gray-500 text-lg">
        아직 독서 기록이 없어요 😌 <br />
        지금부터 나만의 서재를 만들어보세요!
      </p>
    )}

    {/*  데이터가 있고 책도 있을 때 → 기존 UI 전부 포함 */}
    {!loading && data && data.totalBooks > 0 && (

    <div className="space-y-12">
      {/* 1. 기본 통계 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">📚 기본 통계</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
          <div className="p-4 bg-blue-50 rounded-lg shadow">총 읽은 책: {data.totalBooks}권</div>
          <div className="p-4 bg-yellow-50 rounded-lg shadow">평균 평점: {data.overallAverageRating.toFixed(1)}점</div>
        </div>
      </section>

      {/* 2. 평점 분포 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">⭐ 평점 분포</h2>
        <div className="flex gap-4 items-end h-40">
          {data.ratingDistribution.map(item => (
            <div key={item.rating} className="flex flex-col items-center text-sm w-12">
              <div
                className="bg-indigo-400 w-full rounded-t"
                style={{ height: `${item.percentage * 1.5}px` }} // 비율을 높이로
              />
              <span className="mt-2">{item.rating}점</span>
              <span className="text-gray-500 text-xs">{item.count}권</span>
            </div>
          ))}
        </div>
      </section>


      {/* 3~5. 선호 카테고리 / 작가 / 출판사 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🏆 선호 카테고리 / 작가 / 출판사</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 선호 카테고리 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">📗 선호 카테고리</h3>
            <ul className="space-y-1 text-sm">
              {data.preferredCategories.map((item, idx) => (
                <li key={idx} className="border p-2 rounded bg-green-50">
                  {item.categoryName} ({item.count}권, 평점 {item.averageRating.toFixed(1)}, {item.percentage}%)
                </li>
              ))}
            </ul>
          </div>

          {/* 선호 작가 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">✍️ 선호 작가</h3>
            <ul className="space-y-1 text-sm">
              {data.preferredAuthors.map((item, idx) => (
                <li key={idx} className="border p-2 rounded bg-orange-50">
                  {item.author} ({item.count}권, 평점 {item.averageRating.toFixed(1)})
                </li>
              ))}
            </ul>
          </div>

          {/* 선호 출판사 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">🏢 선호 출판사</h3>
            <ul className="space-y-1 text-sm">
              {data.preferredPublishers.map((item, idx) => (
                <li key={idx} className="border p-2 rounded bg-purple-50">
                  {item.publisher} ({item.count}권, 평점 {item.averageRating.toFixed(1)})
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>
      
      {/* 6. 전체 카테고리 통계 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">📘 전체 카테고리 통계</h2>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">카테고리</th>
              <th className="p-2 border">권수</th>
              <th className="p-2 border">평균 평점</th>
            </tr>
          </thead>
          <tbody>
            {data.allCategoryStats
              .sort((a, b) => b.count - a.count)
              .map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="p-2 border">{item.categoryName}</td>
                  <td className="p-2 border">{item.count}</td>
                  <td className="p-2 border">{item.averageRating.toFixed(1)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
      </div>
    )}
    </div>
  );
};

export default TasteAnalysisPage;
