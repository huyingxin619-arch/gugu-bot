const {chromium} = require("playwright-core");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({headless: true, channel: "chrome"});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  const cookies = JSON.parse(fs.readFileSync("/tmp/adm-qa-cookies.json", "utf8"));
  await context.addCookies(cookies);

  const page = await context.newPage();
  
  // Go to TVM task list
  await page.goto("https://omi-api-qa.cn.miaozhen.com/tvMonitor", {waitUntil: "domcontentloaded", timeout: 15000}).catch(e => console.log("Nav:", e.message));
  await page.waitForTimeout(3000);
  console.log("URL:", page.url());
  console.log("Title:", await page.title());
  
  // Get page content
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log("\n=== BODY TEXT ===\n" + bodyText);
  
  // Get nav items
  const navItems = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a[href]")).filter(a => a.offsetParent !== null).map(a => ({
      text: a.innerText?.trim().substring(0, 40),
      href: a.getAttribute("href")?.substring(0, 80)
    })).filter(a => a.text);
  });
  console.log("\n=== NAV ITEMS ===");
  navItems.forEach(n => console.log(" ", n.text, "->", n.href));
  
  // Look for "新建任务" button
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, .btn, [role=button]")).filter(b => b.offsetParent !== null).map(b => b.innerText?.trim().substring(0, 40)).filter(Boolean);
  });
  console.log("\n=== BUTTONS ===");
  console.log(buttons.join(", "));
  
  // Get table headers if there's a task list
  const tableInfo = await page.evaluate(() => {
    const tables = document.querySelectorAll("table");
    if (tables.length === 0) return "no tables";
    const first = tables[0];
    const headers = Array.from(first.querySelectorAll("th")).map(th => th.innerText?.trim());
    const rows = first.querySelectorAll("tbody tr").length;
    return {headers, rows};
  });
  console.log("\n=== TABLE ===");
  console.log(JSON.stringify(tableInfo));
  
  await page.screenshot({path: "/tmp/adm_tvm_home.png", fullPage: true});
  console.log("\nScreenshot saved");
  
  await browser.close();
  console.log("DONE");
})().catch(e => console.log("Error:", e.message));
