const {chromium} = require("playwright-core");
const fs = require("fs");

(async () => {
  // Step 1: headed login to pass captcha, save cookies
  const browser = await chromium.launch({headless: false, channel: "chrome"});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  const page = await context.newPage();

  await page.goto("https://omi-api-qa.cn.miaozhen.com", {waitUntil: "networkidle", timeout: 15000});
  await page.fill("#username", "AI专用账号");
  await page.fill("#password", "6zNfF969S");
  const privacy = await page.locator("#privacy");
  if (await privacy.isVisible()) await privacy.check();
  await page.click("#submit");
  console.log("Waiting for captcha... please solve it");

  for (let i = 0; i < 120; i++) {
    await page.waitForTimeout(2000);
    const title = await page.title();
    if (title !== "Admonitor | 登录") {
      const cookies = await context.cookies();
      fs.writeFileSync("/tmp/adm-qa-cookies.json", JSON.stringify(cookies));
      console.log("Login OK! Cookies saved:", cookies.length);
      console.log("URL:", page.url());
      await browser.close();
      return;
    }
    if (i % 5 === 0) console.log("Waiting... (" + (i*2) + "s)");
  }
  console.log("TIMEOUT");
  await browser.close();
})().catch(e => console.log("Error:", e.message));
