/* ================================================================
   멘토 모드 — index.html?mode=mentor 또는 #mentor 로 열면
   멘토 노트(.mentor-panel)와 MENTOR MODE 배지가 보인다.
   student.html / mentor.html은 index.html로 리다이렉트만 한다.
   ================================================================ */
const IS_MENTOR = new URLSearchParams(location.search).get('mode') === 'mentor'
               || location.hash === '#mentor';
if(IS_MENTOR){
  document.documentElement.classList.add('mentor-mode');
  document.addEventListener('DOMContentLoaded', ()=>{
    document.body.classList.add('mentor-mode');
    document.title = '[멘토용] ' + document.title;
  });
}

/* ================================================================
   진도 저장 — 새로고침해도 보던 탭/페이지에서 이어한다.
   (다크모드·CLAUDE.md는 기존에 저장 중, 여기선 탭/페이지 담당)
   ================================================================ */
const SAVED_TAB    = localStorage.getItem('curTab') || 'A';
const SAVED_A_PAGE = parseInt(localStorage.getItem('aCurPage') || '0');

/* ================================================================
   CLAUDE.md 직접 작성 — 복사 함수
   ================================================================ */
function copyClaudeMd(){
  const text = document.getElementById('claudeMdUserText').value.trim();
  if(!text){ alert('CLAUDE.md 내용을 먼저 작성해보자!'); return; }
  const btn = document.getElementById('claudeMdCopyBtn');
  const finish = ()=>{
    btn.textContent = '복사됐다 ✓'; btn.classList.add('copied');
    setTimeout(()=>{ btn.textContent = '내 CLAUDE.md 복사하기'; btn.classList.remove('copied'); }, 2000);
  };
  navigator.clipboard.writeText(text).then(finish).catch(()=>{
    const ta=document.createElement('textarea'); ta.value=text;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta); finish();
  });
}

/* ================================================================
   터미널 박스 — 여러 줄 ptext에 multiline 클래스 자동 부여
   ================================================================ */
document.querySelectorAll('.prompt-box .ptext').forEach(el=>{
  if(el.textContent.includes('\n')) el.classList.add('multiline');
});

/* ================================================================
   탭 전환
   ================================================================ */
function switchTab(tab){
  localStorage.setItem('curTab', tab);
  ['A','B','C'].forEach(t=>{
    const sec = document.getElementById('section'+t);
    if(sec) sec.classList.toggle('hidden', t !== tab);
  });
  document.querySelectorAll('.main-tab').forEach(btn=> btn.classList.toggle('active', btn.dataset.tab === tab));
  const bottomNav = document.getElementById('aBottomNav');
  if(bottomNav) bottomNav.classList.toggle('show', tab === 'A');
  document.body.classList.toggle('tab-a', tab === 'A');
  if(tab === 'A') showAPage(0);
  if(tab === 'C' && typeof initGallery === 'function') initGallery();
  window.scrollTo(0,0);
  if(tab === 'B'){
    const bIO = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); bIO.unobserve(e.target); } });
    }, {threshold:0.1});
    document.querySelectorAll('#sectionB .reveal').forEach(el=>{ el.classList.remove('in'); bIO.observe(el); });
  }
}

/* ================================================================
   섹션 A — 스크롤 프로그레스 + 네비 스파이
   ================================================================ */
const stepDots = document.querySelectorAll('#stepNav .step-dot');
const stepSections = ['step0','step0c','step1','step1b','step2','step2b','step3','stepNext'].map(id=>document.getElementById(id));
// 참고: 페이지 위저드(showAPage)가 상단 네비 강조를 직접 관리한다.
// 과거 스크롤 기반 스파이 옵저버는 페이지 인덱스와 어긋나 강조가 밀리는
// 문제가 있어 비활성화한다.

window.addEventListener('scroll', ()=>{
  const h = document.documentElement;
  const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
  document.getElementById('mainProgress').style.width = pct + '%';
});

const revealIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); revealIO.unobserve(e.target); } });
},{threshold:0.15});
document.querySelectorAll('#sectionA .reveal').forEach(el=>revealIO.observe(el));

/* ================================================================
   섹션 A — STEP1 규칙 실험실
   ================================================================ */
const ruleState = { target:true, pastel:true, timer:true, easy:true };
function updatePreview(){
  const phone = document.querySelector('.preview-panel .phone');
  document.getElementById('prevTitle').textContent = ruleState.target ? '🌤️ 오늘 할 일' : '// app.js';
  document.getElementById('prevItem1').textContent = ruleState.target ? '📚 수학 숙제하기' : '항목 1';
  document.getElementById('prevItem2').textContent = ruleState.target ? '🎨 그림 그리기' : '항목 2';
  document.getElementById('prevTimer').textContent = ruleState.timer ? '25:00' : '45:00';
  document.getElementById('prevBtn').textContent = ruleState.target ? '집중 시작 ▶' : 'START';
  if(ruleState.pastel){ phone.classList.remove('bad'); phone.classList.add('good'); }
  else { phone.classList.remove('good'); phone.classList.add('bad'); }
  const offCount = Object.values(ruleState).filter(v=>!v).length;
  const cap = document.getElementById('prevCaption');
  if(offCount === 0){ cap.textContent = '규칙 4개가 모두 켜져 있다. 하나씩 꺼보자!'; }
  else {
    const msgs = [];
    if(!ruleState.target) msgs.push('누구를 위한 앱인지 몰라서 문구가 딱딱해진다');
    if(!ruleState.pastel) msgs.push('디자인이 밋밋한 기본값으로 바뀐다');
    if(!ruleState.timer) msgs.push('타이머 시간이 엉뚱하게(45분) 설정된다');
    if(!ruleState.easy) msgs.push('설명이 어려운 용어로 바뀔 수 있다');
    cap.textContent = msgs.join(' · ');
  }
}
document.querySelectorAll('.rule-toggle').forEach(t=>{
  t.addEventListener('click', ()=>{
    const key = t.dataset.rule;
    ruleState[key] = !ruleState[key];
    t.classList.toggle('on', ruleState[key]);
    updatePreview();
  });
});

/* ================================================================
   섹션 A — STEP2 비교 체험
   ================================================================ */
function typeText(el, text, speed){
  el.textContent = '';
  let i = 0;
  return new Promise(resolve=>{
    const iv = setInterval(()=>{
      el.textContent += text[i]; i++;
      if(i >= text.length){ clearInterval(iv); resolve(); }
    }, speed);
  });
}
function templateA(idea){ return '네! ' + idea + ' 만들었어요.\n\n— 입력 칸 하나\n— 시작/정지 버튼\n\n혹시 원하시는 디자인이나 시간 설정이 있으면 말씀해주세요. (기본 45분으로 설정했어요)'; }
function templateB(idea){ return '좋아요! 먼저 몇 가지만 확인할게요.\n\n1) 중학생이 쓸 용도가 맞나?\n2) 색감은 파스텔톤이 좋을까요, 다른 느낌?\n3) 집중 시간은 25분(뽀모도로 방식)이 어때요?\n\n답해주시면 ' + idea + '을(를) 그 조건에 딱 맞게 설계해드릴게요.'; }

