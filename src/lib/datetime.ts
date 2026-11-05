/**
 * 백엔드 일시는 시간대 표기 없는 한국 시간이고, 소수점 이하가 0~9자리로 가변이다.
 * 브라우저마다 9자리 소수점 파싱이 다르므로 밀리초(3자리)까지만 남긴다.
 */
export function parseServerDate(value: string): Date {
  return new Date(value.replace(/(\.\d{3})\d+$/, '$1'));
}

/** 오후 3:20 */
export function formatClock(value: string): string {
  const date = parseServerDate(value);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const period = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${hour12}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** 방금 / 10분 전 / 1시간 전 / 어제 / 11월 3일 */
export function formatRelativeTime(value: string, now = new Date()): string {
  const date = parseServerDate(value);
  if (Number.isNaN(date.getTime())) return '';

  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  if (hours < 48) return '어제';
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** 서버 일시의 날짜 부분(YYYY-MM-DD). 날짜가 바뀌는 지점을 찾을 때 쓴다 */
export function getDayKey(value: string): string {
  return value.slice(0, 10);
}

/** 2026년 11월 4일 수요일 */
export function formatDayLabel(value: string): string {
  const date = parseServerDate(`${getDayKey(value)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekday}요일`;
}

/** 11월 4일 오후 3:00 */
export function formatProposalDate(date: string, time: string): string {
  const parsed = new Date(`${date}T${time.slice(0, 5)}:00`);
  if (Number.isNaN(parsed.getTime())) return `${date} ${time.slice(0, 5)}`;
  return `${parsed.getMonth() + 1}월 ${parsed.getDate()}일 ${formatClock(
    `${date}T${time.slice(0, 5)}:00`,
  )}`;
}

/** YYYY-MM-DD (서버로 보내는 proposedDate 형식) */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
