/**
 * 从当前打开的浏览器页面抓取指标信息
 * 假设小胡已经手动导航到了指标选择页
 */
const { chromium } = require('playwright');

(async () => {
  // 连接到已打开的浏览器 — 用 CDP
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  
  const contexts = browser.contexts();
  const pages = contexts[0]?.pages() || [];
  const page = pages[pages.length - 1] || await contexts[0].newPage();
  
  console.log('当前URL:', page.url());
  console.log('当前标题:', await page.title());
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log('页面文本:', text.substring(0, 1500));
  
  // 抓所有checkbox/radio
  const controls = await page.evaluate(() => {
    const els = document.querySelectorAll('input[type="checkbox"], input[type="radio"], select, .checkbox, .radio');
    return Array.from(els).map(el => {
      const label = el.closest('label, .checkbox, .radio, .form-group, td, th, li');
      return {
        tag: el.tagName,
        type: el.type,
        id: el.id,
        name: el.name,
        value: el.value,
        label: label?.innerText?.trim()?.substring(0, 100),
        checked: el.checked,
        disabled: el.disabled
      };
    }).filter(e => e.label);
  });
  console.log('控件:', JSON.stringify(controls.slice(0, 80), null, 2));
  
  // 找 IVT/sivt/givt 相关
  const ivtItems = await page.evaluate(() => {
    const keywords = ['givttotal', 'sivttotal', 'givt', 'sivt', 'GIVT', 'SIVT', 'IVT', '分规则', 'sheet', '分sheet', '分表', '按活动', '按地域'];
    const matches = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent.trim();
      if (text.length < 100) {
        for (const kw of keywords) {
          if (text.toLowerCase().includes(kw.toLowerCase())) {
            const parent = walker.currentNode.parentElement;
            matches.push({ text, tag: parent?.tagName, id: parent?.id, class: parent?.className?.substring(0, 80) });
            break;
          }
        }
      }
    }
    return matches;
  });
  console.log('IVT/sheet相关文本:', JSON.stringify(ivtItems.slice(0, 40), null, 2));
  
  // 截图
  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-indicators.png', fullPage: true });
  console.log('截图已保存');
  
  await browser.close();
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
