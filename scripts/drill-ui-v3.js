/**
 * 多维钻取界面检查 v3 — 登录后直接检查
 * 假设小胡已经登录好了，直接去多维钻取页面
 */
const { chromium } = require('playwright');

const SHOT_DIR = '/Users/adm/.openclaw-gugu/workspace-gugu';

(async () => {
  // 连接已有浏览器 — 用 persistent context
  const browser = await chromium.launchOverPersistentHeadlessChrome;
  
  // 改用 launch + 直接跳转，依赖已有 cookie
  const browser2 = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // 先开一个 about:blank，然后直接去多维钻取
  const context = await browser2.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  
  // 直接去多维钻取页面，看是否已登录（cookie可能还在）
  console.log('=== 直接访问多维钻取 ===');
  await page.goto('https://omi-api-qa.cn.miaozhen.com/query/task/showTaskList', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const url = page.url();
  const text = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || '');
  console.log('URL:', url);
  console.log('页面文本:', text.substring(0, 200));
  
  // 如果跳回登录页，需要重新登录
  if (text.includes('用户登录') || text.includes('隐私政策')) {
    console.log('未登录，需要重新登录...');
    
    await page.goto('https://omi-api-qa.cn.miaozhen.com/', { waitUntil: 'networkidle' });
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
    
    // 等登录，最多5分钟
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
    
    // 去多维钻取
    await page.goto('https://omi-api-qa.cn.miaozhen.com/query/task/showTaskList', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
  }
  
  console.log('\n=== 多维钻取任务列表页 ===');
  console.log('URL:', page.url());
  await page.screenshot({ path: `${SHOT_DIR}/drill-task-list.png` });
  
  const taskListText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log('页面文本:', taskListText.substring(0, 1000));
  
  // 找所有操作
  const actions = await page.evaluate(() => {
    const els = document.querySelectorAll('a, button, [role="button"], input[type="button"], input[type="submit"]');
    return Array.from(els).map(el => ({
      text: el.innerText?.trim()?.substring(0, 60),
      href: el.href || '',
      tag: el.tagName,
      id: el.id
    })).filter(e => e.text);
  });
  console.log('页面操作:', JSON.stringify(actions.slice(0, 30), null, 2));
  
  // 找创建任务按钮
  const createBtn = actions.find(a => a.text.includes('新建') || a.text.includes('创建任务')) || actions.find(a => a.text.includes('创建') || a.text.includes('添加'));
  if (createBtn) {
    console.log('\n=== 进入创建任务页 ===');
    if (createBtn.id === 'newTaskBtn' || !createBtn.href || createBtn.href.startsWith('javascript:')) {
      await page.click('#newTaskBtn');
    } else {
      await page.goto(createBtn.href, { waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(3000);
    console.log('URL:', page.url());
    await page.screenshot({ path: `${SHOT_DIR}/drill-create-task.png` });
    
    const createText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
    console.log('创建任务页文本:', createText.substring(0, 1500));
    
    // 找所有 checkbox/radio（指标选择）
    const indicators = await page.evaluate(() => {
      const checks = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
      return Array.from(checks).map(c => {
        const label = c.closest('label, .checkbox, .radio, .form-group, .form-check, td, th');
        const nextText = c.nextElementSibling?.innerText || c.parentElement?.innerText || '';
        return {
          id: c.id,
          name: c.name,
          value: c.value,
          label: (label ? label.innerText : nextText)?.trim()?.substring(0, 100),
          checked: c.checked,
          disabled: c.disabled
        };
      }).filter(c => c.label);
    });
    console.log('指标选项:', JSON.stringify(indicators.slice(0, 60), null, 2));
    
    // 搜索 givttotal / sivttotal
    const ivtMatches = await page.evaluate(() => {
      const keywords = ['givttotal', 'sivttotal', 'givt', 'sivt', 'GIVT', 'SIVT', 'IVT', '分规则'];
      const matches = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent.trim();
        if (text.length < 100) {
          for (const kw of keywords) {
            if (text.toLowerCase().includes(kw.toLowerCase())) {
              const parent = node.parentElement;
              matches.push({ text, tag: parent?.tagName, id: parent?.id, class: parent?.className?.substring(0, 60) });
              break;
            }
          }
        }
      }
      return matches;
    });
    console.log('IVT相关文本:', JSON.stringify(ivtMatches.slice(0, 30), null, 2));
    
    // 找 Tab 选项（ADM/TVM切换）
    const tabs = await page.evaluate(() => {
      const els = document.querySelectorAll('.nav-tabs li a, .ant-tabs-tab, [role="tab"]');
      return Array.from(els).map(el => el.innerText?.trim()).filter(Boolean);
    });
    console.log('Tab选项:', JSON.stringify(tabs));
    
    // 尝试切TVM
    const tvmClicked = await page.evaluate(() => {
      const els = document.querySelectorAll('.nav-tabs li a, .ant-tabs-tab, [role="tab"], a, li');
      for (const el of els) {
        const text = el.innerText?.trim();
        if (text && (text === 'TVM' || text.includes('TV-Monitor') || text.includes('TV Monitor'))) {
          el.click();
          return text;
        }
      }
      return null;
    });
    if (tvmClicked) {
      console.log('\n=== 切到TVM ===');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SHOT_DIR}/drill-tvm.png` });
      
      const tvmText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
      console.log('TVM页面:', tvmText.substring(0, 800));
      
      // 找 sheetBy / 分sheet 相关
      const sheetInfo = await page.evaluate(() => {
        const selects = document.querySelectorAll('select');
        const selectData = Array.from(selects).map(s => ({
          id: s.id,
          options: Array.from(s.options).map(o => o.text)
        }));
        
        const keywords = ['sheet', '分sheet', '分表', '按活动', '按地域', 'sheetBy'];
        const matches = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const text = walker.currentNode.textContent.trim();
          if (text.length < 100) {
            for (const kw of keywords) {
              if (text.toLowerCase().includes(kw.toLowerCase())) {
                matches.push(text);
                break;
              }
            }
          }
        }
        return { selects: selectData, sheetText: matches };
      });
      console.log('TVM sheet信息:', JSON.stringify(sheetInfo, null, 2));
    }
  }
  
  console.log('\n=== 完成，浏览器保持打开 ===');
  console.log('>>> 输入 close 关闭 ===');
  await page.waitForTimeout(600000);
  await browser2.close();
})().catch(e => { console.error('Fatal:', e.message, e.stack); process.exit(1); });
