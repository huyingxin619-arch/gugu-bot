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

  // Extract all elements with data-type attribute containing ivt or total
  const dataTypes = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("[data-type]"));
    return els.map(el => ({
      dataType: el.getAttribute("data-type"),
      text: el.innerText?.trim().substring(0, 80),
      tag: el.tagName,
      visible: el.offsetParent !== null,
      hasCheckbox: !!el.querySelector("input[type=checkbox]"),
      checked: el.querySelector("input[type=checkbox]")?.checked || false
    })).filter(el => el.dataType.includes("ivt") || el.dataType.includes("total") || el.dataType.includes("ka"));
  });
  console.log("=== DATA-TYPE ELEMENTS (IVT/Total/KA) ===");
  dataTypes.forEach(d => console.log(`  ${d.dataType} | visible:${d.visible} | checked:${d.checked} | text: ${d.text}`));

  // Also get the full context around these elements
  const sectionContext = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("[data-type]"));
    const filtered = els.filter(el => {
      const dt = el.getAttribute("data-type") || "";
      return dt.includes("ivt") || dt.includes("total") || dt.includes("ka");
    });
    
    // Get the parent container structure
    if (filtered.length === 0) return "no elements";
    
    // Get the common parent
    let parent = filtered[0].parentElement;
    while (parent && filtered.filter(f => parent.contains(f)).length < filtered.length) {
      parent = parent.parentElement;
    }
    
    if (parent) {
      // Get the section header/text above this parent
      const sectionText = parent.parentElement?.innerText?.substring(0, 2000) || "";
      return sectionText;
    }
    return "parent not found";
  });
  console.log("\n=== SECTION CONTEXT ===");
  console.log(sectionContext.substring(0, 2000));

  await browser.close();
  console.log("\nDONE");
})().catch(e => console.log("Error:", e.message));
