/**
 * 点击"定制模版"tab，然后截图
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const pages = contexts[0]?.pages() || [];
  const page = pages[0];
  
  console.log('当前URL:', page.url());
  
  // 点击"定制模版"
  const clicked = await page.evaluate(() => {
    const els = document.querySelectorAll('a, li, span, div, label, button, input');
    for (const el of els) {
      const text = el.innerText?.trim();
      if (text === '定制模版' || text === '定制模板') {
        el.click();
        return text;
      }
    }
    return null;
  });
  console.log('点击:', clicked);
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-custom-tab.png' });
  console.log('截图已保存: drill-custom-tab.png');
  
  await browser.close();
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
