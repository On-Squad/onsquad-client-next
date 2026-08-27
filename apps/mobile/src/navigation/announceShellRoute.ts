import { announceEditUrl, announceWriteUrl } from '../entities/crew/lib/announceWebUrl';
import type { RootStackParamList } from './types';

/**
 * 웹뷰가 보낸 path 를 네이티브 스택 동작으로 바꾼 결과.
 *
 * 공지 경로(/crews/{id}/announce 이하)는 전부 같은 웹뷰 호스트 화면(AnnounceDetail) 하나에
 * 매핑되고, path 는 그 화면이 로드할 주소로만 쓰인다 — 경로마다 다른 RN 화면을 만들지 않는다.
 * 목록만 예외로 RN 이 직접 그리는 AnnounceList 다.
 */
export type AnnounceShellIntent =
  | { action: 'push' | 'replace'; screen: 'AnnounceDetail'; params: RootStackParamList['AnnounceDetail'] }
  | { action: 'navigate'; screen: 'AnnounceList'; params: RootStackParamList['AnnounceList'] };

interface ShellRouteContext {
  /** 지금 화면이 들고 있는 크루명. 웹뷰는 크루명을 path 에 싣지 않아 여기서 이어 받는다. */
  crewName: string;
}

const ANNOUNCE_DETAIL = /^\/crews\/(\d+)\/announce\/(\d+)$/;
const ANNOUNCE_WRITE = /^\/crews\/(\d+)\/announce\/write$/;
const ANNOUNCE_EDIT = /^\/crews\/(\d+)\/announce\/(\d+)\/edit$/;
const ANNOUNCE_LIST = /^\/crews\/(\d+)\/announce$/;

/**
 * shell.push — 웹뷰 안에서 다음 화면으로 갈 때 쓰는 경로 매핑.
 *
 * 상세·작성·수정 모두 **새 웹뷰 인스턴스**를 스택에 쌓는다. 하나를 재사용하지 않는다.
 * RN 헤더 제목은 화면 성격을 쓴다 — 웹 CrewDetailAppbar 는 크루명을 쓰지만 RN 헤더는
 * 전환 즉시 그려져야 해서 웹뷰가 크루명을 알려줄 때까지 기다릴 수 없다.
 *
 * @returns 매핑되지 않는 경로면 null — 호출부가 화면을 쌓지 않고 실패 응답을 돌려준다.
 */
export const resolveAnnouncePushIntent = (path: string, { crewName }: ShellRouteContext): AnnounceShellIntent | null => {
  const detail = path.match(ANNOUNCE_DETAIL);

  if (detail) {
    return {
      action: 'push',
      screen: 'AnnounceDetail',
      params: { crewId: Number(detail[1]), crewName, announceId: Number(detail[2]), title: '공지사항' },
    };
  }

  const write = path.match(ANNOUNCE_WRITE);

  if (write) {
    const crewId = Number(write[1]);

    return {
      action: 'push',
      screen: 'AnnounceDetail',
      params: { crewId, crewName, title: '공지 작성', url: announceWriteUrl({ crewId }) },
    };
  }

  const edit = path.match(ANNOUNCE_EDIT);

  if (edit) {
    const crewId = Number(edit[1]);
    const announceId = Number(edit[2]);

    return {
      action: 'push',
      screen: 'AnnounceDetail',
      params: { crewId, crewName, announceId, title: '공지 수정', url: announceEditUrl({ crewId, announceId }) },
    };
  }

  return null;
};

/**
 * shell.replace — 작성·수정을 마쳤을 때 쓰는 경로 매핑.
 *
 * 폼 화면을 스택에 남기지 않는 것이 목적이다. 저장 후 뒤로가기가 방금 저장한 폼으로
 * 되돌아가면 사용자는 같은 글을 두 번 쓰게 된다.
 * - 상세로 갈 때는 replace — 폼을 상세로 갈아 끼운다(수정 완료).
 * - 목록으로 갈 때는 navigate — 스택에 이미 있는 목록으로 되돌아가며 폼을 걷어낸다(작성 완료).
 *   replace 로 두면 목록이 두 장 쌓인다.
 *
 * @returns 매핑되지 않는 경로면 null — 호출부가 화면을 쌓지 않고 실패 응답을 돌려준다.
 */
export const resolveAnnounceReplaceIntent = (
  path: string,
  { crewName }: ShellRouteContext,
): AnnounceShellIntent | null => {
  const detail = path.match(ANNOUNCE_DETAIL);

  if (detail) {
    return {
      action: 'replace',
      screen: 'AnnounceDetail',
      params: { crewId: Number(detail[1]), crewName, announceId: Number(detail[2]), title: '공지사항' },
    };
  }

  const list = path.match(ANNOUNCE_LIST);

  if (list) {
    return {
      action: 'navigate',
      screen: 'AnnounceList',
      params: { crewId: Number(list[1]), crewName },
    };
  }

  return null;
};
