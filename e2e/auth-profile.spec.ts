import { test, expect } from '@playwright/test';

test.describe('ユーザー認証・プロフィール管理 E2Eテスト', () => {
  
  test('ログイン画面にアクセスし、E2Eテスト用ログインボタンで正常にログインでき、プロフィールの編集とログアウトができること', async ({ browser }) => {
    // 未ログイン状態をテストするため、新しい隔離されたコンテキストを作成
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    
    // 1. ホームページにアクセス
    await page.goto('/');
    
    // 2. 「ログイン」ボタンが存在することを確認し、クリック
    const loginLink = page.locator('a').filter({ hasText: /^ログイン$/ }).first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    
    // 3. ログインページへ遷移したことを確認
    await expect(page).toHaveURL(/\/login/);
    
    // 4. E2Eテスト用ログインボタンが存在することを確認し、クリック
    const e2eLoginBtn = page.locator('#e2e-test-login-btn');
    await expect(e2eLoginBtn).toBeVisible();
    await e2eLoginBtn.click();
    
    // 5. ログイン成功後にホームページ（/）へリダイレクトされることを確認
    await expect(page).toHaveURL('/');
    
    // 6. ログイン成功後にサイドバーまたはヘッダーのプロフィールが表示されることを確認
    const navProfile = page.getByTestId('nav-profile');
    if (await navProfile.isVisible({ timeout: 10000 })) {
      await navProfile.click();
    } else {
      const headerProfileBtn = page.getByTestId('header-profile-btn');
      await expect(headerProfileBtn).toBeVisible({ timeout: 10000 });
      await headerProfileBtn.click();
      await page.locator('[data-testid="header-profile-popup"] >> text=マイページ').click();
    }
    
    // 9. プロフィール画面（/profile/[userId]）へ遷移することを確認
    await expect(page).toHaveURL(/\/profile\//);
    
    // 10. プロフィール「編集」ボタンをクリック
    const editProfileBtn = page.locator('text=編集');
    // もし編集ボタンがあればクリックし、プロフィールの変更テストを実行する
    if (await editProfileBtn.isVisible()) {
      await editProfileBtn.click();
      
      // 表示名入力フィールドの編集
      const displayNameInput = page.locator('input[type="text"]').first();
      await expect(displayNameInput).toBeVisible();
      const currentName = await displayNameInput.inputValue();
      const newName = `E2Eテストユーザー_${Date.now().toString().slice(-4)}`;
      
      await displayNameInput.fill(newName);
      
      // 自己紹介入力フィールドの編集
      const bioInput = page.locator('textarea').first();
      if (await bioInput.isVisible()) {
        await bioInput.fill('PlaywrightのE2Eテストによって自己紹介が自動更新されました。');
      }
      
      // 「保存」ボタンをクリック
      const saveBtn = page.locator('text=保存');
      await expect(saveBtn).toBeVisible();
      await saveBtn.click();
      
      // 更新後の表示名が画面上に正しく反映されていることを確認
      await expect(page.locator(`text=${newName}`)).toBeVisible();
    }
    
    // 11. ログアウト処理の検証
    const sidebarProfileBtn = page.getByTestId('sidebar-profile-btn');
    if (await sidebarProfileBtn.isVisible()) {
      await sidebarProfileBtn.click();
    } else {
      const headerProfileBtn = page.getByTestId('header-profile-btn');
      await headerProfileBtn.click();
    }
    
    // 「ログアウト」ボタンをクリック
    const logoutBtn = page.locator('text=ログアウト');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();
    
    // 12. ログアウト成功後にホームページに戻り、「ログイン」リンクが再表示されることを確認
    await expect(page).toHaveURL('/');
    await expect(page.locator('a').filter({ hasText: /^ログイン$/ }).first()).toBeVisible();
    
    // コンテキストをクローズ
    await context.close();
  });

  test('本人プロフィール: プレイ履歴タブが表示され他人プロフィールでは非表示', async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('/login');
    const e2eLoginBtn = page.locator('#e2e-test-login-btn');
    await expect(e2eLoginBtn).toBeVisible();
    await e2eLoginBtn.click();
    await expect(page).toHaveURL('/');

    const navProfile = page.getByTestId('nav-profile');
    if (await navProfile.isVisible({ timeout: 10000 })) {
      await navProfile.click();
    } else {
      const headerProfileBtn = page.getByTestId('header-profile-btn');
      await expect(headerProfileBtn).toBeVisible({ timeout: 10000 });
      await headerProfileBtn.click();
      await page.locator('[data-testid="header-profile-popup"] >> text=マイページ').click();
    }
    await expect(page).toHaveURL(/\/profile\//);

    const historyTab = page.locator('[data-testid="profile-tab-history"]');
    await expect(historyTab).toBeVisible();
    await historyTab.click();

    const historySection = page.locator('[data-testid="play-history-section"]');
    await expect(historySection).toBeVisible();

    // 読み込み完了を待つ
    await expect(page.locator('text=プレイ履歴を読み込み中...')).not.toBeVisible({ timeout: 15000 });

    const emptyOrEntries =
      (await page.locator('[data-testid="play-history-entry"]').count()) > 0 ||
      (await page.locator('text=まだプレイ履歴がありません').isVisible());
    expect(emptyOrEntries).toBe(true);

    const profileUrl = page.url();
    const uidMatch = profileUrl.match(/\/profile\/([^/?]+)/);
    expect(uidMatch).toBeTruthy();
    const otherUid = uidMatch![1] === 'other-user-e2e' ? 'another-user' : 'other-user-e2e';
    await page.goto(`/profile/${otherUid}`);
    await expect(page.locator('[data-testid="profile-tab-history"]')).toHaveCount(0);

    await context.close();
  });

  test('作成したクイズの検索とページング、共通QuizCardの表示', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    // 1. ログイン
    await page.goto('/login');
    const e2eLoginBtn = page.locator('#e2e-test-login-btn');
    await expect(e2eLoginBtn).toBeVisible();
    await e2eLoginBtn.click();
    await expect(page).toHaveURL('/');

    // 2. マイページへ遷移
    const navProfile = page.getByTestId('nav-profile');
    if (await navProfile.isVisible({ timeout: 10000 })) {
      await navProfile.click();
    } else {
      const headerProfileBtn = page.getByTestId('header-profile-btn');
      await expect(headerProfileBtn).toBeVisible({ timeout: 10000 });
      await headerProfileBtn.click();
      await page.locator('[data-testid="header-profile-popup"] >> text=マイページ').click();
    }
    await expect(page).toHaveURL(/\/profile\//);

    // 3. 検索入力欄とページングUIが表示されていることを確認
    const searchInput = page.getByTestId('profile-quiz-search-input');
    await expect(searchInput).toBeVisible();
    const pagination = page.getByTestId('profile-quiz-pagination');
    await expect(pagination).toBeVisible();

    // 4. 共通QuizCard（data-testid="quiz-card"）が1ページ目の上限（9件）表示されていることを確認
    const cards = page.getByTestId('quiz-card');
    await expect(cards).toHaveCount(9);

    // 5. 検索の検証: 「クイズ_10」で検索し、該当カードのみ表示されること
    await searchInput.fill('クイズ_10');
    // キーワードフィルタ後の件数は1件のはず
    await expect(cards).toHaveCount(1);
    await expect(page.locator('text=[AD_TEST] クイズ_10')).toBeVisible();
    await expect(page.getByText('[AD_TEST] クイズ_1', { exact: true })).not.toBeVisible();

    // ページングUIは1件のみなので非表示になるはず
    await expect(pagination).toHaveCount(0);

    // 6. 検索キーワードクリア
    await searchInput.fill('');
    await expect(cards).toHaveCount(9);
    await expect(pagination).toBeVisible();

    // 7. ページング遷移の検証: 「次へ」をクリック
    const firstCard = cards.first();
    const firstCardTitle = await firstCard.locator('h3').textContent();
    expect(firstCardTitle).toBeTruthy();

    const nextBtn = pagination.locator('text=次へ');
    await nextBtn.click();

    // 2ページ目に遷移した後は、1ページ目の最初のクイズが表示されていないことを確認
    if (firstCardTitle) {
      await expect(page.getByText(firstCardTitle, { exact: true })).not.toBeVisible();
    }
    await expect(cards.first()).toBeVisible();

    await context.close();
  });
});