function wireRunButton(btn){
  btn.addEventListener('click', async ()=>{
    const targetId = btn.dataset.target;
    const typingId = 'typing-' + targetId.split('-')[1];
    const typingEl = document.getElementById(typingId);
    const aiEl = document.getElementById(targetId);
    const idea = document.getElementById('ideaInput').value.trim() || '투두·타이머 앱';
    btn.disabled = true; btn.textContent = '실행 중...';
    typingEl.classList.add('show');
    await new Promise(r=>setTimeout(r,650));
    typingEl.classList.remove('show');
    const text = targetId === 'ai-a' ? templateA(idea) : templateB(idea);
    await typeText(aiEl, text, 14);
    btn.textContent = '완료 ✓';
  });
}
document.querySelectorAll('.run-btn').forEach(wireRunButton);

function rerunCompare(){
  const idea = document.getElementById('ideaInput').value.trim() || '투두·타이머 앱';
  document.querySelectorAll('.ideaEcho').forEach(el=>el.textContent = idea);
  ['ai-a','ai-b'].forEach(id=>{ document.getElementById(id).textContent=''; });
  document.querySelectorAll('.run-btn').forEach(b=>{ b.disabled=false; b.textContent='AI 실행해보기 ▶'; });
}
document.querySelectorAll('.reflect-options button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.reflect-options button').forEach(b=>b.classList.remove('picked'));
    document.querySelectorAll('.reflect-answer').forEach(a=>a.classList.remove('show'));
    btn.classList.add('picked');
    document.getElementById('reflect-'+btn.dataset.r).classList.add('show');
  });
});

/* ================================================================
   섹션 A — STEP3 나만의 규칙 카드
   ================================================================ */
