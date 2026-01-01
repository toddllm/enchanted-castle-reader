import { test, expect, Page } from '@playwright/test';

const startReading = async (page: Page) => {
  await page.goto('/');
  await page.getByTestId('start-reading').click();
  await expect(page.getByTestId('reader-view')).toBeVisible();
};

test.describe('Reader Boot', () => {
  test('should display cover page on initial load', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('cover-view')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Enchanted Castle' })).toBeVisible();
    await expect(page.getByTestId('start-reading')).toBeVisible();
  });

  test('should transition from cover to reader when clicking start button', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-reading').click();

    await expect(page.getByTestId('reader-view')).toBeVisible();
  });

  test('should show first page content after opening', async ({ page }) => {
    await startReading(page);
    await expect(page.getByText('There were three of them')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await startReading(page);
  });

  test('should navigate to next page with right arrow key', async ({ page }) => {
    const initialPage = await page.getByTestId('page-current').textContent();

    await page.keyboard.press('ArrowRight');

    await expect(page.getByTestId('page-current')).not.toHaveText(initialPage || '');
  });

  test('should navigate to previous page with left arrow key', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('page-current')).toHaveText('2');

    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('page-current')).toHaveText('1');
  });

  test('should navigate using control buttons', async ({ page }) => {
    await page.getByTestId('nav-next').click();
    await expect(page.getByTestId('page-current')).toHaveText('2');
  });

  test('should not navigate past first page with left arrow', async ({ page }) => {
    await expect(page.getByTestId('nav-prev')).toBeDisabled();

    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('page-current')).toHaveText('1');
  });
});

test.describe('Chapter Menu', () => {
  test.beforeEach(async ({ page }) => {
    await startReading(page);
  });

  test('should open chapter menu when clicking menu button', async ({ page }) => {
    await page.getByTestId('open-library').click();

    await expect(page.getByTestId('chapter-menu')).toBeVisible();
    await expect(page.getByText('Library')).toBeVisible();
  });

  test('should navigate to chapter when selecting from menu', async ({ page }) => {
    await page.getByTestId('open-library').click();

    const chapter2Button = page.getByTestId('chapter-item').filter({ hasText: 'Chapter 2' });
    await expect(chapter2Button).toBeVisible();
    await chapter2Button.click();

    await expect(page.getByTestId('page-chapter')).toHaveText('CHAPTER II');
  });

  test('should close menu when clicking outside', async ({ page }) => {
    await page.getByTestId('open-library').click();

    await expect(page.getByTestId('chapter-menu')).toBeVisible();

    await page.locator('.fixed.inset-0').first().click({ force: true });
    await expect(page.getByTestId('chapter-menu')).not.toBeVisible();
  });
});

test.describe('Bookmarks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId('start-reading').click();
    await expect(page.getByTestId('reader-view')).toBeVisible();
  });

  test('should add bookmark when clicking bookmark button', async ({ page }) => {
    const bookmarkButton = page.getByTestId('bookmark-toggle');
    await bookmarkButton.click();

    await expect(bookmarkButton.locator('svg')).toHaveClass(/fill-current/);
  });

  test('should show bookmark in menu after adding', async ({ page }) => {
    await page.getByTestId('bookmark-toggle').click();

    await page.getByTestId('open-library').click();

    await expect(page.getByTestId('bookmark-list')).toBeVisible();
    await expect(page.getByTestId('bookmark-item').first()).toBeVisible();
  });

  test('should remove bookmark when clicking again', async ({ page }) => {
    const bookmarkButton = page.getByTestId('bookmark-toggle');

    await bookmarkButton.click();
    await bookmarkButton.click();

    await expect(bookmarkButton.locator('svg')).not.toHaveClass(/fill-current/);
  });

  test('should navigate to bookmarked page from menu', async ({ page }) => {
    await page.getByTestId('nav-next').click();
    await page.getByTestId('nav-next').click();
    await expect(page.getByTestId('page-current')).toHaveText('3');

    await page.getByTestId('bookmark-toggle').click();

    await page.getByTestId('nav-prev').click();
    await page.getByTestId('nav-prev').click();
    await expect(page.getByTestId('page-current')).toHaveText('1');

    await page.getByTestId('open-library').click();
    await page.getByTestId('bookmark-item').first().click();

    await expect(page.getByTestId('page-current')).toHaveText('3');
  });
});

test.describe('Continue Reading / Progress Persistence', () => {
  test('should save progress and resume on reload', async ({ page }) => {
    await startReading(page);

    for (let i = 0; i < 4; i++) {
      await page.getByTestId('nav-next').click();
    }

    await expect(page.getByTestId('page-current')).toHaveText('5');

    await page.reload();
    await expect(page.getByTestId('cover-view')).toBeVisible();

    // Wait for continue-reading button to be attached and stable after animation
    const continueBtn = page.getByTestId('continue-reading');
    await expect(continueBtn).toBeVisible();
    await expect(continueBtn).toBeEnabled();
    // Force click to bypass any animation instability
    await continueBtn.click({ force: true });

    await expect(page.getByTestId('page-current')).toHaveText('5');
  });
});
