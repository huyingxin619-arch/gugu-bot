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

  // Fill TVM campaign ID
  await page.evaluate(() => {
    document.querySelectorAll('input[name="inputMethod"]').forEach(r => {
      const lbl = r.parentElement?.innerText || "";
      if (lbl.includes("输入活动ID") && !lbl.includes("区间")) r.click();
    });
  });
  await page.waitForTimeout(300);
  await page.fill("#inputCid", "4141179");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    for (const b of btns) { if (b.innerText.includes("确") && b.innerText.includes("定") && b.offsetParent !== null) { b.click(); return; } }
  });
  await page.waitForTimeout(4000);
  console.log("Step2 URL:", page.url());

  // Take screenshot of fixed template view
  await page.screenshot({path: "/tmp/tvm_fixed_template.png", fullPage: true});
  console.log("Fixed template screenshot saved");

  // Click 定制模版
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("*"));
    const el = els.find(e => e.innerText?.trim() === "定制模版");
    if (el) el.click();
  });
  await page.waitForTimeout(3000);

  // Take screenshot of custom template view
  await page.screenshot({path: "/tmp/tvm_custom_template.png", fullPage: true});
  console.log("Custom template screenshot saved");

  // Get the body text to see what changed
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log("\n=== CUSTOM TEMPLATE BODY ===\n" + bodyText);

  // Get the visible form elements in custom template
  const formEls = await page.evaluate(() => ({
    sections: Array.from(document.querySelectorAll("h3,h4,h5,.panel-title,[class*=title],.nav-tabs li")).map(e => ({
      text: e.innerText?.trim().substring(0, 60),
      active: e.className?.includes("active")
    })).filter(e => e.text),
    radios: Array.from(document.querySelectorAll("input[type=radio]")).filter(r => r.offsetParent !== null).map(r => ({
      label: (r.closest("label")?.innerText || r.closest("span")?.innerText || "").trim().substring(0, 40),
      value: r.value,
      checked: r.checked,
      name: r.name
    })).filter(r => r.label || r.name),
    checkboxes: Array.from(document.querySelectorAll("input[type=checkbox]")).filter(c => c.offsetParent !== null).map(c => ({
      label: (c.closest("label")?.innerText || "").trim().substring(0, 60),
      value: c.value?.substring(0, 30),
      name: c.name,
      checked: c.checked
    })).filter(c => c.label).slice(0, 80),
    selects: Array.from(document.querySelectorAll("select")).filter(s => s.offsetParent !== null).map(s => ({
      name: s.name,
      options: Array.from(s.options).slice(0, 8).map(o => o.text.trim())
    })),
    inputs: Array.from(document.querySelectorAll("input[type=text], input[type=date]")).filter(i => i.offsetParent !== null).map(i => ({
      name: i.name || i.id,
      placeholder: i.placeholder
    })),
    buttons: Array.from(document.querySelectorAll("button")).filter(b => b.offsetParent !== null).map(b => b.innerText?.trim().substring(0, 30)).filter(Boolean).slice(0, 20)
  }));

  console.log("\n=== SECTIONS/TABS ===");
  formEls.sections.forEach(s => console.log(" ", s.text, s.active ? "(active)" : ""));
  console.log("\n=== RADIOS ===");
  formEls.radios.forEach(r => console.log(`  ${r.name}=${r.value} | ${r.label} | ${r.checked ? "[x]" : "[ ]"}`));
  console.log("\n=== CHECKBOXES ===");
  formEls.checkboxes.forEach(c => console.log(`  ${c.name}=${c.value} | ${c.label} | ${c.checked ? "[x]" : "[ ]"}`));
  console.log("\n=== SELECTS ===");
  formEls.selects.forEach(s => console.log(`  ${s.name}: ${s.options.join(" / ")}`));
  console.log("\n=== INPUTS ===");
  formEls.inputs.forEach(i => console.log(`  ${i.name}: ${i.placeholder}`));
  console.log("\n=== BUTTONS ===");
  console.log(formEls.buttons.join(", "));

  // Also get the sheet table structure in custom template
  const sheetStructure = await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll("table")).filter(t => t.offsetParent !== null);
    return tables.map(t => ({
      class: t.className?.substring(0, 40),
      headers: Array.from(t.querySelectorAll("th")).map(th => th.innerText?.trim()),
      rowCount: t.querySelectorAll("tbody tr").length,
      firstRow: t.querySelector("tbody tr") ? Array.from(t.querySelector("tbody tr").querySelectorAll("td")).map(td => td.innerText?.trim().substring(0, 30)) : []
    }));
  });
  console.log("\n=== VISIBLE TABLES ===");
  sheetStructure.forEach((t, i) => console.log(`  Table ${i}: ${t.class} | headers: ${JSON.stringify(t.headers)} | rows: ${t.rowCount} | firstRow: ${JSON.stringify(t.firstRow)}`));

  await browser.close();
  console.log("\nDONE");
})().catch(e => console.log("Error:", e.message));
