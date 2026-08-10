const {chromium} = require("playwright-core");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({headless: true, channel: "chrome"});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  const cookies = JSON.parse(fs.readFileSync("/tmp/adm-qa-cookies.json", "utf8"));
  await context.addCookies(cookies);

  const page = await context.newPage();
  
  // First go to TVM dashboard to find a TVM campaign
  await page.goto("https://tvmonitor-qa.cn.miaozhen.com/dtv/dataInsight#campaignList", {waitUntil: "domcontentloaded", timeout: 15000}).catch(e => console.log("Nav:", e.message));
  await page.waitForTimeout(3000);
  
  // Now go to the multi-drill new task page - but this time from TVM context
  // Actually let me check: the multi-drill task list shows tasks with both ADM and TVM
  // The "新建任务" button goes to showNewTask?type=normal
  // Let me check if there's a TVM-specific new task URL
  
  // Go to new task page
  await page.goto("https://omi-api-qa.cn.miaozhen.com/query/task/showNewTask?type=normal#newTask", {waitUntil: "domcontentloaded", timeout: 15000});
  await page.waitForTimeout(2000);
  
  // Fill a TVM campaign ID (4141179 = TEST_TVM_LIN00_20260729)
  await page.evaluate(() => {
    document.querySelectorAll('input[name="inputMethod"]').forEach(r => {
      const lbl = r.parentElement?.innerText || "";
      if (lbl.includes("输入活动ID") && !lbl.includes("区间")) r.click();
    });
  });
  await page.waitForTimeout(300);
  await page.fill("#inputCid", "4141179");
  console.log("TVM Campaign ID filled: 4141179");
  
  // Click 确定
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    for (const b of btns) { if (b.innerText.includes("确") && b.innerText.includes("定") && b.offsetParent !== null) { b.click(); return; } }
  });
  await page.waitForTimeout(5000);
  console.log("Step2 URL:", page.url());
  
  // Get page content
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("\n=== BODY TEXT ===\n" + bodyText);
  
  // Get form elements
  const formEls = await page.evaluate(() => ({
    sections: Array.from(document.querySelectorAll("h3,h4,h5,.panel-title,[class*=title]")).map(e => e.innerText?.trim().substring(0, 80)).filter(Boolean),
    radios: Array.from(document.querySelectorAll("input[type=radio]")).filter(r => r.offsetParent !== null).map(r => (r.closest("label")?.innerText || r.value || "").trim().substring(0, 40)).filter(Boolean).slice(0, 30),
    checkboxes: Array.from(document.querySelectorAll("input[type=checkbox]")).filter(c => c.offsetParent !== null).map(c => (c.closest("label")?.innerText || c.value || "").trim().substring(0, 60)).filter(Boolean).slice(0, 80),
    selects: Array.from(document.querySelectorAll("select")).filter(s => s.offsetParent !== null).map(s => s.name + ": " + Array.from(s.options).slice(0, 10).map(o => o.text.trim()).join(" / ")),
    buttons: Array.from(document.querySelectorAll("button")).filter(b => b.offsetParent !== null).map(b => b.innerText?.trim().substring(0, 30)).filter(Boolean).slice(0, 20)
  }));
  
  console.log("\n=== SECTIONS ===\n" + formEls.sections.join("\n"));
  console.log("\n=== RADIOS ===\n" + formEls.radios.join(", "));
  console.log("\n=== CHECKBOXES ===\n" + formEls.checkboxes.join(", "));
  console.log("\n=== SELECTS ===\n" + formEls.selects.join("\n"));
  console.log("\n=== BUTTONS ===\n" + formEls.buttons.join(", "));
  
  // Search for sheetBy in HTML
  const sheetBySearch = await page.evaluate(() => {
    const html = document.documentElement.innerHTML.toLowerCase();
    const keywords = ["sheetby", "sheet_by", "分sheet", "单sheet", "按活动分", "按地域分"];
    const results = [];
    keywords.forEach(kw => {
      const idx = html.indexOf(kw);
      if (idx >= 0) {
        results.push({keyword: kw, context: document.documentElement.innerHTML.substring(Math.max(0, idx - 200), idx + 300).replace(/\n/g, " ").replace(/\s+/g, " ")});
      }
    });
    return results;
  });
  console.log("\n=== SHEETBY SEARCH ===");
  if (sheetBySearch.length === 0) console.log("  No sheetBy related content found");
  sheetBySearch.forEach(r => console.log(`  ${r.keyword}: ${r.context}\n`));
  
  // Search for all data-type attributes
  const allDataTypes = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    const regex = /data-type="([^"]+)"/g;
    const matches = new Set();
    let m;
    while ((m = regex.exec(html)) !== null) {
      matches.add(m[1]);
    }
    return Array.from(matches);
  });
  console.log("\n=== ALL DATA-TYPES ===");
  console.log(allDataTypes.join(", "));
  
  await page.screenshot({path: "/tmp/adm_tvm_step2.png", fullPage: true});
  console.log("\nScreenshot saved");
  
  await browser.close();
  console.log("DONE");
})().catch(e => console.log("Error:", e.message));
