/**
 * 固定模板 by活动/网站/广告位 指标对比检查
 * 有头模式，小胡过滑块后自动切tab截图
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
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

  await page.evaluate(() => {
    const btns = document.querySelectorAll('button, input[type="submit"]');
    for (const b of btns) {
      if (b.textContent.includes('登录') || b.value === '登录') { b.click(); return; }
    }
  });
  console.log('登录按钮已点击，等滑块验证码...');

  // 等登录完成，最多5分钟
  let loggedIn = false;
  for (let i = 0; i < 300; i++) {
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
    console.log('登录超时(5分钟)，退出');
    await browser.close();
    return;
  }

  await page.waitForTimeout(2000);
  console.log('登录后URL:', page.url());

  // ===== Step 2: 保存cookie =====
  const cookies = await context.cookies();
  const fs = require('fs');
  fs.writeFileSync('/tmp/adm-qa-cookies.json', JSON.stringify(cookies, null, 2));
  console.log('Cookie已保存');

  // ===== Step 3: 导航到创建任务页 =====
  console.log('\n=== Step 3: 导航到多维钻取创建任务页 ===');
  
  // 尝试多种路径
  const urls = [
    'https://omi-api-qa.cn.miaozhen.com/advanced#/drill',
    'https://omi-api-qa.cn.miaozhen.com/advanced#/query/create',
    'https://omi-api-qa.cn.miaozhen.com/#/query/create',
    'https://omi-api-qa.cn.miaozhen.com/admonitor#/query/create',
  ];
  
  let navSuccess = false;
  for (const url of urls) {
    console.log(`尝试: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log(`页面文本前200: ${text.substring(0, 200)}`);
    if (text.includes('任务') || text.includes('创建') || text.includes('钻取') || text.includes('活动') || text.includes('模板')) {
      console.log('找到任务创建页!');
      navSuccess = true;
      break;
    }
  }

  if (!navSuccess) {
    // 探索导航菜单
    console.log('\n直接URL没找到，探索菜单...');
    await page.goto('https://omi-api-qa.cn.miaozhen.com/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const navItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('a, .menu-item, .nav-item, [role="menuitem"], .ant-menu-item, li a, span, div'));
      return items.map(el => ({
        text: el.innerText?.trim()?.substring(0, 60),
        href: el.href || '',
        tag: el.tagName,
        class: el.className?.substring(0, 60)
      })).filter(l => l.text && l.text.length > 0 && l.text.length < 60);
    });
    const uniqueNav = [...new Map(navItems.map(n => [n.text, n])).values()];
    console.log('导航项:', JSON.stringify(uniqueNav.slice(0, 60), null, 2));
    
    // 找"多维钻取"或"创建任务"
    const target = await page.evaluate(() => {
      const all = document.querySelectorAll('a, span, div, li, .ant-menu-item');
      for (const el of all) {
        const t = el.innerText?.trim();
        if (t && (t.includes('钻取') || t.includes('多维分析') || (t.includes('创建') && t.includes('任务')) || t === '查询分析')) {
          el.click();
          return t;
        }
      }
      return null;
    });
    
    if (target) {
      console.log(`点击了: ${target}`);
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/adm-ui-01-home.png', fullPage: true });
    console.log('截图: adm-ui-01-home.png');
    console.log('当前URL:', page.url());
  }

  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/adm-ui-02-create.png', fullPage: true });
  console.log('截图: adm-ui-02-create.png');

  // ===== Step 4: 找"固定模板"tab和"按活动/按网站/按广告位"切换 =====
  console.log('\n=== Step 4: 查找模板和数据范围切换 ===');
  
  // 获取所有可交互元素
  const interactives = await page.evaluate(() => {
    const els = document.querySelectorAll('button, a, select, input, [role="tab"], [role="button"], .ant-tabs-tab, .ant-radio-button-wrapper, .ant-radio-wrapper, label, .nav-item, .tab-item');
    return Array.from(els).map(el => ({
      tag: el.tagName,
      text: el.innerText?.trim()?.substring(0, 80),
      type: el.type || '',
      id: el.id,
      class: el.className?.substring(0, 80),
      href: el.href || '',
      checked: el.checked || false,
      ariaSelected: el.getAttribute('aria-selected')
    })).filter(e => e.text || e.id);
  });
  console.log('可交互元素:', JSON.stringify(interactives.slice(0, 80), null, 2));

  // 找"按活动"相关元素
  const tabElements = await page.evaluate(() => {
    const results = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const t = el.innerText?.trim();
      if (t && (t === '按活动' || t === '按网站' || t === '按广告位' || t === '固定模板' || t === '定制模板' || t.includes('数据范围'))) {
        results.push({
          tag: el.tagName,
          text: t.substring(0, 80),
          class: el.className?.substring(0, 80),
          id: el.id,
          html: el.outerHTML.substring(0, 200)
        });
      }
    }
    return results;
  });
  console.log('\n找到的tab元素:', JSON.stringify(tabElements, null, 2));

  // ===== Step 5: 逐个切tab截图 =====
  const tabs = ['按活动', '按网站', '按广告位'];
  
  for (const tabName of tabs) {
    console.log(`\n=== 切换到: ${tabName} ===`);
    
    // 尝试点击
    const clicked = await page.evaluate((name) => {
      const all = document.querySelectorAll('*');
      for (const el of all) {
        const t = el.innerText?.trim();
        if (t === name) {
          // 找最近的可点击父级
          let target = el;
          for (let i = 0; i < 5; i++) {
            if (target.onclick || target.tagName === 'A' || target.tagName === 'BUTTON' || 
                target.classList.contains('ant-radio-button-wrapper') || 
                target.classList.contains('ant-tabs-tab') ||
                target.getAttribute('role') === 'tab') {
              break;
            }
            target = target.parentElement;
            if (!target) break;
          }
          target.click();
          return true;
        }
      }
      return false;
    }, tabName);
    
    console.log(`点击 ${tabName}: ${clicked}`);
    await page.waitForTimeout(2000);
    
    // 截图
    const screenshotPath = `/Users/adm/.openclaw-gugu/workspace-gugu/adm-ui-03-${tabName}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`截图: ${screenshotPath}`);
    
    // 获取指标区域文本
    const metricsText = await page.evaluate(() => {
      // 找指标勾选区域
      const all = document.querySelectorAll('*');
      const results = [];
      for (const el of all) {
        const t = el.innerText?.trim();
        if (t && (t.includes('总览') || t.includes('累计') || t.includes('按天') || t.includes('曝光') || t.includes('点击') || t.includes('指标'))) {
          if (t.length < 500 && el.children.length < 20) {
            results.push({ text: t.substring(0, 200), tag: el.tagName, class: el.className?.substring(0, 60) });
          }
        }
      }
      return results.slice(0, 20);
    });
    console.log(`指标区域:`, JSON.stringify(metricsText, null, 2));
    
    // 获取勾选框状态
    const checkboxes = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="checkbox"], .ant-checkbox-wrapper');
      return Array.from(inputs).map(el => ({
        text: el.innerText?.trim()?.substring(0, 60) || el.parentElement?.innerText?.trim()?.substring(0, 60) || '',
        checked: el.checked || el.classList.contains('ant-checkbox-wrapper-checked'),
        id: el.id,
        value: el.value || '',
        disabled: el.disabled || el.classList.contains('ant-checkbox-wrapper-disabled')
      })).filter(c => c.text);
    });
    console.log(`勾选框:`, JSON.stringify(checkboxes.slice(0, 40), null, 2));
  }

  console.log('\n=== 完成! 浏览器保持打开5分钟供查看 ===');
  console.log('>>> 看完告诉我结果 <<<');
  
  await page.waitForTimeout(300000);
  await browser.close();
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
