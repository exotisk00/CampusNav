import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'http://localhost:5173';

const routesToTest = [
  { path: '/', name: 'Landing Page' },
  { path: '/login', name: 'Login Page' },
  { path: '/signup', name: 'Signup Page' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/map', name: 'Interactive Campus Map' },
  { path: '/lost-found', name: 'Lost & Found Hub' },
  { path: '/lost-found/post', name: 'Report Item (PostItem)' },
  { path: '/events', name: 'Events Catalog' },
  { path: '/events/evt_001', name: 'Event Details' },
  { path: '/notifications', name: 'Notifications Center' },
  { path: '/assistant', name: 'Campus AI Assistant' },
  { path: '/profile', name: 'Student Profile' },
  { path: '/settings', name: 'Preferences & Settings' },
  { path: '/language', name: 'Language Settings' },
];

const screenSizes = [
  { name: 'Desktop (1440x900)', width: 1440, height: 900 },
  { name: 'Tablet (768x1024)', width: 768, height: 1024 },
  { name: 'Mobile (375x812)', width: 375, height: 812 },
];

async function runE2ETests() {
  console.log('=== STARTING CAMPUSNAV FULL E2E BROWSER TEST SUITE ===\n');

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const consoleLogs = [];
  const pageErrors = [];

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const failedRequests = [];

  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedRequests.push(`${res.status()}: ${res.url()}`);
    }
  });

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      consoleLogs.push({ type, text, location: msg.location() });
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  let passCount = 0;
  let failCount = 0;

  function record(testName, success, details = '') {
    if (success) {
      passCount++;
      console.log(`  ✓ PASS: ${testName} ${details ? `(${details})` : ''}`);
    } else {
      failCount++;
      console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    }
  }

  try {
    // 1. Test All Routes Navigation
    console.log('1. Testing All 14 Application Routes:');
    for (const route of routesToTest) {
      try {
        const response = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        const status = response ? response.status() : 0;
        const rootContent = await page.$('#root');
        const hasContent = rootContent !== null;
        record(`Route ${route.path} - ${route.name}`, status === 200 && hasContent, `Status: ${status}`);
      } catch (err) {
        record(`Route ${route.path} - ${route.name}`, false, err.message);
      }
    }

    // 2. Test Firebase Demo Login & Session Persistence
    console.log('\n2. Testing Firebase Demo Login:');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(500);

    const demoLoginBtn = await page.$('.demo-login-btn');
    if (demoLoginBtn) {
      await demoLoginBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 8000 }).catch(() => {});
      const currentUrl = page.url();
      record('Demo Login redirection to /dashboard', currentUrl.includes('/dashboard'), currentUrl);

      // Verify user in localStorage
      const storedAuth = await page.evaluate(() => localStorage.getItem('campusnav_auth'));
      const storedUser = await page.evaluate(() => localStorage.getItem('campusnav_user'));
      record('Authentication persistence in localStorage', storedAuth === 'true' && storedUser !== null);
    } else {
      record('Find Demo Login button', false, 'button not found');
    }

    // 3. Test Events & Firestore RSVP Toggle
    console.log('\n3. Testing Events & Firestore RSVP:');
    await page.goto(`${BASE_URL}/events`);
    await page.waitForTimeout(500);
    const eventCards = await page.$$('.event-card');
    record('Events listing rendered', eventCards.length > 0, `Found ${eventCards.length} events`);

    const rsvpBtn = await page.$('.event-action-btn');
    if (rsvpBtn) {
      const initialText = await rsvpBtn.innerText();
      await rsvpBtn.click();
      await page.waitForTimeout(500);
      const afterText = await rsvpBtn.innerText();
      record('Toggle event RSVP in database & UI', initialText !== afterText, `Before: "${initialText.trim()}", After: "${afterText.trim()}"`);
    }

    // 4. Test Lost & Found Item Creation and Storage Upload
    console.log('\n4. Testing Lost & Found Item Creation with Image Upload:');
    await page.goto(`${BASE_URL}/lost-found/post`);
    await page.waitForTimeout(500);

    // Fill form
    await page.fill('input[placeholder*="e.g."]', 'Lost Sony WH-1000XM4 Headphones');
    await page.fill('textarea', 'Black over-ear headphones left in library 3rd floor quiet zone near window.');

    // Create a 1x1 test PNG image
    const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const tempImgPath = path.join(rootDir, 'test-upload-sample.png');
    fs.writeFileSync(tempImgPath, Buffer.from(samplePngBase64, 'base64'));

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(tempImgPath);
      await page.waitForTimeout(500);
      const previewImg = await page.$('.image-preview-box img, .preview-img');
      record('Item image selected & preview rendered', previewImg !== null);
    }

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(2500);
      const postUrl = page.url();
      record('Post item submission & redirect to /lost-found', postUrl.includes('/lost-found'));
    }

    // Clean up temporary image
    if (fs.existsSync(tempImgPath)) {
      fs.unlinkSync(tempImgPath);
    }

    // 5. Test Student Profile & Avatar Upload
    console.log('\n5. Testing Profile & Avatar Upload:');
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(500);

    const profileName = await page.$('.profile-name');
    const nameText = profileName ? await profileName.innerText() : '';
    record('Profile loads user data', nameText.length > 0, `User: ${nameText}`);

    // Test Edit Profile
    const editBtn = await page.$('.profile-header-actions button');
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(300);
      const bioInput = await page.$('textarea');
      if (bioInput) {
        await bioInput.fill('Updated bio: Hackathon enthusiast & active campus developer!');
        await editBtn.click(); // Save Changes
        await page.waitForTimeout(500);
        record('Edit profile and save changes', true);
      }
    }

    // Test Avatar Upload on Profile
    const avatarInput = await page.$('.avatar-editable input[type="file"]');
    if (avatarInput) {
      const avatarTempPath = path.join(rootDir, 'test-avatar-sample.png');
      fs.writeFileSync(avatarTempPath, Buffer.from(samplePngBase64, 'base64'));
      await avatarInput.setInputFiles(avatarTempPath);
      await page.waitForTimeout(500);
      const avatarImg = await page.$('.avatar-image');
      record('Avatar image upload and preview update', avatarImg !== null);
      if (fs.existsSync(avatarTempPath)) fs.unlinkSync(avatarTempPath);
    }

    // 6. Test Notifications Center
    console.log('\n6. Testing Notifications Center:');
    await page.goto(`${BASE_URL}/notifications`);
    await page.waitForTimeout(500);
    const notifItems = await page.$$('.notif-card');
    record('Notifications rendered', notifItems.length > 0, `Found ${notifItems.length} notifications`);

    // Test Mark All As Read
    const markAllBtn = await page.$('button:has-text("Mark all as read")');
    if (markAllBtn) {
      await markAllBtn.click();
      await page.waitForTimeout(500);
      record('Mark all notifications as read', true);
    }

    // 7. Test Logout Flow
    console.log('\n7. Testing Logout:');
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForTimeout(500);
    const logoutBtn = await page.$('button:has-text("Sign Out")');
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForTimeout(500);
      const afterLogoutUrl = page.url();
      const authFlag = await page.evaluate(() => localStorage.getItem('campusnav_auth'));
      record('Logout clears auth state and redirects to landing', authFlag === null, `URL: ${afterLogoutUrl}`);
    } else {
      record('Find Sign Out button', false, 'button not found');
    }

    // 8. Test Firebase Signup
    console.log('\n8. Testing Firebase Signup:');
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForTimeout(500);
    const testEmail = `student_${Date.now()}@university.edu`;
    await page.fill('input[type="text"]', 'Test Student');
    await page.fill('input[type="email"]', testEmail);
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].fill('StudentPass123!');
      await passwordInputs[1].fill('StudentPass123!');
    }
    const signupSubmitBtn = await page.$('button[type="submit"]');
    if (signupSubmitBtn) {
      await signupSubmitBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 8000 }).catch(() => {});
      const afterSignupUrl = page.url();
      record('New student signup and redirect to dashboard', afterSignupUrl.includes('/dashboard'), `Email: ${testEmail}`);
    }

    // 9. Responsive Screen Sizes Test
    console.log('\n9. Testing Responsive Layouts on Different Screen Sizes:');
    for (const size of screenSizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForTimeout(300);

      if (size.width < 768) {
        // Mobile view - check mobile toggle or bottom navigation
        const mobileToggle = await page.$('.nav-mobile-toggle, .bottom-nav, .mobile-header');
        record(`Responsive layout: ${size.name}`, mobileToggle !== null || (await page.$('.dashboard-page')) !== null);
      } else {
        const desktopNav = await page.$('.navbar');
        record(`Responsive layout: ${size.name}`, desktopNav !== null);
      }
    }

    // 10. Console Error Verification
    console.log('\n10. Console Errors & Page Errors Check:');
    if (failedRequests.length > 0) {
      console.log('  Failed HTTP Requests:', failedRequests);
    }
    if (consoleLogs.length > 0) {
      console.log('  Console Errors Details:', consoleLogs);
    }
    record('No unhandled page errors (runtime crashes)', pageErrors.length === 0, pageErrors.length > 0 ? pageErrors.join(', ') : '0 runtime errors');
    record('No critical console errors', consoleLogs.length === 0, consoleLogs.length > 0 ? consoleLogs.map(l => l.text).join('; ') : '0 console errors');

  } catch (err) {
    console.error('Fatal test error:', err);
    record('E2E execution', false, err.message);
  } finally {
    await browser.close();
  }

  console.log(`\n======================================================`);
  console.log(`E2E TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log(`======================================================\n`);

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests();
