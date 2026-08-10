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

  // Get the customIndexDialog modal HTML
  const modalHtml = await page.evaluate(() => {
    const modal = document.querySelector("#customIndexDialog");
    if (!modal) return "modal #customIndexDialog not found";
    return modal.innerHTML;
  });
  console.log("=== customIndexDialog HTML ===");
  console.log(modalHtml.substring(0, 5000));

  // Also try to force-show the modal and capture its content
  await page.evaluate(() => {
    const modal = document.querySelector("#customIndexDialog");
    if (modal) {
      modal.style.display = "block";
      modal.classList.add("in");
    }
  });
  await page.waitForTimeout(500);

  const modalContent = await page.evaluate(() => {
    const modal = document.querySelector("#customIndexDialog");
    if (!modal) return "not found";
    return modal.innerText.substring(0, 3000);
  });
  console.log("\n=== MODAL TEXT CONTENT ===");
  console.log(modalContent);

  // Get checkboxes/radios in the modal
  const modalInputs = await page.evaluate(() => {
    const modal = document.querySelector("#customIndexDialog");
    if (!modal) return [];
    return Array.from(modal.querySelectorAll("input[type=checkbox], input[type=radio], select, button, label")).map(el => ({
      tag: el.tagName,
      type: el.type || "",
      name: el.name || el.id || "",
      label: el.closest("label")?.innerText?.trim().substring(0, 60) || el.innerText?.trim().substring(0, 60) || "",
      value: el.value?.substring(0, 30) || "",
      text: el.tagName === "BUTTON" ? el.innerText.trim() : ""
    })).filter(el => el.label || el.value || el.text);
  });
  console.log("\n=== MODAL INPUTS ===");
  modalInputs.forEach(i => console.log(" ", i.tag, i.type, i.name, "|", i.label || i.text, "|", i.value));

  await page.screenshot({path: "/tmp/adm_qa_modal_forced.png", fullPage: false});
  console.log("\nScreenshot saved");
  await browser.close();
  console.log("DONE");
})().catch(e => console.log("Error:", e.message));
