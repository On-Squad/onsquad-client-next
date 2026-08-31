import { describe, expect, it } from 'vitest';

import {
  canShowMemberMenu,
  memberMenuItems,
} from '../../../../src/features/crew/manage/members/lib/crewMemberMenuActions';

describe('크루원 관리 메뉴 표시 판정', () => {
  describe('canShowMemberMenu — ⋮ 표시 여부', () => {
    it('자기 자신에게는 ⋮ 가 보이지 않는다', () => {
      expect(
        canShowMemberMenu({ isMe: true, canKick: true, canDelegateOwner: true }),
      ).toBe(false);
    });

    it('isMe 이면서 아무 권한도 없으면 ⋮ 가 보이지 않는다', () => {
      expect(
        canShowMemberMenu({ isMe: true, canKick: false, canDelegateOwner: false }),
      ).toBe(false);
    });

    it('canKick 도 canDelegateOwner 도 없으면 ⋮ 가 보이지 않는다', () => {
      expect(
        canShowMemberMenu({ isMe: false, canKick: false, canDelegateOwner: false }),
      ).toBe(false);
    });

    it('canKick 만 있으면 ⋮ 가 보인다', () => {
      expect(
        canShowMemberMenu({ isMe: false, canKick: true, canDelegateOwner: false }),
      ).toBe(true);
    });

    it('canDelegateOwner 만 있으면 ⋮ 가 보인다', () => {
      expect(
        canShowMemberMenu({ isMe: false, canKick: false, canDelegateOwner: true }),
      ).toBe(true);
    });

    it('canKick 과 canDelegateOwner 둘 다 있으면 ⋮ 가 보인다', () => {
      expect(
        canShowMemberMenu({ isMe: false, canKick: true, canDelegateOwner: true }),
      ).toBe(true);
    });
  });

  describe('memberMenuItems — 메뉴 항목 목록', () => {
    it('canDelegateOwner 이면 항목에 크루장 위임이 포함된다', () => {
      const items = memberMenuItems({ isMe: false, canKick: false, canDelegateOwner: true });
      expect(items).toContain('크루장 위임');
    });

    it('canKick 이면 항목에 강퇴가 포함된다', () => {
      const items = memberMenuItems({ isMe: false, canKick: true, canDelegateOwner: false });
      expect(items).toContain('강퇴');
    });

    it('canDelegateOwner 가 false 이면 크루장 위임이 없다', () => {
      const items = memberMenuItems({ isMe: false, canKick: true, canDelegateOwner: false });
      expect(items).not.toContain('크루장 위임');
    });

    it('canKick 이 false 이면 강퇴가 없다', () => {
      const items = memberMenuItems({ isMe: false, canKick: false, canDelegateOwner: true });
      expect(items).not.toContain('강퇴');
    });

    it('둘 다 허용되면 크루장 위임이 강퇴보다 앞에 온다 — 웹과 같은 순서', () => {
      const items = memberMenuItems({ isMe: false, canKick: true, canDelegateOwner: true });
      expect(items).toEqual(['크루장 위임', '강퇴']);
    });

    it('둘 다 없으면 빈 배열이다', () => {
      const items = memberMenuItems({ isMe: false, canKick: false, canDelegateOwner: false });
      expect(items).toEqual([]);
    });
  });
});
