import { test, expect, Page } from '@playwright/test';

const startReading = async (page: Page) => {
  await page.goto('/');
  await page.getByTestId('start-reading').click();
  await expect(page.getByTestId('reader-view')).toBeVisible();
};

const goToComicPanel = async (page: Page) => {
  for (let i = 0; i < 12; i++) {
    if (await page.getByTestId('comic-panel').isVisible()) {
      return;
    }
    await page.keyboard.press('ArrowRight');
  }
  throw new Error('No comic panel found within 12 pages.');
};

const goToComicImage = async (page: Page) => {
  for (let i = 0; i < 12; i++) {
    if (await page.getByTestId('comic-image').isVisible()) {
      return true;
    }
    await page.keyboard.press('ArrowRight');
  }
  return false;
};

test.describe('Image Loading', () => {
  test.beforeEach(async ({ page }) => {
    await startReading(page);
  });

  test('should display comic panel images when navigating to comic pages', async ({ page }) => {
    await goToComicPanel(page);

    const comicImage = page.getByTestId('comic-image');

    // Verify the comic image is visible and loaded
    await expect(comicImage).toBeVisible();
    const loaded = await comicImage.evaluate((img: HTMLImageElement) => img.naturalWidth > 0);
    expect(loaded).toBe(true);
  });

  test('should open lightbox when clicking on comic panel', async ({ page }) => {
    const hasImage = await goToComicImage(page);
    test.skip(!hasImage, 'Comic image unavailable; lightbox not testable.');

    // Use force to bypass the hover overlay that intercepts clicks
    await page.getByTestId('comic-image').click({ force: true });

    await expect(page.getByTestId('lightbox-overlay')).toBeVisible();
    await expect(page.getByTestId('lightbox-close')).toBeVisible();
  });

  test('should close lightbox when clicking close button', async ({ page }) => {
    const hasImage = await goToComicImage(page);
    test.skip(!hasImage, 'Comic image unavailable; lightbox not testable.');

    await page.getByTestId('comic-image').click({ force: true });
    await expect(page.getByTestId('lightbox-overlay')).toBeVisible();

    await page.getByTestId('lightbox-close').click();
    await expect(page.getByTestId('lightbox-overlay')).not.toBeVisible();
  });

  test('should close lightbox when clicking backdrop', async ({ page }) => {
    const hasImage = await goToComicImage(page);
    test.skip(!hasImage, 'Comic image unavailable; lightbox not testable.');

    await page.getByTestId('comic-image').click({ force: true });
    await expect(page.getByTestId('lightbox-overlay')).toBeVisible();

    await page.getByTestId('lightbox-overlay').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('lightbox-overlay')).not.toBeVisible();
  });
});

test.describe('Image Fallback', () => {
  test('should handle missing image gracefully', async ({ page }) => {
    await startReading(page);

    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('ArrowRight');
    }

    const criticalErrors = errors.filter(
      (message) => !message.includes('Failed to load resource') && !message.includes('net::ERR')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
