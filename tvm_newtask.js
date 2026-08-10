const {chromium} = require("playwright-core");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({headless: true, channel: "chrome"});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  const cookies = JSON.parse(fs.readFileSync("/tmp/adm-qa-cookies.json", "utf8"));
  await context.addCookies(cookies);

  const page = await context.newPage();
  
  // Go to TVM multi-dimensional drill task list
  await page.goto("https://omi-api-qa.cn.miaozhen.com/query/task/showTaskList", {waitUntil: "domcontentloaded", timeout: 15000}).catch(e => console.log("Nav:", e.message));
  await page.waitForTimeout(3000);
  console.log("URL:", page.url());
  console.log("Title:", await page.title());
  
  // Get nav and tabs
  const navItems = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a[href]")).filter(a => a.offsetParent !== null).map(a => ({
      text: a.innerText?.trim().substring(0, 40),
      href: a.getAttribute("href")?.substring(0, 80)
    })).filter(a => a.text);
  });
  console.log("\n=== NAV ===");
  navItems.forEach(n => console.log(" ", n.text, "->", n.href));
  
  // Get buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, .btn")).filter(b => b.offsetParent !== null).map(b => b.innerText?.trim().substring(0, 40)).filter(Boolean);
  });
  console.log("\n=== BUTTONS ===");
  console.log(buttons.join(", "));
  
  // Get body text
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log("\n=== BODY ===\n" + bodyText);
  
  // Click "新建任务" to go to TVM new task page
  const newTaskClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button, a"));
    for (const b of btns) {
      if (b.innerText?.trim() === "新建任务" && b.offsetParent !== null) { b.click(); return true; }
    }
    return false;
  });
  console.log("\nClicked 新建任务:", newTaskClicked);
  await page.waitForTimeout(4000);
  console.log("New task URL:", page.url());
  
  // Get the new task page content
  const newTaskBody = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("\n=== NEW TASK BODY ===\n" + newTaskBody);
  
  // Get form elements
  const formEls = await page.evaluate(() => ({
    sections: Array.from(document.querySelectorAll("h3,h4,h5,.panel-title,[class*=title]")).map(e => e.innerText?.trim().substring(0, 80)).filter(Boolean),
    radios: Array.from(document.querySelectorAll("input[type=radio]")).filter(r => r.offsetParent !== null).map(r => (r.closest("label")?.innerText || r.value || "").trim().substring(0, 40)).filter(Boolean).slice(0, 20),
    checkboxes: Array.from(document.querySelectorAll("input[type=checkbox]")).filter(c => c.offsetParent !== null).map(c => (c.closest("label")?.innerText || "").trim().substring(0, 40)).filter(Boolean).slice(0, 50),
    selects: Array.from(document.querySelectorAll("select")).filter(s => s.offsetParent !== null).map(s => s.name + ": " + Array.from(s.options).slice(0, 10).map(o => o.text.trim()).join(" / ")),
    inputs: Array.from(document.querySelectorAll("input[type=text], input[type=date]")).filter(i => i.offsetParent !== null).map(i => (i.name||i.id) + ": " + (i.placeholder || i.value?.substring(0,30) || "")),
    buttons: Array.from(document.querySelectorAll("button")).filter(b => b.offsetParent !== null).map(b => b.innerText?.trim().substring(0, 30)).filter(Boolean).slice(0, 20)
  }));
  
  console.log("\n=== SECTIONS ===\n" + formEls.sections.join("\n"));
  console.log("\n=== RADIOS ===\n" + formEls.radios.join(", "));
  console.log("\n=== CHECKBOXES ===\n" + formEls.checkboxes.join(", "));
  console.log("\n=== SELECTS ===\n" + formEls.selects.join("\n"));
  console.log("\n=== INPUTS ===\n" + formEls.inputs.join(", "));
  console.log("\n=== BUTTONS ===\n" + formEls.buttons.join(", "));
  
  // Search for sheetBy related content
  const sheetByContent = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    const keywords = ["sheetBy", "sheet_by", "sheetby", "sheetByType", "按活动", "按地域", "分sheet", "单sheet"];
    const results = [];
    keywords.forEach(kw => {
      const idx = html.toLowerCase().indexOf(kw.toLowerCase());
      if (idx >= 0) {
        results.push({keyword: kw, context: html.substring(Math.max(0, idx - 100), idx + 200).replace(/\n/g, " ").replace(/\s+/g, " ")});
      }
    });
    return results;
  });
  console.log("\n=== SHEETBY SEARCH ===");
  sheetByContent.forEach(r => console.log(`  ${r.keyword}: ${r.context}`));
  
  // Search for SIVT related content
  const sivtContent = await page.evaluate(() => {
    const html = document.documentElement.innerHTML.toLowerCase();
    const keywords = ["sivt", "givt", "分规则", "899", "sheet"];
    const results = [];
    keywords.forEach(kw => {
      const idx = html.indexOf(kw);
      if (idx >= 0) {
        results.push({keyword: kw, context: html.substring(Math.max(0, idx - 100), idx + 300).replace(/\n/g, " ").replace(/\s+/g, " ")});
      }
    });
    return results;
  });
  console.log("\n=== SIVT/SHEET SEARCH ===");
  sivtContent.forEach(r => console.log(`  ${r.keyword}: ${r.context}\n`));
  
  await page.screenshot({path: "/tmp/adm_tvm_newtask.png", fullPage: true});
  console.log("\nScreenshot saved");
  
  await browser.close();
  console.log("DONE");
})().catch(e => console.log("Error:", e.message));