function fillRule(chip){ document.getElementById('srule').value = chip.textContent; }

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(' '); let line = ''; let curY = y;
  for(let n=0;n<words.length;n++){
    const testLine = line + words[n] + ' ';
    if(ctx.measureText(testLine).width > maxWidth && n > 0){
      ctx.fillText(line, x, curY); line = words[n] + ' '; curY += lineHeight;
    } else { line = testLine; }
  }
  ctx.fillText(line, x, curY); return curY;
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
function drawCard(name, rule){
  const canvas = document.getElementById('cardCanvas');
  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  const grad = ctx.createLinearGradient(0,0,W,H);
  grad.addColorStop(0,'#12182B'); grad.addColorStop(1,'#1E2A4A');
  ctx.fillStyle=grad; roundRect(ctx,0,0,W,H,32); ctx.fill();
  ctx.beginPath(); ctx.fillStyle='rgba(0,168,150,0.25)'; ctx.arc(W-60,60,160,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.fillStyle='rgba(255,201,60,0.15)'; ctx.arc(70,H-60,120,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#FFC93C'; ctx.font='bold 24px sans-serif'; ctx.fillText('오늘의 완성 · AI와 첫걸음',60,90);
  ctx.fillStyle='#FFFFFF'; ctx.font='bold 52px sans-serif'; ctx.fillText(name+' 님',60,170);
  ctx.fillStyle='#AEB6C7'; ctx.font='22px sans-serif'; ctx.fillText('나만의 AI 사용 규칙',60,220);
  ctx.fillStyle='rgba(255,255,255,0.08)'; roundRect(ctx,60,260,W-120,260,20); ctx.fill();
  ctx.fillStyle='#FFFFFF'; ctx.font='30px sans-serif';
  wrapCanvasText(ctx,'“'+rule+'”',90,320,W-180,42);
  ctx.fillStyle='#6FE5D2'; ctx.font='18px sans-serif';
  ctx.fillText('멘토링 연구 프로젝트 · 옥쌤과 아이들',60,H-40);
}
function launchConfetti(){
  const colors=['#00A896','#FFC93C','#FF6F59','#6FE5D2'];
  for(let i=0;i<28;i++){
    const el=document.createElement('div'); el.className='confetti';
    el.style.left=Math.random()*100+'vw';
    el.style.width=el.style.height=(6+Math.random()*6)+'px';
    el.style.background=colors[i%colors.length];
    el.style.transition='transform 1.6s cubic-bezier(.2,.6,.3,1), opacity 1.6s';
    document.body.appendChild(el);
    requestAnimationFrame(()=>{
      el.style.transform='translateY('+(400+Math.random()*300)+'px) rotate('+(Math.random()*360)+'deg)';
      el.style.opacity='0';
    });
    setTimeout(()=>el.remove(),1700);
  }
}
function makeCard(){
  const name=document.getElementById('sname').value.trim()||'이름을 입력해주세요';
  const rule=document.getElementById('srule').value.trim()||'규칙을 입력해주세요';
  drawCard(name,rule);
  const wrap=document.getElementById('cardWrap');
  wrap.classList.add('show');
  wrap.scrollIntoView({behavior:'smooth',block:'center'});
  launchConfetti();
}
function downloadCard(){
  const canvas=document.getElementById('cardCanvas');
  const link=document.createElement('a');
  link.download='AI와_첫걸음_완성카드.png';
  link.href=canvas.toDataURL('image/png');
  link.click();
}

/* ================================================================
   섹션 B — 과목 / 사이트 종류 데이터
   ================================================================ */
const SUBJECTS = {
  physics:{ name:'물리', icon:'⚛️', accent:'#6C5CE7', accentLight:'#A29BFE',
    topicHint:'물리 공식',
    cards:[['F = ma','뉴턴 제2법칙 — 힘은 질량과 가속도의 곱'],['v = v₀ + at','등가속도 운동에서 속도 구하는 식'],['E = mc²','질량-에너지 등가 원리']],
    problem:{q:'질량 2kg인 물체에 4N의 힘을 가하면 가속도는?',choices:['1 m/s²','2 m/s²','8 m/s²'],answer:'2 m/s²',explain:'F=ma 이므로 a=F/m=4/2=2 m/s²'},
    tasks:['뉴턴 법칙 공식 3개 다시 써보기','물리 문제집 2쪽 풀기','오늘 배운 개념 한 문장으로 요약하기'],
    ideas:['운동 법칙 카드 묶음 따로 만들기','공식에 단위까지 같이 외우는 카드','틀린 문제만 다시 모아보는 기능'] },
  chemistry:{ name:'화학', icon:'🧪', accent:'#2ECC71', accentLight:'#7BE0A8',
    topicHint:'원소·반응식·개념',
    cards:[['Na','나트륨 — 원자번호 11번, 알칼리 금속'],['산화-환원','전자를 잃으면 산화, 얻으면 환원'],['mol (몰)','입자 6.02×10²³개를 묶어 세는 단위']],
    problem:{q:'다음 중 알칼리 금속은?',choices:['Na','Fe','O'],answer:'Na',explain:'Na(나트륨)은 1족 알칼리 금속이다.'},
    tasks:['원소기호 10개 외우기','화학 반응식 균형 맞추기 연습','오늘 배운 개념 한 문장으로 요약하기'],
    ideas:['원소기호 카드만 따로 묶기','반응식 완성하기 퀴즈 모드','주기율표 위치 맞히기 기능'] },
  biology:{ name:'생명과학', icon:'🧬', accent:'#FF6F91', accentLight:'#FFB0C4',
    topicHint:'생물 용어',
    cards:[['미토콘드리아','세포호흡이 일어나는 세포 소기관'],['삼투','물이 저농도에서 고농도로 이동하는 현상'],['DNA','유전정보를 저장하는 이중나선 구조']],
    problem:{q:'세포호흡이 일어나는 장소는?',choices:['미토콘드리아','리보솜','핵'],answer:'미토콘드리아',explain:'미토콘드리아에서 산소를 이용해 에너지를 만듭니다.'},
    tasks:['세포 소기관 이름과 역할 복습하기','생명과학 문제집 2쪽 풀기','오늘 배운 용어 한 문장으로 요약하기'],
    ideas:['세포 소기관 카드만 따로 묶기','용어 뜻 맞히기 퀴즈 모드','단원별로 카드 묶음 나누기'] },
  earth:{ name:'지구과학', icon:'🌍', accent:'#2E86AB', accentLight:'#7FC1DE',
    topicHint:'지구과학 현상·용어',
    cards:[['판게아','과거 지구의 모든 대륙이 뭉쳐 있던 초대륙'],['엘니뇨','태평양 해수 온도가 비정상적으로 높아지는 현상'],['조산운동','판이 부딪히며 산맥이 만들어지는 과정']],
    problem:{q:'태평양 해수온도가 비정상적으로 높아지는 현상은?',choices:['라니냐','엘니뇨','밀란코비치'],answer:'엘니뇨',explain:'엘니뇨는 무역풍 약화로 인한 해수온 상승 현상이다.'},
    tasks:['지구 시스템 상호작용 그림 다시 그려보기','지구과학 문제집 2쪽 풀기','오늘 배운 현상 한 문장으로 요약하기'],
    ideas:['대기·해양 현상 카드만 따로 묶기','지도 이미지와 함께 외우는 카드','지질시대 순서 맞히기 기능'] },
  info:{ name:'정보', icon:'💻', accent:'#00CEC9', accentLight:'#66E0DB',
    topicHint:'정보 개념·알고리즘',
    cards:[['재귀함수','자기 자신을 다시 호출하는 함수'],['이진 탐색','정렬된 데이터에서 반씩 줄여가며 찾는 방법'],['시간복잡도','입력 크기에 따라 알고리즘이 얼마나 오래 걸리는지 측정']],
    problem:{q:'정렬된 데이터에서 반씩 줄여가며 찾는 방법은?',choices:['이진 탐색','선형 탐색','재귀호출'],answer:'이진 탐색',explain:'이진 탐색은 매번 탐색 범위를 절반으로 줄이다.'},
    tasks:['알고리즘 개념 다시 정리하기','코드 한 줄씩 손으로 따라 써보기','오늘 배운 개념 한 문장으로 요약하기'],
    ideas:['알고리즘별로 카드 묶음 나누기','코드 한 줄 보고 개념 맞히기 카드','개념 설명을 그림으로 바꿔보기'] },
  math:{ name:'수학', icon:'📐', accent:'#E67E22', accentLight:'#F5B041',
    topicHint:'공식·개념',
    cards:[['피타고라스 정리','직각삼각형에서 a² + b² = c²'],['일차함수','y = ax + b 꼴의 함수, 그래프는 직선'],['소인수분해','자연수를 소수들의 곱으로 나타내는 것']],
    problem:{q:'직각삼각형에서 두 변이 3, 4일 때 빗변의 길이는?',choices:['5','6','7'],answer:'5',explain:'피타고라스 정리에 따라 3²+4²=25=5², 빗변은 5다.'},
    tasks:['오늘 배운 공식 3개 유도 과정까지 써보기','수학 문제집 2쪽 풀기','틀린 문제 풀이 과정 다시 정리하기'],
    ideas:['공식 유도 과정을 단계별로 보여주는 카드','단원별 공식 모음 페이지','계산 실수 유형 모아보기 기능'] },
  english:{ name:'영어', icon:'🔤', accent:'#D63031', accentLight:'#FF7675',
    topicHint:'단어·숙어',
    cards:[['persuade','설득하다 — persuade A to do B'],['in spite of','~에도 불구하고 (= despite)'],['available','이용할 수 있는, 시간이 있는']],
    problem:{q:"'~에도 불구하고'를 뜻하는 표현은?",choices:['in spite of','instead of','in case of'],answer:'in spite of',explain:'in spite of는 despite와 같은 뜻으로 "~에도 불구하고"다.'},
    tasks:['오늘 외운 단어 10개 스펠링 써보기','단어마다 예문 하나씩 만들어보기','헷갈리는 단어 짝 정리하기'],
    ideas:['예문과 함께 외우는 카드','발음 듣기 버튼 추가하기','헷갈리는 단어끼리 비교하는 카드'] }
};
const TYPES = {
  flashcard:{name:'암기카드',icon:'🗂️',tagline:'개념을 카드로 넘기며 외우는 사이트',
    buildGoal:'암기카드(플래시카드) 웹사이트',
    coreBehavior:'카드를 클릭하면 앞면(질문)에서 뒷면(답)으로 뒤집히는 방식이면 좋겠어.',
    p2:'카드를 클릭했을 때 뒤집히는 애니메이션이 없이 그냥 텍스트만 바뀌어서 아쉬워. 부드럽게 회전하면서 뒤집히는 느낌으로 만들어줄 수 있어?',
    f1:'카드 순서를 무작위로 섞어주는 "섞기" 버튼을 추가해줘.',
    f2:'지금까지 몇 개의 카드를 확인했는지 화면에 "3/10" 처럼 표시해줘.',
    checkItem2:'카드를 클릭하면 실제로 뒤집히나?',
    dbTable:'cards',dbColumns:'front(질문), back(답)'},
  quiz:{name:'문제풀이',icon:'📝',tagline:'문제를 풀고 바로 채점받는 사이트',
    buildGoal:'객관식 문제풀이 웹사이트',
    coreBehavior:'문제를 보여주고 보기 중 하나를 고르면 정답인지 바로 알려주는 방식이면 좋겠어.',
    p2:'정답을 골랐을 때 그냥 "정답" 또는 "오답"만 나와서 아쉬워. 왜 그 답이 맞는지 짧은 설명도 같이 보여주도록 고쳐줄 수 있어?',
    f1:'맞은 문제와 틀린 문제 개수를 화면 위에 표시해줘.',
    f2:'문제 순서를 무작위로 섞어주는 기능을 추가해줘.',
    checkItem2:'보기를 클릭하면 정답인지 바로 알려주나?',
    dbTable:'questions',dbColumns:'question(문제), choices(보기), answer(정답), explain(해설)'},
  wrongnote:{name:'오답노트',icon:'📓',tagline:'틀린 문제를 모아서 다시 정리하는 사이트',
    buildGoal:'오답노트 웹사이트',
    coreBehavior:'문제, 내가 쓴 오답, 정답과 풀이를 각각 적어서 카드 형태로 모아두는 방식이면 좋겠어.',
    p2:'카드가 전부 한 줄로만 나와서 내용이 잘 안 보여. 문제/오답/정답/풀이를 구역별로 나눠서 좀 더 보기 편하게 만들어줄 수 있어?',
    f1:'"다시 풀어볼 문제"만 따로 모아 보여주는 필터 버튼을 추가해줘.',
    f2:'새 문제를 추가할 수 있는 입력 폼을 화면에 넣어줘.',
    checkItem2:'문제와 오답, 정답이 각각 구분되어 보이나?',
    dbTable:'wrong_notes',dbColumns:'question(문제), my_answer(내가 쓴 답), answer(정답), explain(풀이)'},
  planner:{name:'공부계획+타이머',icon:'⏱️',tagline:'오늘 할 일과 집중 시간을 관리하는 사이트',
    buildGoal:'공부 계획 및 타이머 웹사이트',
    coreBehavior:'오늘 할 일을 적으면 목록에 뜨고, 버튼을 누르면 25분 집중 타이머가 시작되는 방식이면 좋겠어.',
    p2:'타이머가 끝나도 아무 표시가 없어서 몰랐어. 시간이 다 되면 화면 색이 바뀌거나 알림음이 나도록 고쳐줄 수 있어?',
    f1:'완료한 할 일에 체크 표시가 되고, 취소선이 그어지게 해줘.',
    f2:'오늘 몇 개의 할 일을 끝냈는지 화면 위에 표시해줘.',
    checkItem2:'할 일을 적으면 목록에 실제로 추가되나?',
    dbTable:'todos',dbColumns:'task(할 일), done(완료 여부)'},
  vocab:{name:'단어장',icon:'📖',tagline:'모르는 단어·용어를 등록하고 외우는 사이트',
    buildGoal:'나만의 단어장 웹사이트',
    coreBehavior:'단어와 뜻을 입력하면 목록에 추가되고, "외웠어요"를 체크하면 흐리게 표시되는 방식이면 좋겠어.',
    p2:'단어가 목록으로만 쌓여서 정말 외웠는지 확인하기 어려워. 뜻을 가렸다가 단어를 클릭하면 보여주는 "가리기 모드"를 추가해줄 수 있어?',
    f1:'아직 못 외운 단어만 모아 보여주는 필터 버튼을 추가해줘.',
    f2:'전체 중 몇 개를 외웠는지 "7/20" 처럼 화면 위에 표시해줘.',
    checkItem2:'단어를 입력하면 목록에 실제로 추가되나?',
    dbTable:'words',dbColumns:'word(단어), meaning(뜻), memorized(외움 여부)'}
};

/* ================================================================
   섹션 B — 선택 화면 로직
   ================================================================ */
let pickedSubject=null, pickedType=null;

document.querySelectorAll('#subjectGrid .pick-card').forEach(card=>{
  card.addEventListener('click',()=>{
    document.querySelectorAll('#subjectGrid .pick-card').forEach(c=>c.classList.remove('picked'));
    card.classList.add('picked'); pickedSubject=card.dataset.key; checkReady();
  });
});
document.querySelectorAll('#typeGrid .pick-card').forEach(card=>{
  card.addEventListener('click',()=>{
    document.querySelectorAll('#typeGrid .pick-card').forEach(c=>c.classList.remove('picked'));
    card.classList.add('picked'); pickedType=card.dataset.key; checkReady();
  });
});
document.getElementById('nameInput').addEventListener('input', checkReady);

function checkReady(){
  const name=document.getElementById('nameInput').value.trim();
  const btn=document.getElementById('startBtn');
  const hint=document.getElementById('startHint');
  if(name && pickedSubject && pickedType){ btn.disabled=false; hint.textContent='준비 완료! 시작해볼까요?'; }
  else { btn.disabled=true; hint.textContent='이름, 과목, 사이트 종류를 모두 골라보자'; }
}

/* ================================================================
   섹션 B — 가이드 화면 생성
   ================================================================ */
function startGuide(){
  const name=document.getElementById('nameInput').value.trim();
  const s=SUBJECTS[pickedSubject];
  const t=TYPES[pickedType];
  const folderName=pickedSubject+'-'+pickedType+'-site';

  document.documentElement.style.setProperty('--accent', s.accent);
  document.documentElement.style.setProperty('--accent-light', s.accentLight);

  document.getElementById('gIcon').textContent = s.icon+' '+t.icon;
  document.getElementById('gName').textContent = name;
  document.getElementById('gSubjectName').textContent = s.name;
  document.getElementById('gTypeName').textContent = t.name;
  document.getElementById('gTagline').textContent = t.tagline;
  document.getElementById('prepSubjectHint').textContent = '오늘 다룰 '+s.name+' '+s.topicHint+' 3~5개 정도 생각해오기';
  document.getElementById('checkItem2').textContent = t.checkItem2;
  document.getElementById('gnIcon').textContent = s.icon;

  document.getElementById('envCmd').textContent =
    'irm https://claude.ai/install.ps1 | iex\nmkdir "$HOME\\'+folderName+'"\ncd "$HOME\\'+folderName+'"\nclaude';

  // CLAUDE.md는 학생이 직접 작성 — 과목·타입 힌트만 빈칸에 표시
  document.getElementById('fill-subject').textContent = s.name;
  document.getElementById('fill-type').textContent = t.buildGoal;
  document.getElementById('claudeMdUserText').placeholder =
    '# 프로젝트 소개\n이 프로젝트는 '+s.name+' 공부를 위한 '+t.buildGoal+' 웹사이트이다.\n\n# 사용자\n(여기에 직접 써보자 — 누가 쓸 건지)\n\n# 디자인 규칙\n(색감, 분위기를 써보자)\n\n# 기능 설명\n'+t.coreBehavior+'\n\n# 주의사항\n- 어려운 전문용어 사용 금지\n- (추가로 지켜줬으면 하는 것)';

  document.getElementById('planPrompt').textContent =
    'CLAUDE.md에 적힌 대로 '+t.buildGoal+'을 만들고 싶어. 시작하기 전에 궁금한 점을 먼저 물어봐줘.';

  document.getElementById('p2').textContent = t.p2;
  document.getElementById('p3a').textContent = t.f1;
  document.getElementById('p3b').textContent = t.f2;

  // STEP6 미리보기
  const previewBox=document.getElementById('previewBox');
  previewBox.innerHTML='';
  let dbRowsText='';
  if(pickedType==='flashcard'){
    s.cards.forEach(c=>{
      const div=document.createElement('div'); div.className='mini-card';
      div.innerHTML='<div class="front">'+c[0]+'</div><div class="back">'+c[1]+'</div>';
      previewBox.appendChild(div);
    });
    dbRowsText=s.cards.map(c=>c[0]+' - '+c[1]).join('\n');
  } else if(pickedType==='quiz'){
    const p=s.problem; const div=document.createElement('div'); div.className='mini-card mini-quiz';
    div.innerHTML='<div class="q">'+p.q+'</div>'+p.choices.map(c=>'<span class="choice'+(c===p.answer?' correct':'')+'">'+c+'</span>').join('');
    previewBox.appendChild(div);
    dbRowsText='문제: '+p.q+' / 보기: '+p.choices.join(', ')+' / 정답: '+p.answer+' / 해설: '+p.explain;
  } else if(pickedType==='wrongnote'){
    const p=s.problem; const div=document.createElement('div'); div.className='mini-card mini-note';
    div.innerHTML='<div class="row"><b>문제</b> '+p.q+'</div><div class="row"><b>내가 쓴 답</b> (틀렸던 답)</div><div class="row"><b>정답</b> '+p.answer+'</div><div class="row"><b>풀이</b> '+p.explain+'</div>';
    previewBox.appendChild(div);
    dbRowsText='문제: '+p.q+' / 내가 쓴 답: (틀렸던 답) / 정답: '+p.answer+' / 풀이: '+p.explain;
  } else if(pickedType==='planner'){
    s.tasks.forEach(task=>{
      const div=document.createElement('div'); div.className='mini-todo';
      div.innerHTML='<span>☐</span><span>'+task+'</span>';
      previewBox.appendChild(div);
    });
    dbRowsText=s.tasks.map(x=>x+' - 완료: 아니오').join('\n');
  } else if(pickedType==='vocab'){
    s.cards.forEach(c=>{
      const div=document.createElement('div'); div.className='mini-card';
      div.innerHTML='<div class="front">'+c[0]+'</div><div class="back">'+c[1]+'</div>';
      previewBox.appendChild(div);
    });
    dbRowsText=s.cards.map(c=>c[0]+' - '+c[1]+' - 외움: 아니오').join('\n');
  }
  document.getElementById('dbPrompt').textContent =
    'Supabase에 "'+t.dbTable+'" 테이블을 만들어줘. 컬럼은 '+t.dbColumns+'. 그리고 아래 데이터를 넣어줘.\n'+dbRowsText+'\n사이트가 이 테이블에서 데이터를 읽어와 보여주도록 연결해줘. 데이터는 누구나 읽을 수 있게(공개 읽기) 설정해줘.';

  // 아이디어 칩
  const ideaEl=document.getElementById('ideaChips');
  ideaEl.innerHTML='';
  s.ideas.forEach(i=>{
    const span=document.createElement('span'); span.className='idea-chip'; span.textContent=i;
    ideaEl.appendChild(span);
  });

  document.getElementById('selectScreen').classList.add('hidden');
  document.getElementById('guideScreen').classList.remove('hidden');
  window.scrollTo(0,0);
  initWizard(1);
}

/* ================================================================
   섹션 B — 마법사(Wizard) UI
   ================================================================ */
let curStep = 1;
const TOTAL = 8;

function updateWizard(step){
  curStep = step;
  // 단계 표시/숨기기
  for(let i=1;i<=TOTAL;i++){
    const el=document.getElementById('s'+i);
    if(el){ el.classList.toggle('active', i===step); }
  }
  // 진행바 + 배지
  const pct = (step/TOTAL)*100;
  const fill=document.getElementById('wizFill');
  const badge=document.getElementById('wizBadge');
  const gnBadge=document.getElementById('gnStepBadge');
  const gnFill=document.getElementById('gnFill');
  if(fill) fill.style.width=pct+'%';
  if(badge) badge.textContent='STEP '+step+' / '+TOTAL;
  if(gnBadge) gnBadge.textContent='STEP '+step+' / '+TOTAL;
  if(gnFill) gnFill.style.width=pct+'%';
  window.scrollTo({top:0,behavior:'smooth'});
}

function initWizard(step){
  updateWizard(step);
}

function wNext(){
  if(curStep < TOTAL) updateWizard(curStep+1);
}

function wPrev(){
  if(curStep > 1) updateWizard(curStep-1);
}

function wDone(){
  launchConfetti();
  const s8=document.getElementById('s8');
  if(s8){
    const doneMsg=document.createElement('div');
    doneMsg.style.cssText='text-align:center;padding:30px;color:#FFC93C;font-size:22px;font-weight:700;';
    doneMsg.textContent='🎉 8단계 완료! 진짜 웹 서비스를 만들었다!';
    if(!document.getElementById('wizDoneMsg')){
      doneMsg.id='wizDoneMsg';
      s8.querySelector('.adv-wrap').prepend(doneMsg);
    }
  }
}

function backToSelect(){
  document.getElementById('guideScreen').classList.add('hidden');
  document.getElementById('selectScreen').classList.remove('hidden');
  curStep=1;
  window.scrollTo(0,0);
}

function copyPrompt(btn){
  const text=btn.parentElement.querySelector('.ptext').textContent;
  const finish=()=>{
    btn.textContent='복사됨 ✓'; btn.classList.add('copied');
    setTimeout(()=>{ btn.textContent='복사하기'; btn.classList.remove('copied'); },1800);
  };
  navigator.clipboard.writeText(text).then(finish).catch(()=>{
    const ta=document.createElement('textarea'); ta.value=text;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta); finish();
  });
}


/* === module === */

async function bootHero3D(){
  let THREE;
  try { THREE = await import('https://unpkg.com/three@0.160.0/build/three.module.js'); }
  catch(e){ return; }
  const container = document.getElementById('hero3d-wrap');
  if(!container || container.dataset.init) return;
  container.dataset.init = '1';
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(25, 16/9, 0.1, 1000);
  camera.position.set(16, 12, 20); camera.lookAt(0, 1.5, 0);
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  const lm = new THREE.LineBasicMaterial({ color:0x1a1a1a });
  const dm = new THREE.LineDashedMaterial({ color:0x888888, dashSize:0.2, gapSize:0.1, transparent:true, opacity:0.45 });
  const sm = new THREE.MeshBasicMaterial({ color:0xe4e4e2, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1 });
  function wired(geo){ const g=new THREE.Group(); g.add(new THREE.Mesh(geo,sm)); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),lm)); return g; }
  const grid = new THREE.GridHelper(30,30,0xd0d0cf,0xdcdcdc); grid.position.y=-0.01; scene.add(grid);
  const world = new THREE.Group(); scene.add(world);
  const desk = new THREE.Group();
  const top = wired(new THREE.BoxGeometry(5,.15,2.5)); top.position.y=2.5; desk.add(top);
  [[-2.3,1.25,-1.1],[2.3,1.25,-1.1],[-2.3,1.25,1.1],[2.3,1.25,1.1]].forEach(p=>{ const l=wired(new THREE.BoxGeometry(.15,2.5,.15)); l.position.set(...p); desk.add(l); });
  const mg = new THREE.PlaneGeometry(2.4,1.4);
  const m1 = new THREE.LineSegments(new THREE.EdgesGeometry(mg),lm); m1.position.set(-1.3,4,-0.8); m1.rotation.y=0.4; desk.add(m1);
  const m2 = new THREE.LineSegments(new THREE.EdgesGeometry(mg),lm); m2.position.set(1.3,4,-0.8); m2.rotation.y=-0.4; desk.add(m2);
  const ph = wired(new THREE.BoxGeometry(.45,.08,.85)); ph.position.set(0,3,1.2); ph.rotation.y=0.25; desk.add(ph);
  world.add(desk);
  const vol = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(7,5.5,6)),dm);
  vol.position.y=2.75; vol.computeLineDistances(); world.add(vol);
  let scan=0, dir=1;
  const PG=16, pix=new Uint8Array(PG*PG*4);
  const tex=new THREE.DataTexture(pix,PG,PG);
  tex.minFilter=THREE.NearestFilter; tex.magFilter=THREE.NearestFilter;
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(30,30,PG,PG), new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0.25,side:THREE.DoubleSide}));
  plane.rotation.x=-Math.PI/2; plane.position.y=0.01; scene.add(plane);
  function animate(){
    requestAnimationFrame(animate);
    const t=Date.now()*.001;
    m1.position.y=4+Math.sin(t*.8)*.03; m2.position.y=4+Math.sin(t*.8+.5)*.03;
    ph.position.y=3+Math.sin(t*1.2)*.04; world.rotation.y=Math.sin(t*.1)*.05;
    for(let x=0;x<PG;x++) for(let y=0;y<PG;y++){
      const i=(y*PG+x)*4, d=Math.sqrt((x-8)**2+(y-8)**2);
      if(d<=scan){ const k=1-d/Math.max(scan,.001); pix[i]=17;pix[i+1]=17;pix[i+2]=17;pix[i+3]=Math.floor(k*160); }
      else if(d<=scan+2){ const k=1-(d-scan)/2; pix[i]=26;pix[i+1]=26;pix[i+2]=26;pix[i+3]=Math.floor(k*50); }
      else pix[i+3]=0;
    }
    tex.needsUpdate=true; scan+=dir*.075;
    if(scan>=11||scan<0){ dir*=-1; scan+=dir*.3; }
    renderer.render(scene,camera);
  }
  function fit(){
    const w=container.clientWidth||1, h=container.clientHeight||1;
    if(w >= 900) world.position.set(3.4, 0, -2.0);
    else if(w >= 640) world.position.set(2.4, 0, -1.4);
    else world.position.set(0.6, 0, -0.4);
    camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
  }
  new ResizeObserver(fit).observe(container); fit(); animate();
}
bootHero3D();


