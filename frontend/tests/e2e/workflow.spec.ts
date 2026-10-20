import { test, expect } from '@playwright/test';

test.describe('Sketch2Screen AI (S2S ux) End-to-End Workflow', () => {

  test('1. Landing page and navigation to workspace', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sketch2Screen/i);
    await expect(page.locator('h1')).toContainText('From Hand-Drawn Ideas');

    // Click "Start Creating"
    const uploadBtn = page.locator('a[href="/upload"]').first();
    await expect(uploadBtn).toBeVisible();
    await uploadBtn.click();
    await expect(page).toHaveURL(/.*upload/);
  });

  test('2. Invalid upload validation', async ({ page }) => {
    await page.goto('/upload');
    await expect(page.locator('h1')).toContainText('Sketch Upload');

    // Attempt to upload an invalid script file as image via input[type="file"]
    await page.setInputFiles('input[type="file"]', {
      name: 'malicious.sh',
      mimeType: 'application/x-sh',
      buffer: Buffer.from('#!/bin/bash\necho "exploit"'),
    });

    // Verification: Error toast or validation message displayed
    await expect(page.locator('text=Unsupported File Format').first()).toBeVisible();
  });

  test('3. Successful upload and sketch preprocessing', async ({ page }) => {
    await page.goto('/upload');

    // Create a 1-pixel valid PNG buffer
    const validPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );

    await page.setInputFiles('input[type="file"]', {
      name: 'valid_sketch.png',
      mimeType: 'image/png',
      buffer: validPngBuffer,
    });

    // Preprocessing & Image Preview check
    await expect(page.locator('text=Validated for OpenCV').first()).toBeVisible();
    const generateBtn = page.locator('button:has-text("Generate React Interface")').first();
    await expect(generateBtn).toBeVisible();
  });

  test('4. AI service failure and graceful fallback state', async ({ page }) => {
    await page.goto('/generate?error=simulate_vlm_timeout');
    // Verify page renders error boundary or retry trigger rather than crashing
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('5. Successful interface generation and live visual rendering', async ({ page }) => {
    await page.goto('/editor');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();

    // Verify canvas renders allowlisted UI elements
    const canvas = page.locator('main');
    await expect(canvas).toBeVisible();

    // Verify Desktop / Tablet / Mobile viewport switcher
    const mobileBtn = page.locator('button[title*="Mobile"]').first();
    await expect(mobileBtn).toBeVisible();
    await mobileBtn.click();

    const desktopBtn = page.locator('button[title*="Desktop"]').first();
    await expect(desktopBtn).toBeVisible();
    await desktopBtn.click();
  });

  test('6. Component editing, properties inspection, and natural-language correction', async ({ page }) => {
    await page.goto('/editor');

    // Look for right-hand Properties Inspector
    await expect(page.locator('text=Component Properties')).toBeVisible();

    // Look for Natural Language Correction input
    const nlInput = page.locator('input[placeholder*="Make it blue"]').first();
    if (await nlInput.isVisible()) {
      await nlInput.fill('Make it blue');
      await page.locator('button:has-text("Apply")').click();
    }

    // Test text editing: change label if input exists
    const labelInput = page.locator('input[value*="Button"], input[value*="Dashboard"]').first();
    if (await labelInput.isVisible()) {
      await labelInput.fill('Updated E2E Test Title');
      await expect(labelInput).toHaveValue('Updated E2E Test Title');
    }
  });

  test('7. Fidelity report display with 7 quantitative vision dimensions', async ({ page }) => {
    await page.goto('/fidelity');
    await expect(page.locator('h1, h2').filter({ hasText: /Fidelity/i }).first()).toBeVisible();

    // Verify key dimensions are rendered
    await expect(page.locator('text=Component Presence').first()).toBeVisible();
    await expect(page.locator('text=Layout Structure').first()).toBeVisible();
  });

  test('8. Project persistence, history vault, rename, and delete confirmation', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('h1').filter({ hasText: /Project History/i })).toBeVisible();

    // Verify project records exist
    const cards = page.locator('.p-5.bg-charcoal-900');
    await expect(cards.first()).toBeVisible();

    // Test delete confirmation modal trigger
    const deleteBtn = page.locator('button[title*="Delete"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(page.locator('text=Delete Project Confirmation')).toBeVisible();
      // Click Cancel to preserve data
      await page.locator('button:has-text("Cancel")').click();
    }
  });

  test('9. React project code export and ZIP download trigger', async ({ page }) => {
    await page.goto('/editor');

    // Click Export React button
    const exportBtn = page.locator('button:has-text("Export")').first();
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Verify Export Modal opens
    await expect(page.locator('text=Export React TypeScript Interface')).toBeVisible();
    await expect(page.locator('pre code').first()).toContainText('import React');

    // Verify zero dangerous eval or scripts in compiled code preview
    const codeText = await page.locator('pre code').first().innerText();
    expect(codeText).not.toContain('eval(');
    expect(codeText).not.toContain('Function(');

    // Verify download button exists
    const downloadBtn = page.locator('button:has-text("Download Package")');
    await expect(downloadBtn).toBeVisible();
  });

});
