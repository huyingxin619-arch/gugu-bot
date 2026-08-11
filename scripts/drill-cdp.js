/**
 * 带 CDP 的浏览器 — 启动后保持运行
 * 小胡手动操作到指标页后，我用另一个脚本连上来抓
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--remote-debugging-port=9222'
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  // 登录
  console.log('=== 登录 ===');
  await page.goto('https://omi-api-qa.cn.miaozhen.com/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  await page.fill('#username', 'AI专用账号');
  await page.fill('#password', '6zNfF969S');
  await page.evaluate(() => {
    const priv = document.getElementById('privacy');
    if (priv && !priv.checked) { priv.checked = true; priv.dispatchEvent(new Event('change', {bubbles: true})); }
    const mask = document.getElementById('t_mask');
    if (mask) mask.style.display = 'none';
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button, input[type="submit"]');
    for (const b of btns) {
      if (b.textContent.includes('登录') || b.value === '登录') { b.click(); return; }
    }
  });
  console.log('登录按钮已点击，请拖滑块...');

  for (let i = 0; i < 300; i++) {
    await page.waitForTimeout(1000);
    try {
      const t = await page.evaluate(() => document.body?.innerText?.substring(0, 200) || '');
      if (t && !t.includes('用户登录') && !t.includes('隐私政策') && !page.url().includes('login')) {
        console.log(`登录成功! ${i}s, URL: ${page.url()}`);
        break;
      }
    } catch(e) {}
    if (i % 10 === 0) console.log(`等待... ${i}s`);
  }

  // 登录后直接去多维钻取创建任务
  await page.goto('https://omi-api-qa.cn.miaozhen.com/query/task/showNewTask?type=normal#newTask', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('当前URL:', page.url());
  console.log('=== 浏览器保持打开，CDP端口9222 ===');
  console.log('>>> 小胡请操作到指标选择页面，然后告诉我 ===');
  
  // 保持打开30分钟
  await page.waitForTimeout(1800000);
  await browser.close();
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
