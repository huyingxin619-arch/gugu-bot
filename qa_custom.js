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

  // Fill campaign ID
  await page.evaluate(() => {
    document.querySelectorAll('input[name="inputMethod"]').forEach(r => {
      const lbl = r.parentElement?.innerText || "";
      if (lbl.includes("输入活动ID") && !lbl.includes("区间")) r.click();
    });
  });
  await page.waitForTimeout(300);
  await page.fill("#inputCid", "2507095");

  // Click 确定
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    for (const b of btns) {
      if (b.innerText.includes("确") && b.innerText.includes("定") && b.offsetParent !== null) { b.click(); return; }
    }
  });
  await page.waitForTimeout(4000);

  // Click 定制模版 radio
  const customClicked = await page.evaluate(() => {
    const radios = Array.from(document.querySelectorAll('input[type=radio], a, label'));
    for (const r of radios) {
      const text = r.innerText?.trim() || r.textContent?.trim() || "";
      if (text === "定制模版" || text === "定制模板") {
        r.click();
        return text;
      }
    }
    // Try clicking the text directly
    const el = Array.from(document.querySelectorAll("*")).find(e => e.innerText?.trim() === "定制模版" || e.innerText?.trim() === "定制模板");
    if (el) { el.click(); return el.innerText.trim(); }
    return "not found";
  });
  console.log("Custom template clicked:", customClicked);
  await page.waitForTimeout(2000);

  // Now look for "添加自定义指标"
  const customBtn = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("button, a, span, [role=button]"));
    for (const b of all) {
      const t = b.innerText?.trim() || "";
      if (t.includes("添加自定义指标") || t.includes("自定义指标") || t.includes("添加指标")) {
        return {text: t, tag: b.tagName, visible: b.offsetParent !== null};
      }
    }
    return null;
  });
  console.log("Custom index button:", JSON.stringify(customBtn));

  // Get all visible text to see what changed after clicking 定制模版
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log("\n=== BODY TEXT (after 定制模版) ===\n" + bodyText);

  // Get sections
  const sections = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h3,h4,h5,.panel-title,[class*=title],.nav-tabs li")).map(e => ({
      text: e.innerText?.trim().substring(0, 80),
      active: e.className?.includes("active")
    })).filter(e => e.text);
  });
  console.log("\n=== SECTIONS/TABS ===");
  sections.forEach(s => console.log(" ", s.text, s.active ? "(active)" : ""));

  // Click 添加自定义指标 if found
  if (customBtn) {
    await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll("button, a, span, [role=button]"));
      for (const b of all) {
        if (b.innerText?.includes("添加自定义指标") || b.innerText?.includes("自定义指标")) {
          b.click();
          return;
        }
      }
    });
    await page.waitForTimeout(2000);

    // Get modal content
    const modal = await page.evaluate(() => {
      const modals = Array.from(document.querySelectorAll(".modal, .dialog, [class*=popup], [class*=overlay]"));
      for (const m of modals) {
        if (m.offsetParent !== null && m.innerText?.trim()) {
          return m.innerText.substring(0, 3000);
        }
      }
      return "no visible modal";
    });
    console.log("\n=== MODAL CONTENT ===\n" + modal);

    // Get modal checkboxes
    const modalChecks = await page.evaluate(() => {
      const modals = Array.from(document.querySelectorAll(".modal, .dialog, [class*=popup]"));
      for (const m of modals) {
        if (m.offsetParent !== null) {
          const checks = Array.from(m.querySelectorAll("input[type=checkbox]"));
          return checks.map(c => (c.closest("label")?.innerText || c.value || "").trim()).filter(Boolean);
        }
      }
      return [];
    });
    console.log("\n=== MODAL CHECKBOXES ===\n" + modalChecks.join(", "));

    await page.screenshot({path: "/tmp/adm_qa_custom_modal.png", fullPage: false});
    console.log("Modal screenshot saved");
  }

  await page.screenshot({path: "/tmp/adm_qa_custom_template.png", fullPage: true});
  console.log("\nFull screenshot saved");
  await browser.close();
  console.log("DONE");
})().catch(e => console.log("Error:", e.message));
