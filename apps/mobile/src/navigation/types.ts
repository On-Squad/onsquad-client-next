import type { NavigatorScreenParams } from '@react-navigation/native';

/** 탭바 안의 화면들. 웹의 `(with-tab)` 라우트 그룹에 대응한다. */
export type MainTabParamList = {
  Home: undefined;
  /** 탭이 아니라 버튼이다 — 누르면 루트 스택의 CrewNew 로 간다. 이 화면에는 도달하지 않는다. */
  CrewNewTab: undefined;
  Community: undefined;
};

/**
 * 스택 화면과 각 화면이 받는 파라미터. 화면 간 계약이다.
 *
 * MainTabs 만 탭바를 갖는다. 상세·개설이 탭 바깥에 있어야
 * 그 화면들 위에 탭바가 남지 않는다 — 웹의 `(no-tab)` 과 같은 구조다.
 */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  CrewDetail: { crewId: number; crewName: string };
  /** 크루 스페이스. 참가자만 들어온다 — 가드는 CrewDetailScreen 에 있다. */
  CrewHome: { crewId: number; crewName: string };
  /** 크루 관리 허브. canManage 인 사람만 크루 홈의 ⚙️ 로 들어온다. */
  CrewManage: { crewId: number; crewName: string };
  /** 참가 신청자 목록. 관리 허브를 거쳐서만 들어온다. */
  CrewParticipants: { crewId: number; crewName: string };
  CrewNew: undefined;
  /** 크루 공지 목록. RN 이 직접 그린다. */
  AnnounceList: { crewId: number; crewName: string };
  /**
   * 공지 상세·작성·수정. 경로별로 다른 URL 을 로드하는 웹뷰다.
   * RN 헤더 제목은 화면 성격을 쓴다 — 웹 CrewDetailAppbar 는 크루명을 쓰지만
   * RN 헤더는 전환 즉시 그려져야 해서 크루명을 기다릴 수 없다.
   *
   * `url` 을 명시하면 `crewId + announceId` 로 구성하는 기본 주소 대신 그 주소를 로드한다.
   * 작성(write)·수정(edit) 화면처럼 announceId 가 없거나 경로가 다른 경우에 쓴다.
   */
  AnnounceDetail: {
    crewId: number;
    crewName: string;
    announceId?: number;
    /** RN 헤더 제목. 화면 성격을 쓴다 — '공지사항' | '공지 작성' | '공지 수정' */
    title: string;
    /** 명시하면 crewId + announceId 구성 대신 이 주소를 로드한다. */
    url?: string;
  };
  /** 인증이 필요한 지점에서 모달로 뜬다. 앱 전체를 막는 게이트가 아니다. */
  Login: undefined;
};
