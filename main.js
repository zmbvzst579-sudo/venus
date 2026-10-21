(function () {
  'use strict';

  /* ---------- 字体就绪后再显示整站，避免字体切换闪烁 ---------- */
  (function waitFonts() {
    const root = document.documentElement;
    const ready = () => root.classList.add('fonts-ready');
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(ready).catch(ready);
      window.setTimeout(ready, 2500);
    } else {
      ready();
    }
  })();

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const U = (n) => 'images/' + encodeURI(n);

  /* ---------- 音效引擎 ---------- */
  const SFX_ON = true;
  const SFX_VOLUME = 2.5;
  let audioCtx = null;
  let noiseBuffer = null;
  let lastSfxTime = 0;

  function getAudioCtx() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended' || audioCtx.state === 'interrupted') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    const len = Math.floor(audioCtx.sampleRate * 0.4);
    noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function unlockAudio() {
    getAudioCtx();
  }

  function sfxPageTurn() {
    if (!SFX_ON) return;
    const now = performance.now();
    if (now - lastSfxTime < 120) return;
    lastSfxTime = now;

    const ctx = getAudioCtx();
    if (!ctx || !noiseBuffer) return;

    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400;
    bp.Q.value = 0.9;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3200;

    const gain = ctx.createGain();
    const peak = 0.09 * SFX_VOLUME;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);

    src.connect(bp).connect(lp).connect(gain).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.38);
  }

  function sfxCardLift() {
    if (!SFX_ON) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const gain = ctx.createGain();
    const peak = 0.065 * SFX_VOLUME;
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.07);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  function sfxCardOpen() {
    if (!SFX_ON) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    const gain = ctx.createGain();
    const peak = 0.07 * SFX_VOLUME;
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(370, t + 0.1);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  function todayLabel() {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }
  const TODAY = todayLabel();

  const IMG = {
    kintsugi: U('image3.webp'),
    stone: U('image2.webp'),
    branch: U('image1.webp')
  };

  const PAGES = ['COVER', 'STYLES', 'TERMS', 'NOTES', 'PRICING'];

  const ABOUT = {
    name: 'Venus',
    lines: [
      '03 / Le-T · 巨蟹 · INTJ-A',
      '耳鸟陪龄 3 年 · 七无',
      '在线时间 晚八点后',
      '雾山影 / 渡鹤影 · 常驻团',
      '9 月个人流水 5k+'
    ]
  };

  const TERMS = [
    { tag: '雷点', text: '动物塑我 贬低我 侮辱我智商' },
    { tag: '婉拒', text: '拒未成年；le拒男；拒纯单口' },
    { tag: '单删致歉', text: '单子结束就会删好友，无论是否有存单；无恶意无任何其他原因，请不要多想' },
    { tag: '风格', text: '风格可自行diy，无要求我会「循序渐进」；一般为上位高恋恶趣女人，放松就好，如有不适及时与我反应' },
    { tag: '告知', text: '若有无法接受的，如称呼、亲密行为、擦边、涉三、小圈、文艺等请提前告知，不接受未说明导致踩暗雷的一切不合理反馈' },
    { tag: '小圈', text: '小概率掉落小圈风格：我会根据你的雷点和反应判断单内气氛是否足够；玩之前会提醒你，接受不了可以直接拒绝；安全词“Y stop”，你有随时叫停的权利，所以请不要单后提裤子不认人' },
    { tag: '退款', text: '病半 5min、病一 10min内体验不好可退全款，不接受卡点退单及过时退单，其余按照比例退款' },
    { tag: '时间', text: '约存无准确时间的，取单建议提前告知我方便安排时间' },
    { tag: '时间', text: '请珍惜彼此时间，一般我会留出半小时空档，鸽单不补，十分钟没来默认存单；放鸽子三次后我会主动联系派单退单' },
    { tag: '派单', text: '未提前说明单内抽象 / 拼刺等，我有同等权利拒单；情况包括但不限于：八分钟内未认真回复、敷衍、嘿嘿傻笑各种语气词 / 表情等；我会直接单内提醒，加钱继续 / 沟通不了退单流程' },
    { tag: '派单', text: '自带爱陪来互病 / 拼刺 / 修罗 / 反修等的，希望我们合作愉快，是我能力有问题我接受客诉，但请不要因为其他原因折磨我，我是陪玩不是套' },
    { tag: '保密', text: '不接受任何形式的单内话术外泄 / 抄袭及任何形式的对我个人声誉的损毁，发现一律按单价成倍赔偿，不然等着挂条满天飞吧' },
    { tag: '其他', text: '如果我们恰好投机，之后可以给我一个评价，我会更希望我们的故事被记住' },
    { tag: '其他', text: '下单默认已读，感谢选择' }
  ];

  const STYLES = {
    comfort: [
      { title: '舒适区 1', tags: ['上位', '高恋', '轻浮系'], body: '恶趣挑逗 / 逻辑剖析 / 诱导诡辩' },
      { title: '舒适区 2', tags: ['平权', '伪恋', '病虐'], body: '非典型 | 文艺哲学 | 意识流' }
    ],
    support: { title: '权位支持', tags: ['上位', '平权', '伪下'] },
    all: [
      '逻辑剖析 精控',
      '轻浮系 诱导诡辩 恶趣挑逗 微文微撩',
      '恶劣无下限 涉三调训',
      '非典型 文艺意识流 病虐',
      '白骑士伪救赎',
      '低无拼刺'
    ],
    rare: { title: '小概率事件', body: '无下限 涉三调训<br>（详见单前须知）' }
  };

  const ADVICE = [
    '一般为上位高恋恶趣女人，不高压。',
    '非回合制，欢迎畅所欲言，但也请听彼此把话说完。',
    '一直和我反骨 / 打辩论赛，请做好你会体验不佳的准备。',
    '你怎样对我，就会受到怎样的对待。',
    '如果玩开心了不小心掉落高擦 / 涉三 / 小圈——会原谅我的吧？',
    '（会提前查看喜雷并单内暗示）'
  ];

  const PRICING = [
    { title: '基础', rows: [['48/h', '27r/0.5h']] },
    { title: '加价', rows: [['指名 / 指定装扮', '+3'], ['不接单口半单口 / 新手', '+3'], ['互病', '+5'], ['对抽象 / 拼刺', '+10'], ['旁观', '+10/位']] },
    { title: '时段', rows: [['凌晨 (0-3)', '+5/h'], ['凌晨 (3-7)', '+7/h']] },
    { title: '特殊', rows: [['修罗 / 反修', '60/h · 32/0.5h']] }
  ];

  const NOTES = {
    reviews: {
      num: '07', title: '板评',
      items: [
        { quote: 'Thoughtful, precise, and quietly bold.', by: 'A. KIM / STUDIO' },
        { quote: 'A rare mix of restraint and play.', by: 'M. CHEN / EDITOR' }
      ]
    },
    scripts: { num: '08', title: '话术', body: '\\ 如果你发现喉咙紧绷<br>\\ 难以吞咽<br><br>我可以松开你的衣领 /' },
    types: { num: '09', title: '卡类', items: ['上位 · 高冷', '轻浮 · 恶趣', '逻辑 · 病虐', '文艺 · 意识流'] },
    essays: { num: '10', title: '随笔', body: '因为令我热衷的事情<br>上帝看到不会同意 /<br><br>\'Cause I like to do things God<br>DOESN\'T APPROVE OF' }
  };

  const NOTICE = {
    link: 'http://45.207.195.35/',
    tail: '本人只在雾山影、渡鹤影、潮栖三团内，无任何形式私单。'
  };

  function slip(html, cls) {
    return `<div class="slip burnt ${cls || ''}" aria-hidden="true">${html}</div>`;
  }
  function aside(html, cls) {
    return `<div class="aside ${cls || ''}" aria-hidden="true">${html}</div>`;
  }
  function tag(kind, pos) {
    return `<span class="tagblock tagblock--${kind} tagblock--${pos}" aria-hidden="true"></span>`;
  }
  function pin(pos) {
    return `<span class="pin${pos ? ' pin--' + pos : ''}" aria-hidden="true"></span>`;
  }
  function frag(src, cap, cls, eager) {
    return `<figure class="frag ${cls || ''}" aria-hidden="true">${pin()}<img src="${src}" alt="" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"><figcaption>${cap}</figcaption></figure>`;
  }
  function pageHead(no, label, title) {
    return `<div class="page-head"><span class="run">${no} — ${label}</span><h2 class="head">${title}</h2></div>`;
  }

  function calendarHTML() {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][month];
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span class="cal-d cal-d--empty"></span>';
    for (let d = 1; d <= days; d++) cells += `<span class="cal-d${d === today ? ' is-marked' : ''}">${d}</span>`;
    const wd = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w) => `<span class="cal-w">${w}</span>`).join('');
    return `<div class="cal card-edge">
      <div class="cal-head"><span>${mon}</span><span class="cal-y">${year}</span></div>
      <div class="cal-grid">${wd}${cells}</div>
      <span class="cal-stamp">${mon} ${year}</span>
    </div>`;
  }

  function pageCover() {
    return `
    <section class="page" data-page="0">
      <div class="page-inner">
        ${frag(IMG.kintsugi, 'kintsugi / 01', 'frag--p1', true)}
        ${slip('如果你只在周日祷告<br>那周一能不能来我这里', 'slip--p1')}

        <div class="cover-head">
          <span class="run run--date">${TODAY}*</span>
          <h1 class="display display--mask">Oxytoicn_V</h1>
          <p class="epigraph">Cant take it back<br>Once it's been sat in motion</p>
          <p class="subtitle">a personal archive</p>
        </div>

        <div class="about card-edge tex-paper">
          ${pin('tm')}
          ${tag('ice', 'br')}
          <span class="eyebrow">01 / about</span>
          <div class="about-name">${ABOUT.name}</div>
          <div class="about-lines">${ABOUT.lines.map((l) => `<div>${l}</div>`).join('')}</div>
        </div>

        <div class="notice card-edge tex-paper">
          <span class="notice-label">Notice</span>
          <p class="notice-body">近期存在大量诈骗，如有疑问请查询该派单是否在雾山影团内任职：<a href="${NOTICE.link}" target="_blank" rel="noopener noreferrer">${NOTICE.link}</a><br><br>${NOTICE.tail}</p>
        </div>
      </div>
    </section>`;
  }

  function pageStyles() {
    return `
    <section class="page" data-page="1">
      <div class="page-inner">
        <span class="spine" aria-hidden="true">STYLES</span>
        <div class="reg" aria-hidden="true"></div>
        <div class="page-head"><span class="run">02 — STYLES</span></div>
        <div class="vein">
          <figure class="vein-fig burnt" data-focus="interact-img" aria-label="枝桠图">
            ${pin()}
            <img src="${IMG.branch}" alt="枝桠" loading="lazy" decoding="async">
            <figcaption><span>FIG 01</span><span>branch</span><span>${TODAY}</span></figcaption>
          </figure>

          <div class="vein-style" data-focus="styles">
            ${tag('ochre', 'tr')}
            <span class="eyebrow">styles / 04</span>
            <span class="vein-style-t">风格</span>
            <span class="more">翻开看看 ↗</span>
          </div>

          <div class="vein-advice" data-focus="advice">
            ${tag('ice', 'tr')}
            <span class="vein-advice-t">食用建议</span>
            <span class="vein-advice-more">点开细读 ↗</span>
          </div>
        </div>
        ${aside('因为令我热衷的事情<br>上帝看到不会同意<br>Cause I like to do things God<br>DOESN\'T APPROVE OF', 'aside--p2')}
      </div>
    </section>`;
  }

  function pageTerms() {
    return `
    <section class="page" data-page="2">
      <div class="page-inner page-inner--p3">
        <div class="p3">
          <div class="terms-card tex-paper" data-focus="terms">
            ${tag('charcoal', 'bl')}
            <span class="terms-title">单前须知</span>
            <span class="terms-en">TERMS · READ BEFORE</span>
            <span class="terms-hint">点开须知 ↗</span>
          </div>
          ${calendarHTML()}
          ${frag(IMG.stone, 'weight / 02', 'frag--p3 burnt')}
          ${slip('如果你发现喉咙紧绷难以下咽<br>我可以松开你的衣领 /', 'slip--p3')}
          ${aside('She couldn\'t look away<br>look away look away /', 'aside--p3')}
        </div>
      </div>
    </section>`;
  }

  function pageNotes() {
    const items = [
      ['reviews', '板评', '07', true, 'https://www.kdocs.cn/l/cjDplzaSZU6x'],
      ['scripts', '话术', '08', false, 'https://www.kdocs.cn/l/cmpdS2PetAth'],
      ['types', '卡类', '09', false, 'https://www.kdocs.cn/l/cfohu4jhqEHU'],
      ['essays', '随笔', '10', false, 'https://www.kdocs.cn/l/cjIjgfSdnCau']
    ];
    const cards = items.map(([k, t, n, dark, link], i) => `
      <div class="note ${dark ? 'note--dark' : ''}" data-no="${n}" data-focus="${k}" data-link="${link}">
        ${i === 0 ? tag('ochre', 'tr') : ''}
        <span class="note-t">${t}</span>
        <span class="note-u"></span>
        <span class="note-open">TAP TO OPEN</span>
      </div>`).join('');
    return `
    <section class="page" data-page="3">
      <div class="page-inner">
        <div class="p4-top">
          ${pageHead('04', 'NOTES', 'Notes')}
        </div>
        <div class="notes">${cards}</div>
        ${aside('只要你还在呼吸<br>就休想离开这里 /', 'aside--p4')}
        ${aside('And what would people say<br>people say people say.', 'aside--p4b')}
      </div>
    </section>`;
  }

  function pagePricing() {
    const groups = PRICING.map((g) => `
      <div class="receipt-g">
        <div class="receipt-gt">[ ${g.title} ]</div>
        ${g.rows.map((r) => `<div class="receipt-line"><span>${r[0]}</span><span class="dots"></span><span>${r[1]}</span></div>`).join('')}
      </div>`).join('');
    return `
    <section class="page" data-page="4">
      <div class="page-inner">
        <div class="price-row2">
          ${tag('ice', 'tl')}
          <div class="receipt" data-focus="pricing">
            <div class="paid" aria-hidden="true">PAID</div>
            <div class="receipt-top">
              <span class="receipt-brand">VENUS_</span>
              <span class="receipt-tag">PRICE LIST</span>
            </div>
            <div class="receipt-title">价目</div>
            <div class="receipt-meta"><span>NO. 0520</span><span>${TODAY}</span></div>
            <div class="receipt-dash"></div>
            <div class="receipt-g"><div class="receipt-line"><span>自带价</span><span class="dots"></span><span>其他未提及明细跟团</span></div></div>
            ${groups}
            <div class="receipt-dash"></div>
            <div class="receipt-foot"><span>THANK YOU</span><span>下单默认已读</span></div>
            <div class="receipt-barcode"></div>
            <div class="cut" aria-hidden="true">✂ cut here</div>
            <div class="receipt-tear" aria-hidden="true"></div>
          </div>
          <div class="venus-vert" aria-hidden="true"><span>Venus</span></div>
        </div>
        <div class="p5-foot">
          <div class="colophon">SET IN COURIER &amp; MINCHO<br>${TODAY} · © VENUS</div>
          <div class="closing">IF they listen through the wall<br>THEN will u...</div>
        </div>
      </div>
    </section>`;
  }

  function fHead(no, title) {
    return `<header class="f-head"><span class="eyebrow">${no}</span><h3 class="f-title">${title}</h3></header>`;
  }
  function fFoot(no) {
    return `<footer class="f-foot"><span>venus — archive</span><span>${no}</span></footer>`;
  }

  function renderFocus(key) {
    if (key === 'interact-img') {
      return fHead('FIG 01', '枝桠') + `<div class="f-content"><figure class="f-fig"><img src="${IMG.branch}" alt="枝桠" decoding="async"></figure></div>` + fFoot('FIG');
    }
    if (key === 'styles') {
      const comfort = STYLES.comfort.map((c) => `
        <section class="f-sec">
          <h4 class="f-sec-t">（${c.title}）</h4>
          <p class="f-body">${c.tags.join(' | ')}</p>
          <p class="f-body">${c.body}</p>
        </section>`).join('');
      const all = STYLES.all.map((t) => `<li>${t}</li>`).join('');
      return `<div class="f-grid f-mincho">` + fHead('04 / styles', '风格') + `<div class="f-content">
        ${comfort}
        <section class="f-sec"><h4 class="f-sec-t">《${STYLES.support.title}》</h4><p class="f-body">${STYLES.support.tags.join(' ')}</p></section>
        <section class="f-sec"><h4 class="f-sec-t">《全部领域》</h4><ul class="f-list f-list--cols">${all}</ul></section>
        <section class="f-sec"><h4 class="f-sec-t">${STYLES.rare.title}</h4><p class="f-body">${STYLES.rare.body}</p></section>
      </div>` + fFoot('04') + `</div>`;
    }
    if (key === 'advice') {
      const list = ADVICE.map((t, i) => `
        <div class="f-term"><span class="f-idx">${String(i + 1).padStart(2, '0')}</span><p>${t}</p></div>`).join('');
      return `<div class="f-grid">` + fHead('06 / advice', '食用建议') + `<div class="f-content">
        <div class="f-terms">${list}</div>
      </div>` + fFoot('06') + `</div>`;
    }
    if (key === 'terms') {
      const list = TERMS.map((t, i) => `
        <div class="f-term"><span class="f-idx">${String(i + 1).padStart(2, '0')}</span><span class="f-tag">${t.tag}</span><p>${t.text}</p></div>`).join('');
      return `<div class="f-grid">` + fHead('05 / terms', '单前须知') + `<div class="f-content">
        <section class="f-sec">
          <h4 class="f-sec-t">以下须知</h4>
          <p class="f-body f-drop"><strong class="f-strong">下单默认已读</strong>。请在单前阅读完整条款，避免踩雷与误解。</p>
        </section>
        <div class="f-terms">${list}</div>
      </div>` + fFoot('05') + `</div>`;
    }
    if (key === 'reviews') {
      const items = NOTES.reviews.items.map((r) => `
        <section class="f-sec"><p class="f-quote">“${r.quote}”</p><span class="f-by">— ${r.by}</span></section>`).join('');
      return fHead('07 / reviews', '板评') + `<div class="f-content">${items}</div>` + fFoot('07');
    }
    if (key === 'scripts') {
      return fHead('08 / scripts', '话术') + `<div class="f-content"><section class="f-sec"><p class="f-body f-body--kai">${NOTES.scripts.body}</p></section></div>` + fFoot('08');
    }
    if (key === 'types') {
      const items = NOTES.types.items.map((t) => `<li>${t}</li>`).join('');
      return fHead('09 / types', '卡类') + `<div class="f-content"><section class="f-sec"><ul class="f-list f-list--cols">${items}</ul></section></div>` + fFoot('09');
    }
    if (key === 'essays') {
      return fHead('10 / essays', '随笔') + `<div class="f-content"><section class="f-sec"><p class="f-body f-body--kai">${NOTES.essays.body}</p></section></div>` + fFoot('10');
    }
    if (key === 'pricing') {
      const groups = PRICING.map((g) => `
        <section class="f-sec">
          <h4 class="f-sec-t">[ ${g.title} ]</h4>
          ${g.rows.map((r) => `<div class="receipt-line"><span>${r[0]}</span><span class="dots"></span><span>${r[1]}</span></div>`).join('')}
        </section>`).join('');
      return fHead('11 / pricing', '价目') + `<div class="f-content">
        <section class="f-sec"><div class="receipt-line"><span>自带价</span><span class="dots"></span><span>其他未提及明细跟团</span></div></section>
        ${groups}
        <section class="f-sec"><p class="f-body"><strong class="f-strong">下单默认已读，感谢选择</strong></p></section>
      </div>` + fFoot('11');
    }
    return '';
  }

  const el = {
    site: $('#site'), intro: $('#intro'), deck: $('#deck'),
    nav: $('#nav'), brandBtn: $('#brandBtn'), readout: $('#readout'), introDate: $('#introDate'),
    focus: $('#focus'), focusCard: $('#focusCard'), focusContent: $('#focusContent'),
    focusBackdrop: $('.focus-backdrop'),
    fab: $('#fab'), bgMusic: $('#bgMusic')
  };

  let pages = [];
  let current = 0;
  let rafId = null;
  let focusOpen = false;
  let p5Revealed = false;
  let scrollAnim = null;
  let wheelLocked = false;
  let lastLabel = '';
  const entered = new Set();

  function setMusicUI(on) {
    const icon = el.fab ? $('.fab-icon', el.fab) : null;
    if (el.fab) {
      el.fab.classList.toggle('is-playing', !!on);
      el.fab.setAttribute('aria-label', on ? '暂停音乐' : '播放音乐');
    }
    if (icon) icon.textContent = on ? '❚❚' : '▶';
  }

  function playMusic() {
    if (!el.bgMusic) return;
    const p = el.bgMusic.play();
    if (p && p.then) {
      p.then(() => setMusicUI(true)).catch(() => setMusicUI(false));
    } else {
      setMusicUI(true);
    }
  }

  function pauseMusic() {
    if (!el.bgMusic) return;
    el.bgMusic.pause();
    setMusicUI(false);
  }

  function bindFab() {
    if (!el.fab || !el.bgMusic) return;
    el.fab.addEventListener('click', () => {
      if (el.bgMusic.paused) playMusic();
      else pauseMusic();
    });
    el.bgMusic.addEventListener('play', () => setMusicUI(true));
    el.bgMusic.addEventListener('pause', () => setMusicUI(false));
  }

  function applyTheme(isRed) {
    if (isRed) document.documentElement.dataset.theme = 'red';
    else delete document.documentElement.dataset.theme;
  }

  function bindTheme() {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', '切换配色');
    btn.innerHTML = '<span class="theme-sw" aria-hidden="true"></span>';
    el.site.appendChild(btn);

    const root = document.documentElement;
    const KEY = 'venus-theme-v3';
    const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
    const write = (v) => { try { localStorage.setItem(KEY, v); } catch (e) {} };

    const isRed = read() === 'red';
    if (isRed) root.dataset.theme = 'red';

    const sync = () => {
      const red = root.dataset.theme === 'red';
      btn.classList.toggle('is-red', red);
      btn.setAttribute('aria-pressed', String(red));
    };
    sync();

    btn.addEventListener('click', () => {
      const rect = btn.getBoundingClientRect();
      root.style.setProperty('--tx', `${rect.left + rect.width / 2}px`);
      root.style.setProperty('--ty', `${rect.top + rect.height / 2}px`);

      const nextRed = root.dataset.theme !== 'red';

      if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.startViewTransition(() => applyTheme(nextRed));
      } else {
        applyTheme(nextRed);
      }

      write(nextRed ? 'red' : 'paper');
      sync();
    });
  }

  function buildDeck() {
    el.deck.innerHTML = pageCover() + pageStyles() + pageTerms() + pageNotes() + pagePricing();
    pages = $$('.page', el.deck);
  }

  function updateIndex() {
    const label = PAGES[current] || '';
    if (el.readout && label !== lastLabel) {
      lastLabel = label;
      el.readout.innerHTML = label
        .split('')
        .map((c, i) => `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`)
        .join('');
    }
    if (el.nav) {
      $$('.dot', el.nav).forEach((b) => {
        b.classList.toggle('is-active', Number(b.dataset.page) === current);
      });
    }
  }

  function enterPage(page) {
    if (!page) return;
    const idx = Number(page.dataset.page);
    if (entered.has(idx)) return;
    entered.add(idx);
    page.classList.add('is-enter');
    window.setTimeout(() => page.classList.remove('is-enter'), 1500);
  }

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const vw = el.deck.clientWidth || window.innerWidth;
      const c = vw / 2;
      let nearest = 0, best = Infinity;
      pages.forEach((p, i) => {
        const r = p.getBoundingClientRect();
        const mid = r.left + r.width / 2;
        const d = Math.abs(mid - c);
        const off = clamp((mid - c) / vw, -1, 1);
        p.style.setProperty('--px', (off * 16).toFixed(2));
        const focus = clamp(1 - d / (vw * 0.35), 0, 1);
        p.style.setProperty('--focus', focus.toFixed(3));
        if (d < best) { best = d; nearest = i; }
      });
      if (nearest === 4 && !p5Revealed) {
        p5Revealed = true;
        if (pages[4]) pages[4].classList.add('is-reveal');
      }
      if (nearest !== current) {
        const isFirstEntry = entered.size === 0;
        current = nearest;
        updateIndex();
        enterPage(pages[nearest]);
        if (!isFirstEntry) sfxPageTurn();
      }
    });
  }

  function cancelScrollAnim() {
    if (scrollAnim) {
      cancelAnimationFrame(scrollAnim);
      scrollAnim = null;
      el.deck.style.scrollSnapType = '';
    }
  }

  function animateScrollTo(target, duration) {
    cancelScrollAnim();
    const start = el.deck.scrollLeft;
    const delta = target - start;
    if (Math.abs(delta) < 1) return;
    if (!duration) duration = clamp(620 + Math.abs(delta) * 0.28, 620, 980);

    const prevSnap = el.deck.style.scrollSnapType;
    el.deck.style.scrollSnapType = 'none';

    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const step = (now) => {
      const p = clamp((now - t0) / duration, 0, 1);
      el.deck.scrollLeft = start + delta * ease(p);
      if (p < 1) {
        scrollAnim = requestAnimationFrame(step);
      } else {
        scrollAnim = null;
        el.deck.style.scrollSnapType = prevSnap;
      }
    };
    scrollAnim = requestAnimationFrame(step);
  }

  function bumpDeck(dir) {
    const page = pages[current];
    if (!page) return;
    const cls = dir === 'left' ? 'is-bump-left' : 'is-bump-right';
    page.classList.remove('is-bump-left', 'is-bump-right');
    void page.offsetWidth;
    page.classList.add(cls);
    window.setTimeout(() => page.classList.remove(cls), 340);
    if (navigator.vibrate) navigator.vibrate(8);
  }

  function goTo(i) {
    if (i < 0) { bumpDeck('left'); return; }
    if (i >= pages.length) { bumpDeck('right'); return; }
    const p = pages[i];
    if (!p) return;
    const peek = (el.deck.clientWidth - p.offsetWidth) / 2;
    animateScrollTo(p.offsetLeft - peek);
  }

  function openFocus(cardEl) {
    const key = cardEl.dataset.focus;
    if (!key) return;
    sfxCardOpen();
    el.focusContent.innerHTML = renderFocus(key);
    el.focusContent.scrollTop = 0;
    el.focus.classList.add('is-open');
    el.focus.setAttribute('aria-hidden', 'false');
    el.site.classList.add('is-focus');
    focusOpen = true;

    const vw = el.focus.clientWidth || window.innerWidth;
    const vh = el.focus.clientHeight || window.innerHeight;
    const src = cardEl.getBoundingClientRect();
    const W = el.focusCard.offsetWidth;
    const H = el.focusCard.offsetHeight;
    if (src.width > 20 && src.height > 20 && W > 0 && H > 0) {
      const s = clamp(Math.min(src.width / W, src.height / H, 1), 0.1, 1);
      const dx = (src.left + src.width / 2) - vw / 2;
      const dy = (src.top + src.height / 2) - vh / 2;
      el.focusCard.style.transition = 'none';
      el.focusCard.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${s})`;
      void el.focusCard.offsetWidth;
      requestAnimationFrame(() => {
        el.focusCard.style.transition = '';
        el.focusCard.style.transform = '';
      });
    }
  }

  function closeFocus() {
    if (!focusOpen) return;
    focusOpen = false;
    el.focus.classList.add('is-closing');
    el.focus.classList.remove('is-open');
    el.focus.setAttribute('aria-hidden', 'true');
    el.site.classList.remove('is-focus');
    el.focusCard.style.transform = '';
    if (el.focusBackdrop) el.focusBackdrop.style.opacity = '';
    window.setTimeout(() => {
      el.focus.classList.remove('is-closing');
    }, 400);
  }

  function bindFocusDrag() {
    if (!el.focusCard) return;
    let startY = null;
    let moved = false;

    el.focusCard.addEventListener('touchstart', (e) => {
      if (el.focusContent.scrollTop > 0) return;
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      moved = false;
      el.focusCard.style.transition = 'none';
    }, { passive: true });

    el.focusCard.addEventListener('touchmove', (e) => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        if (e.cancelable) e.preventDefault();
        moved = true;
        el.focusCard.style.transform = `translate(-50%, calc(-50% + ${dy * 0.6}px))`;
        if (el.focusBackdrop) el.focusBackdrop.style.opacity = String(Math.max(0, 1 - dy / 320));
      }
    }, { passive: false });

    const endDrag = (e) => {
      if (startY === null) return;
      const dy = e.changedTouches[0].clientY - startY;
      startY = null;
      el.focusCard.style.transition = '';
      el.focusCard.style.transform = '';
      if (el.focusBackdrop) el.focusBackdrop.style.opacity = '';
      if (moved && dy > 110) closeFocus();
    };
    el.focusCard.addEventListener('touchend', endDrag, { passive: true });
    el.focusCard.addEventListener('touchcancel', endDrag, { passive: true });
  }

  function bindLift() {
    let timer = null;
    el.deck.addEventListener('pointerdown', (e) => {
      if (focusOpen) return;
      const card = e.target.closest('[data-focus]');
      if (!card) return;
      timer = window.setTimeout(() => {
        card.classList.add('is-lifted');
        sfxCardLift();
        if (navigator.vibrate) navigator.vibrate(8);
      }, 220);
    }, { passive: true });

    const release = () => {
      if (timer) { clearTimeout(timer); timer = null; }
      $$('[data-focus].is-lifted').forEach((el) => el.classList.remove('is-lifted'));
    };
    document.addEventListener('pointerup', release, { passive: true });
    document.addEventListener('pointercancel', release, { passive: true });
  }

  function bind() {
    const enter = () => {
      if (el.intro.classList.contains('is-out')) return;
      unlockAudio();
      el.intro.classList.add('is-out');
      el.site.dataset.mode = 'main';
      playMusic();
      requestAnimationFrame(() => enterPage(pages[0]));
    };
    el.intro.addEventListener('click', enter);
    el.intro.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') enter(); });

    document.addEventListener('pointerdown', unlockAudio, { passive: true });

    el.deck.addEventListener('scroll', onScroll, { passive: true });
    el.deck.addEventListener('pointerdown', cancelScrollAnim, { passive: true });
    el.deck.addEventListener('touchstart', cancelScrollAnim, { passive: true });

    el.deck.addEventListener('click', (e) => {
      const pg = e.target.closest('.page');
      if (pg) {
        const idx = pages.indexOf(pg);
        if (idx !== -1 && idx !== current) { goTo(idx); return; }
      }
      const f = e.target.closest('[data-focus]');
      if (f) {
        if (f.dataset.link && window.matchMedia('(pointer: coarse)').matches) {
          window.open(f.dataset.link, '_blank', 'noopener');
          return;
        }
        openFocus(f);
      }
    });

    if (el.nav) {
      $$('.dot', el.nav).forEach((b) => {
        b.addEventListener('click', () => goTo(Number(b.dataset.page)));
      });
    }
    if (el.brandBtn) el.brandBtn.addEventListener('click', () => goTo(0));

    el.focus.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]') || e.target === el.focus) closeFocus();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if (focusOpen) closeFocus(); return; }
      if (focusOpen) return;
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'Home') goTo(0);
      if (e.key === 'End') goTo(pages.length - 1);
    });

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      el.deck.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (wheelLocked || focusOpen) return;
        const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (Math.abs(d) < 6) return;
        wheelLocked = true;
        goTo(current + (d > 0 ? 1 : -1));
        window.setTimeout(() => { wheelLocked = false; }, 720);
      }, { passive: false });
    }

    window.addEventListener('resize', () => { if (!focusOpen) onScroll(); });
  }

  buildDeck();
  updateIndex();
  bind();
  bindFab();
  bindTheme();
  bindFocusDrag();
  bindLift();
  if (el.introDate) el.introDate.textContent = TODAY + '*';
})();
