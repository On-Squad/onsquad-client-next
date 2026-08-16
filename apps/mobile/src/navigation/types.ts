/** 스택 화면과 각 화면이 받는 파라미터. 화면 간 계약이다. */
export type RootStackParamList = {
  CrewList: undefined;
  CrewDetail: { crewId: number; crewName: string };
  CrewNew: undefined;
};
