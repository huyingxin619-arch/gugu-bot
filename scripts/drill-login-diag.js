/**
 * 诊断登录问题
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  const page = await context.newPage();

  await page.goto('https://omi-api-qa.cn.miaozhen.com/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 先看原始登录页
  const beforeLogin = await page.evaluate(() => {
    const username = document.querySelector('#username');
    const password = document.querySelector('#password');
    const privacy = document.querySelector('#privacy');
    const loginBtn = document.querySelector('button[type="submit"], input[type="submit"], .login-btn, #loginBtn');
    
    // 找所有button
    const allBtns = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]')).map(b => ({
      text: b.innerText || b.value,
      id: b.id,
      class: b.className,
      type: b.type,
      disabled: b.disabled
    }));
    
    // 找错误/提示信息
    const tips = Array.from(document.querySelectorAll('.error, .tip, .alert, [class*="error"], [class*="tip"], [class*="alert"], [class*="warn"]')).map(e => ({
      text: e.innerText?.trim(),
      class: e.className,
      visible: e.offsetParent !== null
    })).filter(t => t.text);
    
    // 检查"密码修改"提示
    const bodyText = document.body.innerText;
    const hasPwdChange = bodyText.includes('密码修改') || bodyText.includes('修改密码');
    
    return {
      username: username ? { value: username.value, disabled: username.disabled } : null,
      password: password ? { value: '***', disabled: password.disabled } : null,
      privacy: privacy ? { checked: privacy.checked } : null,
      loginBtn: loginBtn ? { text: loginBtn.innerText, disabled: loginBtn.disabled } : null,
      allBtns,
      tips,
      hasPwdChange,
      bodyTextSnippet: bodyText.substring(0, 500)
    };
  });
  console.log('登录前状态:', JSON.stringify(beforeLogin, null, 2));

  // 填表
  await page.fill('#username', 'AI专用账号');
  await page.fill('#password', '6zNfF969S');
  await page.evaluate(() => {
    const priv = document.getElementById('privacy');
    if (priv && !priv.checked) { priv.checked = true; priv.dispatchEvent(new Event('change', {bubbles: true})); }
    const mask = document.getElementById('t_mask');
    if (mask) mask.style.display = 'none';
  });
  await page.waitForTimeout(500);

  // 填完后状态
  const afterFill = await page.evaluate(() => {
    const username = document.querySelector('#username');
    const password = document.querySelector('#password');
    const privacy = document.querySelector('#privacy');
    return {
      username: username?.value,
      password: password?.value ? '***' : 'empty',
      privacy: privacy?.checked
    };
  });
  console.log('填表后状态:', JSON.stringify(afterFill, null, 2));

  // 监听网络请求
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('login') || req.url().includes('auth') || req.url().includes('passport')) {
      requests.push({ method: req.method(), url: req.url() });
    }
  });
  page.on('response', resp => {
    if (resp.url().includes('login') || resp.url().includes('auth') || resp.url().includes('passport')) {
      requests.push({ status: resp.status(), url: resp.url() });
    }
  });

  // 点击登录
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button, input[type="submit"]');
    for (const b of btns) {
      if (b.textContent.includes('登录') || b.value === '登录') { b.click(); return; }
    }
  });

  console.log('等待登录响应...');
  await page.waitForTimeout(5000);

  // 看登录后状态
  const afterLogin = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const url = window.location.href;
    
    // 找错误提示
    const errors = Array.from(document.querySelectorAll('[class*="error"], [class*="tip"], [class*="alert"], [class*="warn"], .msg, .message')).map(e => ({
      text: e.innerText?.trim(),
      class: e.className,
      visible: e.offsetParent !== null
    })).filter(t => t.text);
    
    // 检查验证码
    const captcha = !!document.querySelector('#tcaptcha_iframe, iframe[src*="tcaptcha"], .tcaptcha-popup');
    
    return {
      url,
      bodyTextSnippet: bodyText.substring(0, 500),
      errors,
      captcha,
      hasPwdChange: bodyText.includes('密码修改') || bodyText.includes('修改密码')
    };
  });
  console.log('登录后状态:', JSON.stringify(afterLogin, null, 2));
  console.log('网络请求:', JSON.stringify(requests, null, 2));

  await browser.close();
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