/* ================================================================
   Section A — 페이지 위저드
   ================================================================ */
const A_PAGES = ['step0','step0b','step0c','step1','step1b','step2','step2b','step3','stepNext'];
const A_LABELS = ['시작','바이브코딩','3단계 레벨업','실습 1 · 규칙 실험실','CLAUDE.md','실습 2 · 비교 체험','하네스 엔지니어링 6축','실습 3 · 나만의 규칙','다음 시간 예고'];
let aCur = 0;

function showAPage(n) {
  A_PAGES.forEach((id, i) => {
    const el = document.getElementById(id);
    if(el) el.classList.toggle('a-active', i === n);
  });
  aCur = n;
  const total = A_PAGES.length;
  // 진행바
  const fill = document.getElementById('aProgressFill');
  if(fill) fill.style.width = ((n + 1) / total * 100) + '%';
  // 라벨
  const lbl = document.getElementById('aPageLabel');
  const cnt = document.getElementById('aPageCount');
  if(lbl) lbl.textContent = A_LABELS[n];
  if(cnt) cnt.textContent = String(n + 1).padStart(2,'0') + ' / ' + String(total).padStart(2,'0');
  // 버튼
  const prevBtn = document.getElementById('aPrevBtn');
  const nextBtn = document.getElementById('aNextBtn');
  if(prevBtn) prevBtn.disabled = n === 0;
  if(nextBtn) nextBtn.textContent = n === total - 1 ? '완료 ✓' : '다음 →';
  // stepNav 활성화 (a-active: 펄스 애니메이션, active: 지속 강조)
  document.querySelectorAll('#stepNav .step-dot').forEach((dot, i) => {
    dot.classList.toggle('a-active', i === n);
    dot.classList.toggle('active', i === n);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function aNext() {
  if(aCur < A_PAGES.length - 1) showAPage(aCur + 1);
}
function aPrev() {
  if(aCur > 0) showAPage(aCur - 1);
}

// module 밖 onclick 에서 접근할 수 있도록 전역 노출
window.showAPage = showAPage;
window.aNext = aNext;
window.aPrev = aPrev;

// Section A 초기화
document.addEventListener('DOMContentLoaded', function(){
  const bottomNav = document.getElementById('aBottomNav');
  if(bottomNav) bottomNav.classList.add('show');
  document.body.classList.add('tab-a');
  showAPage(0);
});
/* ================================================================
   퀴즈 UI
   ================================================================ */
function selectOpt(qid, idx) {
  document.querySelectorAll('#qopts-' + qid + ' .quiz-opt').forEach(el => el.classList.remove('selected'));
  document.getElementById('qopts-' + qid).children[idx].classList.add('selected');
  document.getElementById('qbtn-' + qid).disabled = false;
}
function checkMCQ(qid, correct) {
  const opts = document.querySelectorAll('#qopts-' + qid + ' .quiz-opt');
  const sel = [...opts].findIndex(el => el.classList.contains('selected'));
  opts.forEach((el, i) => {
    el.onclick = null;
    if (i === correct) el.classList.add('correct');
    else if (i === sel && i !== correct) el.classList.add('wrong');
  });
  document.getElementById('qbtn-' + qid).disabled = true;
  if (sel === correct) {
    document.getElementById('qfb-ok-' + qid).classList.add('show');
  } else {
    document.getElementById('qfb-ng-' + qid).classList.add('show');
  }
}
function saveOpen(qid) {
  const val = document.getElementById('qinput-' + qid).value.trim();
  if (!val) return;
  document.getElementById('qinput-' + qid).disabled = true;
  document.getElementById('qfb-ok-' + qid).style.display = 'block';
}

/* ================================================================
   애니메이션 보조 JS
   ================================================================ */

// 페이지 전환 시 leaving 클래스 처리
const _origShowAPage = window.showAPage;
window.showAPage = function(n) {
  // 기존 active 페이지에 leaving 클래스
  const pages = ['step0','step0b','step0c','step1','step1b','step2','step2b','step3','stepNext'];
  pages.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.classList.contains('a-active')) {
      el.classList.add('page-leaving');
      setTimeout(() => { el.classList.remove('page-leaving'); }, 200);
    }
  });
  // progress fill glow
  const fill = document.getElementById('aProgressFill');
  if (fill) {
    fill.classList.remove('glow');
    void fill.offsetWidth; // reflow
    fill.classList.add('glow');
    setTimeout(() => fill.classList.remove('glow'), 700);
  }
  _origShowAPage(n);
};

