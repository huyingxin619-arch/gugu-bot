/**
 * 只看当前页面状态，不操作
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const pages = contexts[0]?.pages() || [];
  const page = pages[0];
  
  console.log('当前URL:', page.url());
  
  // 抓页面文本前2000字
  const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log('页面文本:', text);
  
  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-current.png' });
  console.log('截图已保存: drill-current.png');
  
  await browser.close();
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
