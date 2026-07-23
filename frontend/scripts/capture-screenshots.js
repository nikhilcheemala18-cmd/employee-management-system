const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const viewport = { width: 1366, height: 900 };
const baseUrl = 'http://localhost:3000';

async function waitForText(page, selector, text) {
  await page.waitForFunction(
    (selector, text) => {
      const el = document.querySelector(selector);
      return el && el.innerText.includes(text);
    },
    {},
    selector,
    text
  );
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport(viewport);

  const screenshotElement = async (selector, fallbackSelector, pathName) => {
    const element = await page.$(selector) || await page.$(fallbackSelector);
    if (!element) {
      throw new Error(`Unable to find element for screenshot: ${selector} or ${fallbackSelector}`);
    }
    await element.screenshot({ path: path.join(outputDir, pathName) });
  };

  console.log('Capturing owner dashboard');
  await page.goto(`${baseUrl}/ownerLogin`, { waitUntil: 'domcontentloaded' });
  await page.type('#id', 'OWN-HYD-001');
  await page.type('#password', 'Password@123');
  await page.click('button[type=submit]');
  await waitForText(page, 'h3', 'Owner Dashboard');
  await screenshotElement('.app-shell', 'main', 'owner-dashboard.png');

  console.log('Capturing employee management');
  await page.goto(`${baseUrl}/employeeDetails`, { waitUntil: 'domcontentloaded' });
  await waitForText(page, 'h3', 'Employee Details');
  await screenshotElement('.table-shell', '.dashboard-table-wrap', 'employee-management.png');

  console.log('Capturing payroll');
  await page.goto(`${baseUrl}/employeeSalaryDetails`, { waitUntil: 'domcontentloaded' });
  await waitForText(page, 'h3', 'Employee Salary Details');
  await screenshotElement('.page-card', 'main', 'payroll.png');

  console.log('Capturing analytics');
  await page.goto(`${baseUrl}/ownerHome`, { waitUntil: 'domcontentloaded' });
  await waitForText(page, 'h3', 'Owner Dashboard');
  await screenshotElement('.dashboard-grid--primary', '.app-shell', 'analytics.png');

  console.log('Capturing operator dashboard');
  await page.goto(`${baseUrl}/operatorLogin`, { waitUntil: 'domcontentloaded' });
  await page.type('#id', 'EMP1012');
  await page.type('#password', 'Password@123');
  await page.click('button[type=submit]');
  await waitForText(page, 'h3', 'Operator Dashboard');
  await screenshotElement('.app-shell', 'main', 'operator-dashboard.png');

  console.log('Capturing attendance');
  const attendanceTab = await page.$x("//button[contains(., 'Employee Attendance') or contains(., 'Attendance')] ");
  if (attendanceTab.length) {
    await attendanceTab[0].click();
    await page.waitForTimeout(1500);
  }
  await waitForText(page, 'h3', 'Employee Attendance');
  await screenshotElement('.attendance-table-shell', '.app-shell', 'attendance.png');

  console.log('Capturing admin dashboard');
  await page.goto(`${baseUrl}/adminLogin`, { waitUntil: 'domcontentloaded' });
  await page.type('#adminId', 'admin');
  await page.type('#password', 'admin@123');
  await page.click('button[type=submit]');
  await waitForText(page, 'h3', 'Admin Dashboard');
  await screenshotElement('.app-shell', 'main', 'admin-dashboard.png');

  await browser.close();
  console.log('Screenshots saved:', outputDir);
})();
