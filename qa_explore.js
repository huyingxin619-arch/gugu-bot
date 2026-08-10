const {chromium} = require("playwright-core");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({headless: true, channel: "chrome"});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  const cookies = JSON.parse(fs.readFileSync("/tmp/adm-qa-cookies.json", "utf8"));
  await context.addCookies(cookies);

  const page = await context.newPage();
  
  // Go to new task page
  await page.goto("https://omi-api-qa.cn.miaozhen.com/query/task/showNewTask?type=normal#newTask", {waitUntil: "domcontentloaded", timeout: 15000});
  await page.waitForTimeout(2000);
  console.log("URL:", page.url());

  // Click 输入活动ID radio
  await page.evaluate(() => {
    document.querySelectorAll('input[name="inputMethod"]').forEach(r => {
      const lbl = r.parentElement?.innerText || "";
      if (lbl.includes("输入活动ID") && !lbl.includes("区间")) r.click();
    });
  });
  await page.waitForTimeout(300);
  await page.fill("#inputCid", "2507095");
  console.log("Campaign ID filled: 2507095");

  // Click 确定
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    for (const b of btns) {
      if (b.innerText.includes("确") && b.innerText.includes("定") && b.offsetParent !== null) { b.click(); return; }
    }
  });
  await page.waitForTimeout(5000);
  console.log("Step2 URL:", page.url());

  // Get full page content
  const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log("\n=== BODY TEXT ===\n" + text);

  const els = await page.evaluate(() => ({
    sections: Array.from(document.querySelectorAll("h3,h4,h5,.panel-title,[class*=title]")).map(e => e.innerText.trim()).filter(Boolean),
    selects: Array.from(document.querySelectorAll("select")).map(s => s.name + ": " + Array.from(s.options).slice(0, 8).map(o => o.text.trim()).join(" / ")),
    checkboxes: Array.from(document.querySelectorAll("input[type=checkbox]")).map(c => (c.closest("label")?.innerText || "").trim()).filter(Boolean).slice(0, 60),
    radios: Array.from(document.querySelectorAll("input[type=radio]")).map(r => (r.closest("label")?.innerText || "").trim()).filter(Boolean).slice(0, 20),
    buttons: Array.from(document.querySelectorAll("button")).filter(b => b.offsetParent !== null).map(b => b.innerText.trim()).filter(Boolean).slice(0, 20),
    links: Array.from(document.querySelectorAll("a[href]")).filter(a => a.offsetParent !== null).map(a => a.innerText.trim().substring(0, 30) + " -> " + a.getAttribute("href")).filter(a => a !== " -> ").slice(0, 15)
  }));

  console.log("\n=== SECTIONS ===\n" + els.sections.join("\n"));
  console.log("\n=== SELECTS ===\n" + els.selects.join("\n"));
  console.log("\n=== CHECKBOXES ===\n" + els.checkboxes.join(", "));
  console.log("\n=== RADIOS ===\n" + els.radios.join(", "));
  console.log("\n=== BUTTONS ===\n" + els.buttons.join(", "));
  console.log("\n=== LINKS ===\n" + els.links.join("\n"));

  await page.screenshot({path: "/tmp/adm_qa_step2.png", fullPage: true});
  console.log("\nScreenshot saved");

  // Now try clicking "添加自定义指标" to see custom index options
  const customBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button, a, [role=button]"));
    for (const b of btns) {
      if (b.innerText.includes("添加自定义指标") || b.innerText.includes("自定义指标")) {
        b.click();
        return b.innerText.trim();
      }
    }
    return "not found";
  });
  console.log("\nCustom index button:", customBtn);
  
  if (customBtn !== "not found") {
    await page.waitForTimeout(2000);
    
    const modalContent = await page.evaluate(() => {
      const modal = document.querySelector(".modal:not([style*=hidden]):not([style*=display:none]), .dialog:not([style*=hidden]), [class*=popup]:not([style*=hidden])");
      if (modal) return modal.innerText.substring(0, 2000);
      // Try any visible overlay
      const overlay = document.querySelector(".modal.in, .modal.show, [class*=overlay]:not([style*=hidden])");
      return overlay ? overlay.innerText.substring(0, 2000) : "no modal found";
    });
    console.log("\n=== CUSTOM INDEX MODAL ===\n" + modalContent);
    
    // Get checkboxes in the modal
    const modalChecks = await page.evaluate(() => {
      const modal = document.querySelector(".modal:not([style*=hidden]):not([style*=display:none]), .modal.in, .modal.show");
      if (!modal) return [];
      return Array.from(modal.querySelectorAll("input[type=checkbox]")).map(c => (c.closest("label")?.innerText || c.value || "").trim()).filter(Boolean);
    });
    console.log("\n=== MODAL CHECKBOXES ===\n" + modalChecks.join(", "));
    
    await page.screenshot({path: "/tmp/adm_qa_custom_modal.png", fullPage: false});
    console.log("Modal screenshot saved");
  }

  await browser.close();
  console.log("\nDONE");
})().catch(e => console.log("Error:", e.message));
