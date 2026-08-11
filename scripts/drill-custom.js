/**
 * 切到定制模版，找 givttotal/sivttotal 指标
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const pages = contexts[0]?.pages() || [];
  const page = pages[0];
  
  console.log('当前URL:', page.url());
  
  // 找"定制模版"并点击
  const clicked = await page.evaluate(() => {
    const els = document.querySelectorAll('a, li, span, div, label, button');
    for (const el of els) {
      const text = el.innerText?.trim();
      if (text === '定制模版' || text === '定制模板' || (text && text.includes('定制'))) {
        el.click();
        return text;
      }
    }
    return null;
  });
  console.log('点击定制模版:', clicked);
  await page.waitForTimeout(2000);
  
  // 抓指标
  const text = await page.evaluate(() => document.body.innerText);
  
  // 搜 givttotal/sivttotal
  const hasGivt = text.includes('givttotal') || text.includes('GIVT') || text.includes('givt');
  const hasSivt = text.includes('sivttotal') || text.includes('SIVT') || text.includes('sivt');
  console.log('包含GIVT:', hasGivt, '包含SIVT:', hasSivt);
  
  // 抓所有checkbox
  const indicators = await page.evaluate(() => {
    const checks = document.querySelectorAll('input[type="checkbox"]');
    return Array.from(checks).map(c => {
      const label = c.closest('label, .checkbox, td, th, li, .form-check, .form-group');
      return {
        id: c.id,
        name: c.name,
        value: c.value,
        label: label?.innerText?.trim()?.substring(0, 120),
        checked: c.checked,
        disabled: c.disabled
      };
    }).filter(c => c.label);
  });
  console.log('定制模版指标:', JSON.stringify(indicators.slice(0, 80), null, 2));
  
  // 搜 IVT 相关
  const ivtItems = await page.evaluate(() => {
    const keywords = ['givttotal', 'sivttotal', 'givt', 'sivt', 'GIVT', 'SIVT', 'IVT', '分规则', 'verify', 'realId', 'pgsivt', 'sivtadvanced', 'sivth2'];
    const matches = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent.trim();
      if (text.length < 120) {
        for (const kw of keywords) {
          if (text.toLowerCase().includes(kw.toLowerCase())) {
            const parent = walker.currentNode.parentElement;
            matches.push({ text, tag: parent?.tagName, id: parent?.id, class: parent?.className?.substring(0, 80) });
            break;
          }
        }
      }
    }
    return [...new Map(matches.map(m => [m.text, m])).values()];
  });
  console.log('IVT相关:', JSON.stringify(ivtItems.slice(0, 40), null, 2));
  
  // 截图
  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-custom.png', fullPage: true });
  console.log('截图已保存');
  
  await browser.close();
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
