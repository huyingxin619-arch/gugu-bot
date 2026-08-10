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

  // Use playwright locator to find and click "添加自定义指标"
  const locator = page.locator("text=添加自定义指标");
  const count = await locator.count();
  console.log("Found", count, "elements with text '添加自定义指标'");
  
  if (count > 0) {
    // Get info about each matching element
    for (let i = 0; i < count; i++) {
      const info = await locator.nth(i).evaluate(el => ({
        tag: el.tagName,
        class: el.className,
        text: el.innerText.trim().substring(0, 50),
        html: el.outerHTML.substring(0, 200),
        visible: el.offsetParent !== null
      }));
      console.log("Element", i, ":", JSON.stringify(info));
    }
    
    // Click the first visible one
    for (let i = 0; i < count; i++) {
      const visible = await locator.nth(i).isVisible();
      if (visible) {
        await locator.nth(i).click();
        console.log("Clicked element", i);
        break;
      }
    }
    await page.waitForTimeout(2000);
    
    // Get popup/modal content
    const modalText = await page.evaluate(() => {
      const modals = Array.from(document.querySelectorAll(".modal, .dialog, [class*=popup], [class*=dropdown]"));
      for (const m of modals) {
        if (m.offsetParent !== null && m.innerText?.trim().length > 20) {
          return m.innerText.substring(0, 2000);
        }
      }
      // Check for any newly appeared content
      return null;
    });
    
    if (modalText) {
      console.log("\n=== POPUP/MODAL ===\n" + modalText);
      
      // Get checkboxes in popup
      const popupChecks = await page.evaluate(() => {
        const modals = Array.from(document.querySelectorAll(".modal, .dialog, [class*=popup]"));
        for (const m of modals) {
          if (m.offsetParent !== null) {
            return Array.from(m.querySelectorAll("input[type=checkbox], label")).map(c => c.innerText?.trim() || c.value || "").filter(Boolean).slice(0, 50);
          }
        }
        return [];
      });
      console.log("\n=== POPUP CHECKBOXES ===\n" + popupChecks.join(", "));
    } else {
      console.log("\nNo modal appeared. Checking page for changes...");
      const bodyText = await page.evaluate(() => document.body.innerText);
      const idx = bodyText.indexOf("GIVT");
      if (idx >= 0) {
        console.log("Found GIVT at position", idx);
        console.log(bodyText.substring(Math.max(0, idx - 200), idx + 1000));
      } else {
        console.log("No GIVT text found. Looking for SIVT...");
        const sidx = bodyText.indexOf("SIVT");
        if (sidx >= 0) {
          console.log(bodyText.substring(Math.max(0, sidx - 200), sidx + 1000));
        } else {
          // Just show the area around 添加自定义指标
          const aidx = bodyText.indexOf("添加自定义指标");
          if (aidx >= 0) {
            console.log("Context around 添加自定义指标:");
            console.log(bodyText.substring(Math.max(0, aidx - 300), aidx + 500));
          }
        }
      }
    }
    
    await page.screenshot({path: "/tmp/adm_qa_after_custom.png", fullPage: false});
    console.log("\nScreenshot saved");
  }

  await browser.close();
  console.log("DONE");
})().catch(e => console.log("Error:", e.message));
