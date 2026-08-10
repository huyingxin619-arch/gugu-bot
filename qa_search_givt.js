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

  // Find ALL modals on the page and their content
  const allModals = await page.evaluate(() => {
    const modals = Array.from(document.querySelectorAll(".modal"));
    return modals.map(m => ({
      id: m.id,
      class: m.className,
      visible: m.offsetParent !== null,
      title: m.querySelector(".modal-title")?.innerText?.trim() || "",
      text: m.innerText?.trim().substring(0, 500),
      hasGivt: m.innerText?.includes("GIVT") || m.innerText?.includes("givt"),
      hasSivt: m.innerText?.includes("SIVT") || m.innerText?.includes("sivt"),
      hasFilter: m.innerText?.includes("分规则") || m.innerText?.includes("过滤")
    }));
  });
  console.log("=== ALL MODALS ===");
  allModals.forEach(m => console.log(JSON.stringify(m)));

  // Also search the entire page HTML for "givt" or "sivt" or "分规则"
  const searchResults = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    const results = [];
    const keywords = ["givttotal", "sivttotal", "sivt_total", "givt_total", "GIVT", "SIVT", "分规则", "sivt_total_ka", "givttotal_imp", "sivttotal_imp", "sivttotal_basic", "sivttotal_advanced"];
    keywords.forEach(kw => {
      const idx = html.toLowerCase().indexOf(kw.toLowerCase());
      if (idx >= 0) {
        results.push({keyword: kw, position: idx, context: html.substring(Math.max(0, idx - 50), idx + 100).replace(/\n/g, " ")});
      }
    });
    return results;
  });
  console.log("\n=== KEYWORD SEARCH IN HTML ===");
  searchResults.forEach(r => console.log(r.keyword, "at", r.position, ":", r.context));

  // Check for elements with onclick containing "customIndex" or "sivt" or "givt"
  const onclickElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("[onclick]")).map(el => ({
      tag: el.tagName,
      text: el.innerText?.trim().substring(0, 40),
      onclick: el.getAttribute("onclick")?.substring(0, 100)
    })).filter(el => el.onclick && (el.onclick.includes("ivt") || el.onclick.includes("custom") || el.onclick.includes("filter") || el.onclick.includes("P&G") || el.onclick.includes("pg")));
  });
  console.log("\n=== ONCLICK ELEMENTS (filtered) ===");
  onclickElements.forEach(e => console.log(JSON.stringify(e)));

  // Look for the "P&G" button/link that opens the P&G modal
  const pgTriggers = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, a, [role=button], .btn, [data-toggle=modal]")).filter(el => {
      const t = el.innerText?.trim() || "";
      const dt = el.getAttribute("data-target") || "";
      const href = el.getAttribute("href") || "";
      return t.includes("P&G") || t.includes("PG") || dt.includes("pg") || dt.includes("PG") || href.includes("pg");
    }).map(el => ({
      tag: el.tagName,
      text: el.innerText?.trim().substring(0, 40),
      dataTarget: el.getAttribute("data-target"),
      dataToggle: el.getAttribute("data-toggle"),
      onclick: el.getAttribute("onclick")?.substring(0, 100),
      href: el.getAttribute("href"),
      visible: el.offsetParent !== null
    }));
  });
  console.log("\n=== P&G TRIGGERS ===");
  pgTriggers.forEach(e => console.log(JSON.stringify(e)));

  await browser.close();
  console.log("\nDONE");
})().catch(e => console.log("Error:", e.message));
