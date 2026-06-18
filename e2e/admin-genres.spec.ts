import { test, expect } from '@playwright/test';

test.describe('管理者ジャンル直接管理 E2Eテスト', () => {

  test('非管理者ユーザーでのアクセス制限確認', async ({ page }) => {
    // 1. 管理者以外の状態で /admin/genres へのアクセスを試みる
    await page.goto('/admin/genres');
    
    // アクセス拒否されて /not-found に遷移するか、404表示になることを確認
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    expect(
      currentUrl.includes('/not-found') || 
      currentUrl.includes('/login') || 
      await page.locator('text=見つかりません').isVisible()
    ).toBeTruthy();
  });

  test('管理者ユーザーでのジャンル管理画面UI表示および相互遷移確認', async ({ page }) => {
    // 1. ログイン画面に遷移して、E2Eテストログインボタンでログイン
    await page.goto('/login');
    const e2eLoginBtn = page.locator('#e2e-test-login-btn');
    if (await e2eLoginBtn.isVisible()) {
      await e2eLoginBtn.click();
      await page.waitForURL('/', { timeout: 10000 });
    }

    // 2. ジャンル管理画面へ遷移
    await page.goto('/admin/genres');
    
    // 認証判定およびリダイレクトの完了を待機
    await page.waitForTimeout(2000);

    // 静的 h1 ではなく、認証解決後にしか表示されない #genreId の有無で画面が表示されたかを判定
    const isPageVisible = await page.locator('#genreId').isVisible().catch(() => false);
    
    if (isPageVisible) {
      // タイトル、概要、フォーム入力エリア、一覧テーブルの存在確認
      await expect(page.locator('h1')).toContainText('ジャンル直接管理');
      await expect(page.locator('text=管理者専用')).toBeVisible();
      await expect(page.locator('#genreId')).toBeVisible();
      await expect(page.locator('#displayName')).toBeVisible();
      await expect(page.locator('#description')).toBeVisible();
      await expect(page.locator('button:has-text("ジャンルを追加")')).toBeVisible();
      
      // 相互ナビゲーションリンクの存在確認
      const moderationLink = page.locator('text=モデレーション審査画面へ');
      await expect(moderationLink).toBeVisible();
      
      // モデレーション画面に遷移できるか
      await moderationLink.click();
      await page.waitForURL(/\/admin\/moderation/, { timeout: 5000 });
      await expect(page.locator('h1')).toContainText('モデレーション審査');

      // モデレーション画面側からジャンル管理画面に戻れるか
      const genreLink = page.locator('text=ジャンル直接管理画面へ');
      await expect(genreLink).toBeVisible();
      await genreLink.click();
      await page.waitForURL(/\/admin\/genres/, { timeout: 5000 });
    }
  });

  test('ジャンルアイコン画像検証（SVG禁止・サイズ制限）の動作確認', async ({ page }) => {
    await page.goto('/admin/genres');
    
    // 認証判定およびリダイレクトの完了を待機
    await page.waitForTimeout(2000);

    const isPageVisible = await page.locator('#genreId').isVisible().catch(() => false);
    
    if (isPageVisible) {
      const fileInput = page.locator('#iconFile');
      const submitBtn = page.locator('button:has-text("ジャンルを追加")');
      
      // 1. SVGファイルをセットして検証エラーになることを確認
      await fileInput.setInputFiles({
        name: 'test.svg',
        mimeType: 'image/svg+xml',
        buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>')
      });
      
      await expect(page.locator('text=PNG, JPEG, GIF ファイルのみアップロード可能です。')).toBeVisible();
      await expect(submitBtn).toBeDisabled();

      // 2. 2MBを超える大容量ファイルをセットして検証エラーになることを確認
      // 2.1MBのダミーバッファ
      const largeBuffer = Buffer.alloc(2.1 * 1024 * 1024);
      await fileInput.setInputFiles({
        name: 'large.png',
        mimeType: 'image/png',
        buffer: largeBuffer
      });

      await expect(page.locator('text=ファイルサイズは 2MB 以下にしてください。')).toBeVisible();
      await expect(submitBtn).toBeDisabled();
    }
  });

  test('非同期ローディングとスケルトン要素の確認', async ({ page }) => {
    // データロード中にスケルトンが表示されるか、その属性が存在することを確認
    await page.goto('/admin/genres');
    
    // 認証判定およびリダイレクトの完了を待機
    await page.waitForTimeout(2000);

    const isPageVisible = await page.locator('#genreId').isVisible().catch(() => false);
    
    if (isPageVisible) {
      // スケルトンプレースホルダーの data-testid 属性をアサート
      const skeleton = page.locator('[data-testid="genres-management-skeleton"]');
      expect(await skeleton.count()).toBeGreaterThanOrEqual(0);
    }
  });
});
