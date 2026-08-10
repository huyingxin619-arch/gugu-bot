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

  // Find the modal that contains "添加自定义指标" as title, and find its trigger
  const modalInfo = await page.evaluate(() => {
    const modalTitle = Array.from(document.querySelectorAll(".modal-title")).find(e => e.innerText.includes("添加自定义指标"));
    if (!modalTitle) return {found: false};
    
    const modal = modalTitle.closest(".modal");
    const modalId = modal?.id || "";
    const modalClass = modal?.className || "";
    
    // Find elements that reference this modal (data-toggle, data-target, href)
    const triggers = Array.from(document.querySelectorAll("[data-toggle=modal], [data-target], a[href*='#']")).map(t => ({
      tag: t.tagName,
      text: t.innerText?.trim().substring(0, 40),
      target: t.getAttribute("data-target") || t.getAttribute("href") || "",
      toggle: t.getAttribute("data-toggle") || "",
      visible: t.offsetParent !== null
    })).filter(t => t.target.includes(modalId) || (t.text && t.text.includes("自定义")));
    
    return {found: true, modalId, modalClass, triggers};
  });
  console.log("Modal info:", JSON.stringify(modalInfo, null, 2));

  // Also look for buttons/links with "自定义" text that are visible
  const customElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, a, [role=button], [onclick], .btn")).filter(el => {
      const t = el.innerText?.trim() || "";
      return t.includes("自定义") && t !== "添加自定义指标" && el.offsetParent !== null;
    }).map(el => ({
      tag: el.tagName,
      text: el.innerText?.trim().substring(0, 50),
      onclick: el.getAttribute("onclick") || "",
      dataTarget: el.getAttribute("data-target") || "",
      dataToggle: el.getAttribute("data-toggle") || "",
      href: el.getAttribute("href") || "",
      class: el.className?.substring(0, 60)
    }));
  });
  console.log("\nVisible elements with '自定义':", JSON.stringify(customElements, null, 2));

  // Look for "+" or "添加" buttons near the custom index area
  const addButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, a, .btn, [role=button]")).filter(el => {
      const t = el.innerText?.trim() || "";
      return (t.includes("添加") || t.includes("自定义") || t === "+") && el.offsetParent !== null;
    }).map(el => ({
      tag: el.tagName,
      text: el.innerText?.trim().substring(0, 50),
      onclick: el.getAttribute("onclick") || "",
      class: el.className?.substring(0, 60),
      html: el.outerHTML.substring(0, 200)
    }));
  });
  console.log("\nAdd/custom buttons:", JSON.stringify(addButtons, null, 2));

  // Try to find the P&G section and its trigger
  const pgSection = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("*"));
    const pg = els.find(e => e.innerText?.trim() === "P&G");
    if (!pg) return null;
    return {
      tag: pg.tagName,
      class: pg.className,
      html: pg.outerHTML.substring(0, 300),
      parentHtml: pg.parentElement?.outerHTML.substring(0, 300)
    };
  });
  console.log("\nP&G section:", JSON.stringify(pgSection, null, 2));

  // Get the full HTML around "添加自定义指标" modal
  const modalHtml = await page.evaluate(() => {
    const modal = document.querySelector("#customIndexModal, #addCustomIndexModal, .modal:has(.modal-title:has-text(添加自定义指标))");
    if (!modal) {
      // Search by text
      const title = Array.from(document.querySelectorAll(".modal-title")).find(e => e.innerText.includes("添加自定义指标"));
      if (title) {
        const m = title.closest(".modal");
        return m ? m.outerHTML.substring(0, 1000) : "modal not found";
      }
      return "no modal found";
    }
    return modal.outerHTML.substring(0, 1000);
  });
  console.log("\nModal HTML:", modalHtml);

  await browser.close();
  console.log("\nDONE");
})().catch(e => console.log("Error:", e.message));
