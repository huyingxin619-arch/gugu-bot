/**
 * 多维钻取界面检查 — 有头模式
 * 需要小胡手动过滑块验证码
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 200,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  // ===== Step 1: 登录 =====
  console.log('=== Step 1: 登录 ===');
  console.log('>>> 小胡请在浏览器窗口里拖滑块完成验证 <<<');
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

  // 点登录
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button, input[type="submit"]');
    for (const b of btns) {
      if (b.textContent.includes('登录') || b.value === '登录') { b.click(); return; }
    }
  });
  console.log('登录按钮已点击，等滑块验证码...');

  // 等登录完成，最多3分钟
  let loggedIn = false;
  for (let i = 0; i < 180; i++) {
    await page.waitForTimeout(1000);
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.substring(0, 300));
    if (!text.includes('用户登录') && !url.includes('login') && !text.includes('隐私政策')) {
      console.log(`登录成功! ${i}s, URL: ${url}`);
      loggedIn = true;
      break;
    }
    if (i % 10 === 0) console.log(`等待中... ${i}s`);
  }

  if (!loggedIn) {
    console.log('登录超时(3分钟)，退出');
    await browser.close();
    return;
  }

  await page.waitForTimeout(2000);
  console.log('当前URL:', page.url());

  // ===== Step 2: 探索主页面菜单 =====
  console.log('\n=== Step 2: 探索主页面 ===');
  const navItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('a, .menu-item, .nav-item, [role="menuitem"], .ant-menu-item, li a, span'));
    return items.map(el => ({
      text: el.innerText?.trim()?.substring(0, 80),
      href: el.href || ''
    })).filter(l => l.text && l.text.length < 80);
  });
  // 去重
  const uniqueNav = [...new Map(navItems.map(n => [n.text + n.href, n])).values()];
  console.log('导航菜单:', JSON.stringify(uniqueNav.slice(0, 50), null, 2));

  // ===== Step 3: 找多维钻取入口 =====
  console.log('\n=== Step 3: 找多维钻取 ===');
  
  // 尝试点击包含"钻取"的菜单
  const drillMenuItem = await page.evaluate(() => {
    const allElements = document.querySelectorAll('a, span, div, li, .menu-item, .ant-menu-item');
    for (const el of allElements) {
      const text = el.innerText?.trim();
      if (text && (text === '多维钻取' || text === '多维分析' || text.includes('钻取'))) {
        return { text, tag: el.tagName, class: el.className, id: el.id };
      }
    }
    return null;
  });
  console.log('找到钻取菜单项:', JSON.stringify(drillMenuItem));

  if (drillMenuItem) {
    // 点击它
    await page.evaluate((text) => {
      const allElements = document.querySelectorAll('a, span, div, li, .menu-item, .ant-menu-item');
      for (const el of allElements) {
        if (el.innerText?.trim() === text || el.innerText?.trim()?.includes(text)) {
          el.click();
          return;
        }
      }
    }, drillMenuItem.text);
    await page.waitForTimeout(3000);
  } else {
    // 尝试直接访问
    console.log('没找到钻取菜单，尝试直接访问 /advanced#/drill ...');
    await page.goto('https://omi-api-qa.cn.miaozhen.com/advanced#/drill', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
  }

  console.log('当前URL:', page.url());
  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-check-03-drill-page.png' });

  const pageText = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('页面文本:', pageText.substring(0, 800));

  // 获取页面上的所有可交互元素
  const interactives = await page.evaluate(() => {
    const els = document.querySelectorAll('button, a, select, input, [role="tab"], [role="button"], .ant-tabs-tab, .ant-radio-button-wrapper');
    return Array.from(els).map(el => ({
      tag: el.tagName,
      text: el.innerText?.trim()?.substring(0, 60),
      type: el.type || '',
      id: el.id,
      class: el.className?.substring(0, 80),
      href: el.href || ''
    })).filter(e => e.text || e.id);
  });
  console.log('可交互元素:', JSON.stringify(interactives.slice(0, 40), null, 2));

  // 保持浏览器打开，让小胡可以手动操作
  console.log('\n=== 浏览器保持打开，小胡可以手动操作 ===');
  console.log('>>> 看完后告诉我结果，或输入 close 关闭浏览器 <<<');
  
  // 等待10分钟让小胡操作
  await page.waitForTimeout(600000);
  await browser.close();
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