// 히어로 숫자 카운트업
function countUp(el, target, suffix, duration) {
  const isNum = /^\d+$/.test(target);
  if (!isNum) { el.textContent = target; return; }
  const end = parseInt(target);
  const step = Math.ceil(duration / end);
  let cur = 0;
  const t = setInterval(() => {
    cur = Math.min(cur + 1, end);
    el.textContent = cur + suffix;
    if (cur >= end) clearInterval(t);
  }, step);
}

document.addEventListener('DOMContentLoaded', () => {
  // 히어로 stat 카운트업
  setTimeout(() => {
    const stats = [
      { el: document.querySelector('.hero-stat:nth-child(1) .hs-num'), val: '0', suffix: '줄' },
      { el: document.querySelector('.hero-stat:nth-child(2) .hs-num'), val: '3', suffix: '단계' },
      { el: document.querySelector('.hero-stat:nth-child(3) .hs-num'), val: '1', suffix: '개' },
    ];
    stats.forEach(({ el, val, suffix }, i) => {
      if (!el) return;
      setTimeout(() => countUp(el, val, suffix, 600), i * 150);
    });
  }, 400);

  // 하단 nav 첫 등장 — 한 번만
  const nav = document.getElementById('aBottomNav');
  if (nav) {
    nav.classList.add('show');
    setTimeout(() => nav.style.animation = '', 600);
  }
});

