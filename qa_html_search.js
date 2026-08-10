const {chromium} = require("playwright-core");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({headless: true, channel: "chrome"});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  const cookies = JSON.parse(fs.readFileSync("/tmp/adm-qa-cookies.json", "utf8"));
  await context.addCookies(cookies);

  const page = await context.newPage();
  await page.goto("https://omi-api-qa.cn.miaozhen.com/query/task/showNewTask?type=normal#newTask", {waitUntil: "domcontentloaded", timeout: 15000});
  await page.waitForTimeout(2000);

  // Fill campaign ID and proceed
  await page.evaluate(() => {
    document.querySelectorAll('input[name="inputMethod"]').forEach(r => {
      const lbl = r.parentElement?.innerText || "";
      if (lbl.includes("输入活动ID") && !lbl.includes("区间")) r.click();
    });
  });
  await page.waitForTimeout(300);
  await page.fill("#inputCid", "2507095");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    for (const b of btns) { if (b.innerText.includes("确") && b.innerText.includes("定") && b.offsetParent !== null) { b.click(); return; } }
  });
  await page.waitForTimeout(4000);

  // Click 定制模版
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("*"));
    const el = els.find(e => e.innerText?.trim() === "定制模版");
    if (el) el.click();
  });
  await page.waitForTimeout(2000);

  // Search the full page HTML for givttotal_imp context
  const givtContext = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    const idx = html.indexOf("givttotal_imp");
    if (idx < 0) return "not found";
    return html.substring(Math.max(0, idx - 500), idx + 1500);
  });
  console.log("=== GIVT CONTEXT ===");
  console.log(givtContext);

  // Also get all unique data-type values in the full HTML
  const allDataTypesInHTML = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    const regex = /data-type="([^"]+)"/g;
    const matches = [];
    let m;
    while ((m = regex.exec(html)) !== null) {
      if (!matches.includes(m[1])) matches.push(m[1]);
    }
    return matches;
  });
  console.log("\n=== ALL UNIQUE data-type VALUES IN HTML ===");
  allDataTypesInHTML.forEach(dt => console.log(" ", dt));

  await browser.close();
  console.log("\nDONE");
})().catch(e => console.log("Error:", e.message));
