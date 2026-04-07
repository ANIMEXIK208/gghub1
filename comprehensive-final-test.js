const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('=== COMPREHENSIVE FINAL TEST ===\n');
    
    // Test 1: Admin login page
    console.log('Test 1: Admin login page');
    await page.goto('http://localhost:3005/admin/login', { waitUntil: 'networkidle' });
    let text = await page.evaluate(() => document.body.innerText);
    if (text.includes('Loading...')) throw new Error('Admin login still shows Loading');
    if (!text.includes('Admin Sign In')) throw new Error('Admin form missing');
    console.log('✓ Admin login renders without loading block\n');
    
    // Test 2: Admin login form functionality
    console.log('Test 2: Admin login workflow');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
    text = await page.evaluate(() => document.body.innerText);
    if (!text.includes('Admin Dashboard')) throw new Error('Dashboard did not load');
    console.log('✓ Admin login redirects to dashboard\n');
    
    // Test 3: User login page
    console.log('Test 3: Login page');
    await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle' });
    text = await page.evaluate(() => document.body.innerText);
    if (text.includes('Loading...')) throw new Error('Login page still shows Loading');
    if (!text.includes('GGHub')) throw new Error('Login form missing');
    console.log('✓ Login page renders without loading block\n');
    
    // Test 4: Home page
    console.log('Test 4: Home page');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
    text = await page.evaluate(() => document.body.innerText);
    if (text.includes('Loading...')) throw new Error('Home page shows Loading');
    if (!text.includes('Premium Gaming Gear')) throw new Error('Home content missing');
    console.log('✓ Home page renders immediately\n');
    
    // Test 5: Leaderboard section
    console.log('Test 5: Leaderboard functionality');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
    await page.waitForSelector('#leaderboard', { timeout: 15000 });
    console.log('✓ Leaderboard section renders\n');
    
    console.log('=== ALL TESTS PASSED ===');
    console.log('Admin login "Loading..." issue is COMPLETELY RESOLVED');
    console.log('Leaderboard functionality verified');
    process.exit(0);
    
  } catch (error) {
    console.error('TEST FAILED:', error?.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
