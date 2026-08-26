import { describe, expect, it } from 'vitest';

import { isCrewOwner } from '../../../../src/entities/crew/lib/isCrewOwner';

describe('크루장 판정', () => {
  it('내가 만든 크루를 보면 크루장으로 판정한다', () => {
    expect(isCrewOwner({ ownerId: 7, myId: 7 })).toBe(true);
  });

  it('남이 만든 크루를 보면 크루장이 아니라고 판정한다', () => {
    expect(isCrewOwner({ ownerId: 7, myId: 8 })).toBe(false);
  });

  it('로그인하지 않았으면 주인 없는 크루에서도 크루장이 아니다', () => {
    expect(isCrewOwner({ ownerId: undefined, myId: undefined })).toBe(false);
  });

  it('로그인했어도 크루에 주인 정보가 없으면 크루장이 아니다', () => {
    expect(isCrewOwner({ ownerId: undefined, myId: 7 })).toBe(false);
  });

  it('로그인하지 않았으면 주인이 있는 크루에서도 크루장이 아니다', () => {
    expect(isCrewOwner({ ownerId: 7, myId: undefined })).toBe(false);
  });
});
