import { describe, expect, it } from 'vitest';

import { groupNotificationsByDate } from '../../../../src/entities/notification/lib/groupNotificationsByDate';
import type { NotificationListItem } from '../../../../src/entities/notification/types/notification.types';

const makeItem = (id: number, occurredAt: string, read = false): NotificationListItem => ({
  id,
  topic: 'USER',
  detail: 'CREW_REQUEST',
  occurredAt,
  read,
});

describe('groupNotificationsByDate', () => {
  it('빈 목록을 받으면 빈 배열을 반환한다', () => {
    expect(groupNotificationsByDate([])).toEqual([]);
  });

  it('같은 날짜의 알림들은 하나의 섹션으로 묶인다', () => {
    const items = [
      makeItem(1, '2024-01-15T10:00:00'),
      makeItem(2, '2024-01-15T18:00:00'),
    ];

    const sections = groupNotificationsByDate(items);

    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe('2024.01.15');
    expect(sections[0].data).toHaveLength(2);
    expect(sections[0].data[0].id).toBe(1);
    expect(sections[0].data[1].id).toBe(2);
  });

  it('다른 날짜의 알림들은 날짜별로 분리된 섹션으로 나뉜다', () => {
    const items = [
      makeItem(1, '2024-01-15T10:00:00'),
      makeItem(2, '2024-01-16T09:00:00'),
      makeItem(3, '2024-01-15T20:00:00'),
    ];

    const sections = groupNotificationsByDate(items);

    expect(sections).toHaveLength(2);
    // 첫 번째로 등장한 날짜가 첫 번째 섹션이 된다
    expect(sections[0].title).toBe('2024.01.15');
    expect(sections[0].data.map((i) => i.id)).toEqual([1, 3]);
    expect(sections[1].title).toBe('2024.01.16');
    expect(sections[1].data.map((i) => i.id)).toEqual([2]);
  });

  it('날짜 형식이 YYYY.MM.DD 로 변환된다', () => {
    const items = [makeItem(1, '2024-03-05T00:00:00')];

    const sections = groupNotificationsByDate(items);

    expect(sections[0].title).toBe('2024.03.05');
  });

  it('파싱할 수 없는 occurredAt 은 원본 문자열을 섹션 제목으로 쓴다', () => {
    const items = [makeItem(1, 'not-a-date')];

    const sections = groupNotificationsByDate(items);

    expect(sections[0].title).toBe('not-a-date');
  });
});
