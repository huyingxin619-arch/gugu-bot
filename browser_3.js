const {chromium} = require("playwright-core");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({headless: false, channel: "chrome"});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  const cookies = JSON.parse(fs.readFileSync("/tmp/adm-qa-cookies.json", "utf8"));
  await context.addCookies(cookies);
  const page = await context.newPage();
  
  // Go to new task page and wait longer
  await page.goto("https://omi-api-qa.cn.miaozhen.com/query/task/showNewTask?type=normal#newTask", {waitUntil: "domcontentloaded", timeout: 15000});
  console.log("Page loaded, waiting 3s for JS to render...");
  await page.waitForTimeout(3000);
  
  // Wait for the radio button to be visible
  await page.waitForSelector('input[name="inputMethod"]', {timeout: 5000});
  console.log("Radio buttons found");
  
  // Select 输入活动ID radio
  const radios = await page.locator('input[name="inputMethod"]');
  const count = await radios.count();
  console.log("Found", count, "radio buttons");
  
  for (let i = 0; i < count; i++) {
    const labelText = await radios.nth(i).evaluate(r => r.parentElement?.innerText || "");
    console.log("  Radio", i, ":", labelText.trim());
    if (labelText.includes("输入活动ID") && !labelText.includes("区间")) {
      await radios.nth(i).click();
      console.log("  Clicked radio", i);
      break;
    }
  }
  
  await page.waitForTimeout(500);
  
  // Wait for inputCid to be visible
  await page.waitForSelector("#inputCid", {timeout: 5000, state: "visible"});
  await page.fill("#inputCid", "2507095");
  console.log("Filled campaign ID: 2507095");
  
  // Verify it was filled
  const val = await page.inputValue("#inputCid");
  console.log("Verified input value:", val);
  
  // Click 确定
  await page.locator("button:has-text(\"确定\")").click().catch(() => {
    // Fallback
    page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      for (const b of btns) { if (b.innerText.includes("确") && b.innerText.includes("定") && b.offsetParent !== null) { b.click(); return; } }
    });
  });
  console.log("Clicked 确定");
  await page.waitForTimeout(5000);
  console.log("URL:", page.url());
  console.log("READY - waiting for instructions");
  setInterval(() => {}, 10000);
})().catch(e => console.log("Error:", e.message));
