/**
 * 连接到 CDP 浏览器，自动填活动ID进指标页抓数据
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const pages = contexts[0]?.pages() || [];
  const page = pages[0];
  
  if (!page) {
    console.log('没找到页面');
    process.exit(1);
  }
  
  console.log('当前URL:', page.url());
  
  // 选择"输入活动ID"单选
  const switched = await page.evaluate(() => {
    const radios = document.querySelectorAll('input[name="inputMethod"]');
    for (const r of radios) {
      if (r.value === '1') { // 输入活动ID
        r.checked = true;
        r.dispatchEvent(new Event('change', {bubbles: true}));
        r.click();
        return true;
      }
    }
    return false;
  });
  console.log('切换到输入活动ID:', switched);
  await page.waitForTimeout(1000);
  
  // 填活动ID
  const filled = await page.evaluate(() => {
    const input = document.querySelector('#campaignIdInput, input[name="campaignIds"], textarea[name="campaignIds"], #campaignIds, input[placeholder*="活动ID"]') || 
                  document.querySelector('textarea') || 
                  document.querySelector('input[type="text"]:not(#username):not(#password)');
    if (input) {
      input.value = '2507095';
      input.dispatchEvent(new Event('input', {bubbles: true}));
      input.dispatchEvent(new Event('change', {bubbles: true}));
      return { id: input.id, name: input.name, tag: input.tagName };
    }
    // 找所有 input 看看
    const allInputs = Array.from(document.querySelectorAll('input[type="text"], textarea')).map(i => ({
      id: i.id, name: i.name, placeholder: i.placeholder, value: i.value, tag: i.tagName
    }));
    return { error: 'not found', allInputs };
  });
  console.log('填活动ID结果:', JSON.stringify(filled, null, 2));
  await page.waitForTimeout(500);
  
  // 找下一步/搜索按钮并点击
  const btnInfo = await page.evaluate(() => {
    const btns = document.querySelectorAll('button, input[type="submit"], a.btn');
    return Array.from(btns).map(b => ({
      text: b.innerText?.trim() || b.value,
      id: b.id,
      class: b.className?.substring(0, 60),
      tag: b.tagName
    })).filter(b => b.text);
  });
  console.log('按钮列表:', JSON.stringify(btnInfo.slice(0, 20), null, 2));
  
  // 点"下一步"或"搜索"或类似按钮
  const clicked = await page.evaluate(() => {
    const btns = document.querySelectorAll('button, input[type="submit"], a.btn');
    for (const b of btns) {
      const text = b.innerText?.trim() || b.value || '';
      if (text.includes('下一步') || text.includes('搜索') || text.includes('确定') || text.includes('提交')) {
        b.click();
        return text;
      }
    }
    return null;
  });
  console.log('点击按钮:', clicked);
  await page.waitForTimeout(3000);
  
  console.log('跳转后URL:', page.url());
  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-step2.png' });
  
  // 抓指标选项
  const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log('页面文本:', text.substring(0, 1500));
  
  // 抓所有checkbox
  const indicators = await page.evaluate(() => {
    const checks = document.querySelectorAll('input[type="checkbox"]');
    return Array.from(checks).map(c => {
      const label = c.closest('label, .checkbox, td, th, li, .form-check');
      return {
        id: c.id,
        name: c.name,
        value: c.value,
        label: label?.innerText?.trim()?.substring(0, 100),
        checked: c.checked,
        disabled: c.disabled
      };
    }).filter(c => c.label);
  });
  console.log('指标选项:', JSON.stringify(indicators.slice(0, 100), null, 2));
  
  // 搜 givttotal/sivttotal
  const ivtItems = await page.evaluate(() => {
    const keywords = ['givttotal', 'sivttotal', 'givt', 'sivt', 'GIVT', 'SIVT', 'IVT', '分规则', 'sheet', '分sheet', '分表', '按活动', '按地域', 'sheetBy'];
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
    return [...new Set(matches)];
  });
  console.log('IVT/sheet相关:', JSON.stringify(ivtItems.slice(0, 40), null, 2));
  
  // 抓 select 下拉框（可能是 sheetBy）
  const selects = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('select')).map(s => ({
      id: s.id,
      name: s.name,
      options: Array.from(s.options).map(o => ({ value: o.value, text: o.text }))
    }));
  });
  console.log('下拉框:', JSON.stringify(selects.slice(0, 10), null, 2));
  
  await page.screenshot({ path: '/Users/adm/.openclaw-gugu/workspace-gugu/drill-step2-full.png', fullPage: true });
  console.log('截图已保存');
  
  // 不关闭浏览器
  await browser.close();
  console.log('=== 完成 ===');
})().catch(e => { console.error('Fatal:', e.message, e.stack); process.exit(1); });
