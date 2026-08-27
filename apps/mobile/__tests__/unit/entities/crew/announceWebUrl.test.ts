import { afterEach, describe, expect, it } from 'vitest';

import { announceDetailUrl } from '../../../../src/entities/crew/lib/announceWebUrl';

/**
 * 공지 상세는 RN 이 아니라 **웹뷰**가 그린다. 그래서 "어느 주소를 여는가" 가
 * 사용자가 본문을 읽을 수 있는지를 그대로 결정한다.
 */
describe('공지를 눌렀을 때 웹뷰가 여는 주소', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_WEB_ORIGIN;
  });

  it('누른 공지의 상세 주소를 연다 — 다른 공지가 열리지 않는다', () => {
    process.env.NEXT_PUBLIC_WEB_ORIGIN = 'https://onsquad.kr';

    expect(announceDetailUrl({ crewId: 42, announceId: 7 })).toBe('https://onsquad.kr/crews/42/announce/7');
  });

  it('웹 주소를 지정하지 않은 개발 빌드에서는 로컬 웹을 연다', () => {
    delete process.env.NEXT_PUBLIC_WEB_ORIGIN;

    expect(announceDetailUrl({ crewId: 42, announceId: 7 })).toBe('http://localhost:3000/crews/42/announce/7');
  });

  it('배포 주소 끝에 슬래시가 붙어 있어도 열리지 않는 주소가 되지 않는다', () => {
    process.env.NEXT_PUBLIC_WEB_ORIGIN = 'https://onsquad.kr/';

    expect(announceDetailUrl({ crewId: 42, announceId: 7 })).toBe('https://onsquad.kr/crews/42/announce/7');
  });
});
