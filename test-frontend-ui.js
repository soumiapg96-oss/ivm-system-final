const puppeteer = require('puppeteer');

async function testFrontendUI() {
  console.log('🧪 Testing Frontend UI Components...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Navigate to frontend
    console.log('1. Navigating to frontend...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    console.log('✅ Frontend loaded successfully');
    
    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit for any errors to appear
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors found:');
      consoleErrors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Check if login page loads
    console.log('\n2. Testing login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    // Check for login form elements
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const loginButton = await page.$('button[type="submit"]');
    
    if (emailInput && passwordInput && loginButton) {
      console.log('✅ Login form elements found');
    } else {
      console.log('❌ Login form elements missing');
    }
    
    // Test registration page
    console.log('\n3. Testing registration page...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
    
    // Check for registration form elements
    const firstNameInput = await page.$('input[name="first_name"]');
    const lastNameInput = await page.$('input[name="last_name"]');
    const emailRegInput = await page.$('input[name="email"]');
    const phoneInput = await page.$('input[name="phone"]');
    const passwordRegInput = await page.$('input[name="password"]');
    const confirmPasswordInput = await page.$('input[name="confirm_password"]');
    const termsCheckbox = await page.$('input[name="accept_terms"]');
    const registerButton = await page.$('button[type="submit"]');
    
    const registrationElements = [
      { name: 'First Name', element: firstNameInput },
      { name: 'Last Name', element: lastNameInput },
      { name: 'Email', element: emailRegInput },
      { name: 'Phone', element: phoneInput },
      { name: 'Password', element: passwordRegInput },
      { name: 'Confirm Password', element: confirmPasswordInput },
      { name: 'Terms Checkbox', element: termsCheckbox },
      { name: 'Register Button', element: registerButton }
    ];
    
    let allElementsFound = true;
    registrationElements.forEach(({ name, element }) => {
      if (element) {
        console.log(`✅ ${name} field found`);
      } else {
        console.log(`❌ ${name} field missing`);
        allElementsFound = false;
      }
    });
    
    if (allElementsFound) {
      console.log('\n✅ All registration form elements are present');
    } else {
      console.log('\n❌ Some registration form elements are missing');
    }
    
    // Check for any new console errors
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console errors found during testing:');
      consoleErrors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('\n✅ No console errors during testing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testFrontendUI().catch(console.error);
