import { afterEach, describe, expect, it, vi } from 'vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import type { NotificationListItem } from '@/entities/notification';

import NotificationCard from '@/features/notification/list/ui/NotificationCard';

afterEach(() => cleanup());

const makeItem = (overrides?: Partial<NotificationListItem>): NotificationListItem => ({
  id: 1,
  topic: 'USER',
  detail: 'CREW_ACCEPT',
  publisherId: 2,
  receiverId: 3,
  occurredAt: '2024-01-01T00:00:00Z',
  read: false,
  payload: {
    message: '크루 합류가 수락되었습니다.',
    crewId: 10,
    crewName: '런닝크루',
    squadId: undefined,
    squadTitle: undefined,
    requestId: 5,
    commentId: undefined,
    parentId: undefined,
    replyId: undefined,
  },
  ...overrides,
});

describe('NotificationCard', () => {
  it('read가 false이면 안읽음 뱃지가 표시되고 버튼이 enabled이다', () => {
    render(<NotificationCard item={makeItem({ read: false })} />);

    expect(screen.getByLabelText('안읽음')).toBeDefined();

    const readBtn = screen.getByRole('button', { name: /크루 합류가 수락되었습니다/ });
    expect((readBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('read가 true이고 crewId가 없으면 버튼이 disabled이다', () => {
    render(
      <NotificationCard
        item={makeItem({
          read: true,
          payload: { message: '크루 합류가 수락되었습니다.' },
        })}
      />,
    );

    const container = screen.getByRole('button', { name: /크루 합류가 수락되었습니다/ }).closest('div');
    expect(container?.className).toContain('bg-white');

    const readBtn = screen.getByRole('button', { name: /크루 합류가 수락되었습니다/ });
    expect((readBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('read가 true이고 crewId가 있으면 버튼이 enabled이다 — 이동은 가능하다', () => {
    render(
      <NotificationCard
        item={makeItem({ read: true })}
      />,
    );

    const readBtn = screen.getByRole('button', { name: /크루 합류가 수락되었습니다/ });
    expect((readBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('payload.crewName이 있으면 crewName이 표시된다', () => {
    render(
      <NotificationCard
        item={makeItem({
          payload: {
            message: '알림 메시지',
            crewName: '런닝크루',
          },
        })}
      />,
    );

    expect(screen.getByText('런닝크루')).toBeDefined();
  });

  it('payload.crewName이 없고 squadTitle이 있으면 squadTitle이 표시된다', () => {
    render(
      <NotificationCard
        item={makeItem({
          payload: {
            message: '스쿼드 알림',
            crewName: undefined,
            squadTitle: '모닝런 스쿼드',
          },
        })}
      />,
    );

    expect(screen.getByText('모닝런 스쿼드')).toBeDefined();
  });

  it('payload.message가 화면에 표시된다', () => {
    render(
      <NotificationCard
        item={makeItem({
          payload: { message: '새로운 댓글이 달렸습니다.' },
        })}
      />,
    );

    expect(screen.getByText('새로운 댓글이 달렸습니다.')).toBeDefined();
  });

  it('안읽은 알림 클릭 시 onNavigate와 onRead가 모두 호출된다', () => {
    const onNavigate = vi.fn();
    const onRead = vi.fn();
    render(<NotificationCard item={makeItem({ read: false })} onNavigate={onNavigate} onRead={onRead} />);

    fireEvent.click(screen.getByRole('button', { name: /크루 합류가 수락되었습니다/ }));

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onRead).toHaveBeenCalledOnce();
  });

  it('이미 읽은 알림 클릭 시 onNavigate는 호출되고 onRead는 호출되지 않는다', () => {
    const onNavigate = vi.fn();
    const onRead = vi.fn();
    render(<NotificationCard item={makeItem({ read: true })} onNavigate={onNavigate} onRead={onRead} />);

    fireEvent.click(screen.getByRole('button', { name: /크루 합류가 수락되었습니다/ }));

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onRead).not.toHaveBeenCalled();
  });

  it('isReading이 true이면 클릭 시 onNavigate는 호출되고 onRead는 호출되지 않는다', () => {
    const onNavigate = vi.fn();
    const onRead = vi.fn();
    render(<NotificationCard item={makeItem({ read: false })} onNavigate={onNavigate} onRead={onRead} isReading={true} />);

    fireEvent.click(screen.getByRole('button', { name: /크루 합류가 수락되었습니다/ }));

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onRead).not.toHaveBeenCalled();
  });

  it('알림 옵션 버튼이 렌더링된다', () => {
    render(<NotificationCard item={makeItem()} />);

    expect(screen.getByRole('button', { name: '알림 옵션' })).toBeDefined();
  });
});
