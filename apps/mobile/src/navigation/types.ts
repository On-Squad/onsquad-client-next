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
  CrewNew: undefined;
};
