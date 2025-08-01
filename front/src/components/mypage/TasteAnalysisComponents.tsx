// // TasteAnalysisComponents.tsx
// import React from "react";
// import type { 
//   LibraryStats,
//   CategoryStats,
//   AuthorStats,
//   PublisherStats,
//   FullCategoryStats,
//  } from "../../types/tasteAnalysis.types";

// export const SummaryBox = ({
//   totalBooks,
//   averageRating,
//   topRating,
// }: {
//   totalBooks: number;
//   averageRating: number;
//   topRating: { rating: number; percentage: number };
// }) => (
//   <div className="text-center">
//     <p>📚 총 읽은 책: <strong>{totalBooks}권</strong></p>
//     <p>⭐ 평균 평점: <strong>{averageRating.toFixed(1)}점</strong></p>
//     <p>🏆 가장 자주 준 평점: <strong>{topRating.rating}점</strong> ({topRating.percentage}%)</p>
//   </div>
// );

// export const CategoryList = ({ categories }: { categories: CategoryStats[] }) => (
//   <div>
//     <h3 className="text-lg font-semibold mb-2">📖 선호 카테고리</h3>
//     <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
//       {categories.map((c) => (
//         <li key={c.categoryName} className="bg-gray-100 p-3 rounded">
//           {c.categoryName}: {c.count}권, {c.averageRating}점 ({c.percentage}%)
//         </li>
//       ))}
//     </ul>
//   </div>
// );

// export const AuthorList = ({ authors }: { authors: AuthorStats[] }) => (
//   <div>
//     <h3 className="text-lg font-semibold mb-2">✍ 선호 작가</h3>
//     <ul className="space-y-1">
//       {authors.map((a) => (
//         <li key={a.author}>
//           {a.author} - {a.count}권, 평균 {a.averageRating}점
//         </li>
//       ))}
//     </ul>
//   </div>
// );

// export const PublisherList = ({ publishers }: { publishers: PublisherStats[] }) => (
//   <div>
//     <h3 className="text-lg font-semibold mb-2">🏢 선호 출판사</h3>
//     <ul className="space-y-1">
//       {publishers.map((p) => (
//         <li key={p.publisher}>
//           {p.publisher} - {p.count}권, 평균 {p.averageRating}점
//         </li>
//       ))}
//     </ul>
//   </div>
// );

// export const RatingChart = ({
//   distribution,
// }: {
//   distribution: { rating: number; count: number; percentage: number }[];
// }) => (
//   <div>
//     <h3 className="text-lg font-semibold mb-2">📊 평점 분포</h3>
//     <ul className="space-y-2">
//       {distribution.map((r) => (
//         <li key={r.rating} className="flex items-center gap-2">
//           <span>{r.rating}점</span>
//           <div className="flex-1 bg-gray-200 h-2 rounded">
//             <div
//               className="bg-indigo-500 h-2 rounded"
//               style={{ width: `${r.percentage}%` }}
//             ></div>
//           </div>
//           <span>{r.percentage}%</span>
//         </li>
//       ))}
//     </ul>
//   </div>
// );
