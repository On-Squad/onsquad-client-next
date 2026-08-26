/**
 * 크루장 여부.
 *
 * **웹과 의도적으로 다르다.** 웹은 `owner.nickname === user.nickname` 으로 비교하는데
 * 닉네임은 바뀔 수도 겹칠 수도 있어 남의 크루에서 뱃지가 뜨거나 내 크루에서 사라진다.
 * 백엔드가 `owner.id` 를 주므로 그것으로 판정한다 — 같은 작업량으로 오판이 사라진다.
 *
 * 존재부터 확인하는 이유는 `undefined === undefined` 가 참이기 때문이다.
 * 그냥 비교하면 **비로그인 사용자가 주인 없는 크루에서 크루장이 된다.**
 */
export const isCrewOwner = ({ ownerId, myId }: { ownerId?: number; myId?: number }): boolean =>
  ownerId !== undefined && myId !== undefined && ownerId === myId;
