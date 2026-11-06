/** 지도에서는 한글 매장명 뒤에 붙은 괄호 속 영문 이름을 생략한다. */
export function cafeMapName(name: string) {
  return (
    name
      .replace(/\s*\([^()]*\)/g, (suffix) =>
        /[a-z]/i.test(suffix) && !/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(suffix)
          ? ''
          : suffix,
      )
      .trim() || name
  );
}

export type MapLabelRect = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;

export function mapLabelsOverlap(a: MapLabelRect, b: MapLabelRect, gap = 6) {
  return (
    a.left < b.right + gap &&
    a.right > b.left - gap &&
    a.top < b.bottom + gap &&
    a.bottom > b.top - gap
  );
}