/* ================================================================
   전면 개선 JS
   ================================================================ */

// ── 다크모드 ─────────────────────────────────────────────────────────────────
(function(){
  const saved = localStorage.getItem('darkMode');
  if(saved === 'true') document.body.classList.add('dark-mode');
})();

function toggleDark(){
  const on = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', on);
  const btn = document.getElementById('darkToggle');
  if(btn) btn.textContent = on ? '☀️' : '🌙';
}

// ── localStorage 진행 저장 ────────────────────────────────────────────────────
const _origShowAPage2 = window.showAPage;
window.showAPage = function(n){
  _origShowAPage2(n);
  localStorage.setItem('aCurPage', n);
  updateQuizScore();
  // 마지막 페이지 + 다음 클릭 → 완료 화면
  if(n === A_PAGES.length - 1){
    const nextBtn = document.getElementById('aNextBtn');
    if(nextBtn) nextBtn.onclick = function(){ showCompletion(); };
  } else {
    const nextBtn = document.getElementById('aNextBtn');
    if(nextBtn) nextBtn.onclick = function(){ aNext(); };
  }
};

// ── 키보드 내비게이션 ─────────────────────────────────────────────────────────
let keyHintTimer;
document.addEventListener('keydown', function(e){
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
  if(document.getElementById('completionScreen')?.classList.contains('show')) return;
  if(e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); aNext(); showKeyHint(); }
  if(e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); aPrev(); showKeyHint(); }
});

