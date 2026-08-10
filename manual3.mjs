const {chromium} = require("playwright-core");
const fs = require("fs");
const browser = await chromium.launch({headless: false, channel: "chrome", args: ["--disable-extensions", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"]});
const context = await browser.newContext({viewport: {width: 1280, height: 800}});
const cookies = JSON.parse(fs.readFileSync("/tmp/adm-qa-cookies.json", "utf8"));
await context.addCookies(cookies);
const page = await context.newPage();
await page.goto("https://omi-api-qa.cn.miaozhen.com/query/task/showNewTask?type=normal#newTask", {waitUntil: "domcontentloaded", timeout: 15000});
await page.waitForTimeout(1500);
await page.evaluate(() => {
  document.querySelectorAll('input[name="inputMethod"]').forEach(r => {
    const lbl = r.parentElement?.innerText || "";
    if (lbl.includes("输入活动ID") && !lbl.includes("区间")) r.click();
  });
});
await page.waitForTimeout(200);
await page.fill("#inputCid", "4141179");
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  for (const b of btns) { if (b.innerText.includes("确") && b.innerText.includes("定") && b.offsetParent !== null) { b.click(); return; } }
});
await page.waitForTimeout(4000);
console.log("URL:", page.url());
console.log("READY - staying open");
// Keep alive
setInterval(() => {}, 1000);
