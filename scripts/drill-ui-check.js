/**
 * 多维钻取界面检查脚本
 * 目标：看三个问题
 * 1. ADM Custom 指标里 givttotal/sivttotal 分规则指标能不能选
 * 2. TVM SIVT 指标按活动/地域分 sheet 有没有限制
 * 3. 任务列表页长啥样
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  // ===== Step 1: 登录 =====
  console.log('=== Step 1: 登录 ===');
  await page.goto('https://omi-api-qa.cn.miaozhen.com/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 截图
  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-check-01-login.png' });
  console.log('登录页截图已保存');

  // 检查是否有验证码
  const hasCaptcha = await page.evaluate(() => {
    return !!document.querySelector('#tcaptcha_iframe, .tcaptcha-iframe, iframe[src*="tcaptcha"]');
  });
  console.log('有验证码:', hasCaptcha);

  // 填用户名密码
  await page.fill('#username', 'AI专用账号');
  await page.fill('#password', '6zNfF969S');
  
  // 勾选隐私政策
  await page.evaluate(() => {
    const priv = document.getElementById('privacy');
    if (priv && !priv.checked) { priv.checked = true; priv.dispatchEvent(new Event('change', {bubbles: true})); }
    const mask = document.getElementById('t_mask');
    if (mask) mask.style.display = 'none';
  });
  
  await page.waitForTimeout(500);
  
  // 点登录
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button, input[type="submit"]');
    for (const b of btns) {
      if (b.textContent.includes('登录') || b.value === '登录') { b.click(); return; }
    }
  });
  
  console.log('登录按钮已点击，等待跳转...');
  
  // 等待登录完成
  let loggedIn = false;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.substring(0, 300));
    
    if (!text.includes('用户登录') && !text.includes('404') && !url.includes('login')) {
      console.log(`登录成功! ${i}s, URL: ${url}`);
      console.log(`页面预览: ${text.substring(0, 200)}`);
      loggedIn = true;
      break;
    }
    
    // 检查是否有验证码弹出
    const captcha = await page.evaluate(() => !!document.querySelector('#tcaptcha_iframe, iframe[src*="tcaptcha"]'));
    if (captcha) {
      console.log(`检测到滑块验证码! 需要手动操作。`);
      await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-check-captcha.png' });
      loggedIn = false;
      break;
    }
    
    if (i % 5 === 0) console.log(`等待中... ${i}s, URL: ${url}`);
  }

  if (!loggedIn) {
    console.log('登录未成功。');
    await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-check-02-login-fail.png' });
    
    // 输出页面内容帮助诊断
    const text = await page.evaluate(() => document.body.innerText);
    console.log('页面文本:', text.substring(0, 500));
    
    // 检查错误提示
    const errors = await page.evaluate(() => {
      const els = document.querySelectorAll('.error, .alert, .warning, .tip, [class*="error"], [class*="alert"]');
      return Array.from(els).map(e => e.innerText?.trim()).filter(Boolean);
    });
    if (errors.length) console.log('错误提示:', JSON.stringify(errors));
    
    await browser.close();
    return;
  }

  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-check-02-main.png' });
  console.log('主页面截图已保存');

  // ===== Step 2: 找多维钻取入口 =====
  console.log('\n=== Step 2: 找多维钻取入口 ===');
  
  // 获取所有导航菜单
  const navItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('a, .menu-item, .nav-item, [role="menuitem"], .ant-menu-item, li'));
    return items.map(el => ({
      text: el.innerText?.trim()?.substring(0, 50),
      href: el.href || el.getAttribute('data-url') || '',
      tag: el.tagName
    })).filter(l => l.text && l.text.length < 50);
  });
  console.log('导航项:', JSON.stringify(navItems.filter(n => n.text).slice(0, 40), null, 2));

  // 尝试找到"多维钻取"或类似入口
  const drillLink = navItems.find(n => 
    n.text.includes('钻取') || n.text.includes('多维') || n.text.includes('drill') || 
    n.text.includes('交叉') || n.text.includes('自定义')
  );
  
  if (drillLink) {
    console.log('找到多维钻取入口:', drillLink.text, drillLink.href);
    if (drillLink.href) await page.goto(drillLink.href, { waitUntil: 'networkidle' });
    else await page.click(`text=${drillLink.text}`);
    await page.waitForTimeout(3000);
  } else {
    console.log('未找到多维钻取入口，尝试直接访问URL...');
    // 尝试常见路径
    await page.goto('https://omi-api-qa.cn.miaozhen.com/advanced#/drill', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('当前URL:', page.url());
  }

  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-check-03-drill-page.png' });
  console.log('钻取页面截图已保存');
  
  const drillText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log('钻取页面文本:', drillText.substring(0, 500));

  await browser.close();
  console.log('\n=== 完成 ===');
})().catch(e => { console.error('Fatal:', e.message, e.stack); process.exit(1); });