function showKeyHint(){
  const h = document.getElementById('keyHint');
  if(!h) return;
  h.classList.add('show');
  clearTimeout(keyHintTimer);
  keyHintTimer = setTimeout(()=> h.classList.remove('show'), 1800);
}

// ── 퀴즈 점수 집계 ───────────────────────────────────────────────────────────
let quizCorrect = 0;
let quizTotal   = 0;

const _origCheckMCQ = window.checkMCQ;
window.checkMCQ = function(qid, correct){
  const opts = document.querySelectorAll('#qopts-' + qid + ' .quiz-opt');
  const sel = [...opts].findIndex(el => el.classList.contains('selected'));
  const alreadyDone = [...opts].some(el => el.classList.contains('correct') || el.classList.contains('wrong'));
  if(!alreadyDone) {
    quizTotal++;
    if(sel === correct) quizCorrect++;
    updateQuizScore();
  }
  _origCheckMCQ(qid, correct);
  syncProgress();
};

function updateQuizScore(){
  const el = document.getElementById('quizScore');
  if(el && quizTotal > 0){
    el.style.display = 'block';
    el.textContent = '퀴즈 ' + quizCorrect + ' / ' + quizTotal;
  }
}

// ── 인터랙티브 CLAUDE.md 빌더 ────────────────────────────────────────────────
function updateCLAUDEmd(){
  const g = id => (document.getElementById(id)||{}).value || '';
  const name     = g('cb-name')     || '[이름/학년 입력]';
  const goal     = g('cb-goal')     || '[만들려는 것 입력]';
  const color    = g('cb-color')    || '[색상 테마 입력]';
  const mood     = g('cb-mood')     || '[분위기 입력]';
  const features = g('cb-features') || '[기능 입력]';
  const nope     = g('cb-nope')     || '[제약 사항 입력]';

  const featList = features.split(/[,，、]/).map(f=>f.trim()).filter(Boolean)
                           .map((f,i)=>`${i+1}. ${f}`).join('\n');
  const nopeList = nope.split(/[,，、]/).map(f=>f.trim()).filter(Boolean)
                       .map(f=>`- ${f}`).join('\n');

  const md = `# CLAUDE.md — 나만의 AI 협업 규칙\n\n## 나는 누구인가\n- 이름/학년: ${name}\n- 만드는 것: ${goal}\n\n## 디자인 규칙\n- 색상 테마: ${color}\n- 분위기: ${mood}\n\n## 꼭 포함해야 할 기능\n${featList}\n\n## 절대 하지 말 것\n${nopeList}\n\n## AI에게 부탁하는 방식\n- 코드를 처음 만들 때: 한 번에 완성본을 만들어달라고 한다\n- 수정할 때: 어떤 부분을 어떻게 바꾸고 싶은지 구체적으로 말한다\n- 모르는 게 있을 때: "왜 이렇게 했어?" 라고 질문한다`;

  const pre = document.getElementById('cb-output');
  if(pre) pre.textContent = md;
  localStorage.setItem('claudeMd', md);
}

function copyCLAUDEmd(){
  const pre = document.getElementById('cb-output');
  if(!pre) return;
  navigator.clipboard.writeText(pre.textContent).then(()=>{
    const btn = document.querySelector('.cb-copy-btn');
    if(btn){ btn.textContent = '복사됨 ✓'; btn.classList.add('copied'); }
    setTimeout(()=>{ if(btn){ btn.textContent = '복사하기'; btn.classList.remove('copied'); } }, 2000);
  });
}

// ── 완료 화면 ─────────────────────────────────────────────────────────────────
function showCompletion(){
  const sc = document.getElementById('completionScreen');
  if(!sc) return;
  // 점수 주입
  const sn = document.getElementById('compScoreNum');
  if(sn) sn.textContent = quizTotal > 0 ? quizCorrect + ' / ' + quizTotal : '—';
  sc.classList.add('show');
  // CLAUDE.md 요약
  const md = localStorage.getItem('claudeMd');
  const mdEl = document.getElementById('compClaudeMd');
  if(mdEl && md) mdEl.textContent = md;
  sc.scrollTop = 0;
}

function closeCompletion(){
  document.getElementById('completionScreen')?.classList.remove('show');
  showAPage(0);
}

function goToSectionB(){
  document.getElementById('completionScreen')?.classList.remove('show');
  switchTab('B');
}

// ── 초기화 ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function(){
  // 다크모드 버튼 아이콘
  const btn = document.getElementById('darkToggle');
  if(btn) btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';

  // 저장된 진도 복원 — 초기화 과정에서 showAPage(0)이 저장값을 덮어쓰므로
  // 파일 파싱 시점에 미리 읽어둔 SAVED_A_PAGE / SAVED_TAB을 쓴다.
  if(SAVED_A_PAGE > 0 && SAVED_A_PAGE < A_PAGES.length) showAPage(SAVED_A_PAGE);
  if(SAVED_TAB === 'B' || SAVED_TAB === 'C') switchTab(SAVED_TAB);

  // CLAUDE.md 빌더 이벤트
  ['cb-name','cb-goal','cb-color','cb-mood','cb-features','cb-nope'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', updateCLAUDEmd);
  });
  updateCLAUDEmd();

  // 저장된 CLAUDE.md 복원
  const saved_md = localStorage.getItem('claudeMd');
  if(saved_md){
    const pre = document.getElementById('cb-output');
    if(pre) pre.textContent = saved_md;
  }

  // quizScore 초기 숨김
  const qs = document.getElementById('quizScore');
  if(qs) qs.style.display = 'none';
});

/* ================================================================
   Supabase 연동 — 진도 저장 + 학생 갤러리 (3단계)
   supabase-config.js에 url/anonKey가 없으면 전부 조용히 꺼진다.
   ================================================================ */
const SB = window.SUPABASE_CONFIG || { url:'', anonKey:'' };
function sbReady(){ return !!(SB.url && SB.anonKey); }

