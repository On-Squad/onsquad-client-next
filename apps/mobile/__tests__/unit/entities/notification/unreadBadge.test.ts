import { describe, expect, it } from 'vitest';

import { formatUnreadBadge } from '../../../../src/entities/notification/lib/formatUnreadBadge';

describe('formatUnreadBadge', () => {
  describe('안읽음이 없을 때', () => {
    it('0이면 빈 문자열을 반환한다 — 배지가 없어야 한다', () => {
      expect(formatUnreadBadge(0)).toBe('');
    });

    it('음수면 빈 문자열을 반환한다 — 비정상 값도 배지를 그리지 않는다', () => {
      expect(formatUnreadBadge(-1)).toBe('');
    });
  });

  describe('상한 미만(1~4)일 때', () => {
    it('1이면 "1"을 반환한다', () => {
      expect(formatUnreadBadge(1)).toBe('1');
    });

    it('4이면 "4"를 반환한다 — 상한 직전까지 숫자 그대로 표시한다', () => {
      expect(formatUnreadBadge(4)).toBe('4');
    });
  });

  describe('상한 이상(5+)일 때', () => {
    it('5이면 "5+"를 반환한다 — 상한 경계에서 + 표기로 바뀐다', () => {
      expect(formatUnreadBadge(5)).toBe('5+');
    });

    it('99이면 "5+"를 반환한다 — 상한을 넘어도 5+ 로 표기한다', () => {
      expect(formatUnreadBadge(99)).toBe('5+');
    });
  });
});
