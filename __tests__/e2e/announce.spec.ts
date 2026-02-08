import { expect, test } from '@playwright/test';

const getAnnounceList = (page: import('@playwright/test').Page) =>
  page.getByRole('list').filter({ hasText: /년.*월.*일/ });

test.describe('공지사항', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crews/2/announce');
  });

  test('사용자가 공지사항 리스트에서 하나를 클릭하면 해당 공지사항 상세 페이지로 이동하고 상세 내용을 확인할 수 있다', async ({
    page,
  }) => {
    let firstItemTitle: string;

    await test.step('공지사항 리스트 페이지에 접속한다', async () => {
      await expect(page).toHaveURL('/crews/2/announce');
    });

    await test.step('공지사항 리스트가 화면에 표시된다', async () => {
      const announceList = getAnnounceList(page);
      await expect(announceList).toBeVisible();
    });

    await test.step('공지사항 리스트 중 첫 번째 항목의 제목을 저장한다', async () => {
      const announceList = getAnnounceList(page);
      const firstAnnounceItem = announceList.getByRole('listitem').first();
      await expect(firstAnnounceItem).toBeVisible();
      // 리스트 항목의 첫 줄(제목) 추출
      const fullText = await firstAnnounceItem.innerText();
      firstItemTitle = fullText.split('\n')[0]?.trim() ?? '';
      expect(firstItemTitle, '첫 번째 공지사항 제목을 찾을 수 없음').toBeTruthy();
    });

    await test.step('공지사항 리스트 중 첫 번째 항목을 클릭한다', async () => {
      const announceList = getAnnounceList(page);
      const firstAnnounceItem = announceList.getByRole('listitem').first();
      await firstAnnounceItem.click();
    });

    await test.step('공지사항 상세 페이지로 이동한다', async () => {
      await expect(page).toHaveURL(/\/crews\/2\/announce\/\d+/);
    });

    await test.step('완료된 화면에서 첫 번째 리스트의 제목이 있는지 확인한다', async () => {
      await expect(page.getByText(firstItemTitle, { exact: true })).toBeVisible();
    });

    await test.step('작성자, 권한 뱃지, 작성날짜, 상단고정 버튼, 수정하기 버튼이 표시된다', async () => {
      // 권한 뱃지(크루장 등)
      await expect(page.getByText('크루장')).toBeVisible();
      // 작성날짜 형식(년·월·일 또는 YYYY-MM-DD)
      await expect(page.getByText(/\d{4}년\s*\d{1,2}월\s*\d{1,2}일|\d{4}-\d{2}-\d{2}/)).toBeVisible();
      // 상단고정 버튼
      await expect(page.getByRole('button', { name: '상단고정' })).toBeVisible();
      // 수정하기 버튼
      await expect(page.getByRole('button', { name: '수정하기' })).toBeVisible();
    });

    await test.step('공지사항 본문(description)이 표시된다', async () => {
      const article = page.getByRole('article');
      await expect(article).toBeVisible();
      // 본문에 제목 외 텍스트가 있어야 함(description)
      await expect(article).toContainText(/.+/);
    });
  });
});
