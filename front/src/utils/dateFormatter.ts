// src/utils/dateFormatter.ts

export const formatKoreanDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    // 유효하지 않은 날짜 문자열인 경우
    return isoString; // 원본 문자열 반환 또는 에러 처리
  }
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24시간 형식
    hourCycle: "h23", // 0-23
  };
  return date.toLocaleString("ko-KR", options);
};
