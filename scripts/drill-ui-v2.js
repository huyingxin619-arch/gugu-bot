/**
 * 多维钻取界面检查 v2 — 有头模式
 * 自动过滑块后：1)看任务列表页 2)进ADM创建任务看Custom指标 3)进TVM看SIVT sheetBy
 */
const { chromium } = require('playwright');
const fs = require('fs');

const SHOT_DIR = '/Users/adm/.openclaw-gugu/workspace-gugu';

async function snap(page, name) {
  const path = `${SHOT_DIR}/drill-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`截图: ${path}`);
  return path;
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  // ===== Step 1: 登录 =====
  console.log('=== Step 1: 登录 ===');
  console.log('>>> 小胡请拖滑块 <<<');
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
  console.log('登录按钮已点击，等滑块...');

  let loggedIn = false;
  for (let i = 0; i < 180; i++) {
    await page.waitForTimeout(1000);
    const url = page.url();
    const text = await page.evaluate(() => { try { return document.body?.innerText?.substring(0, 200) || ''; } catch(e) { return ''; } });
    if (text && !text.includes('用户登录') && !url.includes('login') && !text.includes('隐私政策')) {
      console.log(`登录成功! ${i}s`);
      loggedIn = true;
      break;
    }
    if (i % 10 === 0) console.log(`等待... ${i}s`);
  }
  if (!loggedIn) { console.log('登录超时'); await browser.close(); return; }
  await page.waitForTimeout(2000);

  // ===== Step 2: 去多维钻取任务列表页 =====
  console.log('\n=== Step 2: 多维钻取任务列表页 ===');
  await page.goto('https://omi-api-qa.cn.miaozhen.com/query/task/showTaskList', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('当前URL:', page.url());
  await snap(page, 'task-list');
  
  const taskListText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log('任务列表页文本:', taskListText.substring(0, 1000));
  
  // 找"创建任务"或"新建任务"按钮
  const createBtn = await page.evaluate(() => {
    const els = document.querySelectorAll('a, button, [role="button"]');
    for (const el of els) {
      const text = el.innerText?.trim();
      if (text && (text.includes('创建') || text.includes('新建') || text.includes('添加'))) {
        return { text, tag: el.tagName, href: el.href || '', id: el.id, class: el.className };
      }
    }
    return null;
  });
  console.log('创建任务按钮:', JSON.stringify(createBtn));

  // 获取页面上的所有链接和按钮
  const allActions = await page.evaluate(() => {
    const els = document.querySelectorAll('a, button, [role="button"], input[type="button"], input[type="submit"]');
    return Array.from(els).map(el => ({
      text: el.innerText?.trim()?.substring(0, 60),
      href: el.href || '',
      tag: el.tagName,
      id: el.id
    })).filter(e => e.text);
  });
  console.log('页面所有操作:', JSON.stringify(allActions.slice(0, 30), null, 2));

  // ===== Step 3: 点创建任务 =====
  console.log('\n=== Step 3: 创建任务 ===');
  if (createBtn) {
    if (createBtn.href) {
      await page.goto(createBtn.href, { waitUntil: 'networkidle' });
    } else {
      await page.click(`text=${createBtn.text}`);
    }
    await page.waitForTimeout(3000);
  } else {
    // 尝试直接访问创建页
    await page.goto('https://omi-api-qa.cn.miaozhen.com/query/task/showCreate', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
  }
  
  console.log('当前URL:', page.url());
  await snap(page, 'create-task');
  
  const createText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log('创建任务页文本:', createText.substring(0, 1000));

  // 看有没有 ADM/TVM 选择
  const tabs = await page.evaluate(() => {
    const els = document.querySelectorAll('.nav-tabs li, .tab-pane, .ant-tabs-tab, [role="tab"], a[data-toggle="tab"]');
    return Array.from(els).map(el => el.innerText?.trim()).filter(Boolean);
  });
  console.log('Tab选项:', JSON.stringify(tabs));

  // 看指标选择区域
  const indicators = await page.evaluate(() => {
    // 找所有checkbox和radio
    const checks = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    return Array.from(checks).map(c => {
      const label = c.closest('label, .checkbox, .radio, .form-group, .form-check');
      return {
        id: c.id,
        name: c.name,
        value: c.value,
        label: label ? label.innerText?.trim()?.substring(0, 80) : '',
        checked: c.checked,
        disabled: c.disabled
      };
    }).filter(c => c.label);
  });
  console.log('指标选项(checkbox/radio):', JSON.stringify(indicators.slice(0, 50), null, 2));

  // ===== Step 4: 找Custom指标区域 =====
  console.log('\n=== Step 4: 查找Custom指标 ===');
  
  // 找包含 givttotal / sivttotal 的文本
  const customIndicators = await page.evaluate(() => {
    const allText = document.body.innerText;
    const hasGivt = allText.includes('givttotal') || allText.includes('GIVT') || allText.includes('givt');
    const hasSivt = allText.includes('sivttotal') || allText.includes('SIVT') || allText.includes('sivt');
    const hasCustom = allText.includes('Custom') || allText.includes('自定义') || allText.includes('custom');
    
    // 找包含这些关键词的元素
    const keywords = ['givttotal', 'sivttotal', 'givt', 'sivt', 'GIVT', 'SIVT', 'IVT'];
    const matches = [];
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      const text = el.innerText?.trim();
      if (text && text.length < 100) {
        for (const kw of keywords) {
          if (text.toLowerCase().includes(kw.toLowerCase())) {
            matches.push({ text, tag: el.tagName, id: el.id, class: el.className?.substring(0, 60) });
            break;
          }
        }
      }
    }
    return { hasGivt, hasSivt, hasCustom, matches: matches.slice(0, 30) };
  });
  console.log('Custom指标搜索结果:', JSON.stringify(customIndicators, null, 2));

  // ===== Step 5: 切到TVM看SIVT sheetBy =====
  console.log('\n=== Step 5: 切到TVM ===');
  
  // 尝试点TVM tab
  const tvmTab = await page.evaluate(() => {
    const els = document.querySelectorAll('a, li, [role="tab"], .nav-tabs li');
    for (const el of els) {
      const text = el.innerText?.trim();
      if (text && (text.includes('TVM') || text.includes('TV-Monitor') || text.includes('电视') || text.includes('TV '))) {
        el.click();
        return text;
      }
    }
    return null;
  });
  console.log('TVM tab:', tvmTab);
  
  if (tvmTab) {
    await page.waitForTimeout(2000);
    await snap(page, 'tvm-create');
    
    const tvmText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('TVM页面文本:', tvmText.substring(0, 800));
    
    // 找 sheetBy 相关
    const sheetByInfo = await page.evaluate(() => {
      const allText = document.body.innerText;
      const hasSheetBy = allText.includes('sheetBy') || allText.includes('分sheet') || allText.includes('按活动') && allText.includes('按地域');
      
      // 找 select 下拉框
      const selects = document.querySelectorAll('select');
      const selectOptions = Array.from(selects).map(s => ({
        id: s.id,
        name: s.name,
        options: Array.from(s.options).map(o => ({ value: o.value, text: o.text }))
      }));
      
      // 找包含 sheet 的元素
      const sheetEls = [];
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const text = el.innerText?.trim();
        if (text && text.length < 100 && (text.toLowerCase().includes('sheet') || text.includes('分表'))) {
          sheetEls.push({ text, tag: el.tagName, id: el.id });
        }
      }
      
      return { hasSheetBy, selectOptions: selectOptions.slice(0, 10), sheetEls: sheetEls.slice(0, 10) };
    });
    console.log('TVM sheetBy信息:', JSON.stringify(sheetByInfo, null, 2));
  }

  console.log('\n=== 全部完成，浏览器保持打开5分钟 ===');
  await page.waitForTimeout(300000);
  await browser.close();
})().catch(e => { console.error('Fatal:', e.message, e.stack); process.exit(1); });
