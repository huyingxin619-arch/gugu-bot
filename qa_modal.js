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

  // Find and click "添加自定义指标" - it might be an <a> or <span> or <li>
  const found = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("a, span, li, div, button, [role=button], [onclick]"));
    for (const el of all) {
      const t = el.innerText?.trim() || "";
      if (t === "添加自定义指标") {
        console.log("Found:", el.tagName, el.className);
        el.click();
        return el.tagName + " | " + el.className;
      }
    }
    return "not found";
  });
  console.log("Found custom index element:", found);
  await page.waitForTimeout(2000);

  // Get modal/popup content
  const modal = await page.evaluate(() => {
    // Check for any newly visible overlay/popup
    const overlays = Array.from(document.querySelectorAll(".modal, .dialog, .popover, .dropdown-menu, [class*=popup], [class*=overlay], [class*=panel]"));
    const visible = overlays.filter(o => o.offsetParent !== null && o.innerText?.trim().length > 10);
    if (visible.length > 0) {
      return visible.map(o => ({class: o.className.substring(0, 60), text: o.innerText.substring(0, 1500)}));
    }
    
    // Maybe it's a select dropdown or inline form
    const bodyText = document.body.innerText;
    const idx = bodyText.indexOf("自定义指标");
    if (idx >= 0) {
      return [{class: "body-context", text: bodyText.substring(Math.max(0, idx-100), idx + 1500)}];
    }
    return [];
  });
  console.log("\n=== MODAL/OVERLAY ===");
  modal.forEach(m => console.log("Class:", m.class, "\nText:", m.text, "\n---"));

  // Also check for checkboxes that might have appeared
  const newChecks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("input[type=checkbox]")).filter(c => c.offsetParent !== null).map(c => ({
      label: (c.closest("label")?.innerText || c.value || "").trim().substring(0, 60),
      name: c.name || c.id,
      checked: c.checked
    })).filter(c => c.label);
  });
  console.log("\n=== VISIBLE CHECKBOXES ===");
  newChecks.forEach(c => console.log(" ", c.label, c.checked ? "[x]" : "[ ]"));

  await page.screenshot({path: "/tmp/adm_qa_custom_index.png", fullPage: true});
  console.log("\nScreenshot saved");
  await browser.close();
  console.log("DONE");
})().catch(e => console.log("Error:", e.message));