async function sbFetch(path, opts = {}){
  const res = await fetch(SB.url + '/rest/v1/' + path, {
    ...opts,
    headers: {
      'apikey': SB.anonKey,
      'Authorization': 'Bearer ' + SB.anonKey,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  if(!res.ok) throw new Error('Supabase 오류 ' + res.status);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── 학생 식별 — 이름을 입력했으면 이름, 아니면 익명 키 ──────────────
function studentKey(){
  let key = localStorage.getItem('studentKey');
  if(!key){
    key = 'anon-' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('studentKey', key);
  }
  const name = (localStorage.getItem('studentName') || '').trim();
  return name ? name : key;
}
// 섹션 B 이름 입력을 학생 이름으로 기억
document.addEventListener('DOMContentLoaded', ()=>{
  const ni = document.getElementById('nameInput');
  if(ni){
    if(localStorage.getItem('studentName')) ni.value = localStorage.getItem('studentName');
    ni.addEventListener('input', ()=> localStorage.setItem('studentName', ni.value.trim()));
  }
});

// ── 진도 자동 저장 (2초 디바운스 업서트) ─────────────────────────────
let _syncTimer = null;
function syncProgress(){
  if(!sbReady()) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(()=>{
    sbFetch('progress?on_conflict=student_key', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify([{
        student_key: studentKey(),
        student_name: localStorage.getItem('studentName') || '',
        a_page: (typeof aCur !== 'undefined' ? aCur : 0),
        quiz_correct: (typeof quizCorrect !== 'undefined' ? quizCorrect : 0),
        quiz_total: (typeof quizTotal !== 'undefined' ? quizTotal : 0),
        updated_at: new Date().toISOString()
      }])
    }).catch(()=>{ /* 네트워크 실패 시 조용히 무시 — localStorage가 이미 지킨다 */ });
  }, 2000);
}
// 페이지 이동·퀴즈 채점 때마다 저장
const _origShowAPage3 = window.showAPage;
window.showAPage = function(n){ _origShowAPage3(n); syncProgress(); };

// ── 갤러리 ───────────────────────────────────────────────────────────
let _galleryInited = false;
function initGallery(){
  // 과목/종류 select 채우기 (최초 1회)
  if(!_galleryInited){
    _galleryInited = true;
    const subSel = document.getElementById('gsSubject');
    const typeSel = document.getElementById('gsType');
    if(subSel) subSel.innerHTML = Object.entries(SUBJECTS).map(([k,v])=>'<option value="'+k+'">'+v.icon+' '+v.name+'</option>').join('');
    if(typeSel) typeSel.innerHTML = Object.entries(TYPES).map(([k,v])=>'<option value="'+k+'">'+v.icon+' '+v.name+'</option>').join('');
    const gn = document.getElementById('gsName');
    if(gn && localStorage.getItem('studentName')) gn.value = localStorage.getItem('studentName');
  }
  const notice = document.getElementById('galleryNotice');
  const form = document.getElementById('galleryForm');
  if(!sbReady()){
    if(notice) notice.classList.remove('hidden');
    if(form) form.classList.add('hidden');
    return;
  }
  if(notice) notice.classList.add('hidden');
  if(form) form.classList.remove('hidden');
  loadGallery();
  if(document.body.classList.contains('mentor-mode')) loadProgressBoard();
}

async function loadGallery(){
  const grid = document.getElementById('galleryGrid');
  if(!grid || !sbReady()) return;
  grid.innerHTML = '<div class="g-empty">불러오는 중…</div>';
  try{
    const rows = await sbFetch('student_sites?select=*&order=created_at.desc&limit=100');
    if(!rows || !rows.length){
      grid.innerHTML = '<div class="g-empty">아직 등록된 사이트가 없어요. 첫 번째로 등록해보자!</div>';
      return;
    }
    grid.innerHTML = '';
    rows.forEach(r=>{
      const s = SUBJECTS[r.subject] || { icon:'🌐', name:r.subject || '기타' };
      const t = TYPES[r.site_type] || { icon:'', name:r.site_type || '' };
      const a = document.createElement('a');
      a.className = 'g-card';
      a.href = r.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.innerHTML = '<div class="g-ic">' + s.icon + ' ' + t.icon + '</div>'
        + '<div class="g-name"></div>'
        + '<div class="g-meta">' + s.name + ' · ' + t.name + '</div>'
        + '<div class="g-url"></div>';
      a.querySelector('.g-name').textContent = r.name + ' 의 사이트';
      a.querySelector('.g-url').textContent = r.url.replace(/^https?:\/\//,'');
      grid.appendChild(a);
    });
  }catch(e){
    grid.innerHTML = '<div class="g-empty">갤러리를 불러오지 못했어요. 잠시 후 다시 시도해보자.</div>';
  }
}

async function submitSite(){
  const hint = document.getElementById('gsHint');
  const name = document.getElementById('gsName').value.trim();
  const url  = document.getElementById('gsUrl').value.trim();
  const subject = document.getElementById('gsSubject').value;
  const siteType = document.getElementById('gsType').value;
  if(!name || !url){ hint.textContent = '이름과 사이트 주소를 모두 적어보자!'; return; }
  if(!/^https:\/\/.+\..+/.test(url)){ hint.textContent = '주소는 https:// 로 시작해야 해요. (예: https://my-site.vercel.app)'; return; }
  const btn = document.getElementById('gsSubmitBtn');
  btn.disabled = true; hint.textContent = '등록 중…';
  try{
    await sbFetch('student_sites', {
      method: 'POST',
      body: JSON.stringify([{ name: name, subject: subject, site_type: siteType, url: url }])
    });
    hint.textContent = '등록 완료! 아래 갤러리에서 확인해보자 🎉';
    document.getElementById('gsUrl').value = '';
    localStorage.setItem('studentName', name);
    loadGallery();
  }catch(e){
    hint.textContent = '등록에 실패했어요. 주소를 확인하고 다시 시도해보자.';
  }finally{
    btn.disabled = false;
  }
}

// ── 멘토 모드 — 학생 진도 현황 ───────────────────────────────────────
async function loadProgressBoard(){
  const board = document.getElementById('progressBoard');
  if(!board) return;
  if(!sbReady()){ board.textContent = 'Supabase 연결 후 학생들의 진도·퀴즈 점수가 여기에 표시됩니다.'; return; }
  board.textContent = '불러오는 중…';
  try{
    const rows = await sbFetch('progress?select=*&order=updated_at.desc&limit=100');
    if(!rows || !rows.length){ board.textContent = '아직 저장된 진도가 없어요.'; return; }
    const total = (typeof A_PAGES !== 'undefined') ? A_PAGES.length : 9;
    board.innerHTML = '<table class="mp-table"><thead><tr><th>학생</th><th>1차시 진도</th><th>퀴즈</th><th>마지막 활동</th></tr></thead><tbody>'
      + rows.map(r=>{
          const nm = (r.student_name || r.student_key || '?');
          const when = r.updated_at ? new Date(r.updated_at).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
          return '<tr><td>'+ nm.replace(/</g,'&lt;') +'</td><td>'+ ((r.a_page||0)+1) +' / '+ total +'</td><td>'+ (r.quiz_correct||0) +' / '+ (r.quiz_total||0) +'</td><td>'+ when +'</td></tr>';
        }).join('')
      + '</tbody></table>';
  }catch(e){
    board.textContent = '진도 현황을 불러오지 못했어요.';
  }
}
