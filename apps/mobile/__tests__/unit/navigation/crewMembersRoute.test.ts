import { describe, expect, it } from 'vitest';

import { resolveManageRow } from '../../../src/navigation/crewMembersRoute';

/**
 * 크루 관리 허브의 줄 전환 규칙을 검증한다.
 *
 * RN 컴포넌트를 import 하거나 렌더하지 않는다 — crewMembersRoute 는 순수 함수라
 * DOM 없이 검증할 수 있다. CrewManageContent 가 같은 함수를 쓰므로
 * 이 테스트가 빨간불이 되면 컴포넌트의 전환 로직도 깨진 것이다.
 */

const PARAMS = { crewId: 42, crewName: '런던크루' };

describe('크루원 줄 전환', () => {
  it('크루원 줄은 CrewMembers 화면으로 이동하고 crewId·crewName 이 그대로 전달된다', () => {
    const target = resolveManageRow('crewMembers', PARAMS);

    expect(target?.screen).toBe('CrewMembers');
    expect(target?.params).toEqual(PARAMS);
  });

  it('crewId 가 다른 크루의 파라미터도 올바르게 전달된다', () => {
    const otherParams = { crewId: 99, crewName: '부산크루' };
    const target = resolveManageRow('crewMembers', otherParams);

    expect(target?.params.crewId).toBe(99);
    expect(target?.params.crewName).toBe('부산크루');
  });
});

describe('참가 신청 줄 전환', () => {
  it('참가 신청 줄은 CrewParticipants 화면으로 이동한다', () => {
    const target = resolveManageRow('participants', PARAMS);

    expect(target?.screen).toBe('CrewParticipants');
    expect(target?.params).toEqual(PARAMS);
  });
});

describe('아직 이관하지 않은 비활성 줄', () => {
  it('크루정보 수정 줄은 비활성이다 — null 을 돌려준다', () => {
    expect(resolveManageRow('crewInfo', PARAMS)).toBeNull();
  });

  it('스쿼드 줄은 비활성이다 — null 을 돌려준다', () => {
    expect(resolveManageRow('squad', PARAMS)).toBeNull();
  });

  it('크루 삭제 줄은 비활성이다 — null 을 돌려준다', () => {
    expect(resolveManageRow('crewDelete', PARAMS)).toBeNull();
  });
});
