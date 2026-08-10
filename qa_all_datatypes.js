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

  // DON'T click 定制模版 - the data-type elements might be in the fixed template view
  // Search the full HTML for all data-type attributes
  const allDataTypes = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("[data-type]"));
    return els.map(el => ({
      dataType: el.getAttribute("data-type"),
      text: el.innerText?.trim().substring(0, 60),
      visible: el.offsetParent !== null
    }));
  });
  console.log("=== ALL DATA-TYPE ELEMENTS (固定模版) ===");
  console.log("Total count:", allDataTypes.length);
  allDataTypes.forEach(d => console.log(`  ${d.dataType} | visible:${d.visible} | ${d.text}`));

  // Now click 定制模版 and check again
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("*"));
    const el = els.find(e => e.innerText?.trim() === "定制模版");
    if (el) el.click();
  });
  await page.waitForTimeout(2000);

  const allDataTypes2 = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("[data-type]"));
    return els.map(el => ({
      dataType: el.getAttribute("data-type"),
      text: el.innerText?.trim().substring(0, 60),
      visible: el.offsetParent !== null
    }));
  });
  console.log("\n=== ALL DATA-TYPE ELEMENTS (定制模版) ===");
  console.log("Total count:", allDataTypes2.length);
  allDataTypes2.forEach(d => console.log(`  ${d.dataType} | visible:${d.visible} | ${d.text}`));

  await browser.close();
  console.log("\nDONE");
})().catch(e => console.log("Error:", e.message));
