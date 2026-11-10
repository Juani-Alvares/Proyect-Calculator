const expression = document.querySelector('#expression');
const result = document.querySelector('#result');
const mode = document.querySelector('#mode');
const memoryMark = document.querySelector('#memory');
let input = '', answer = 0, memory = 0, degrees = true, inverse = false, second = false;

const format = n => Number.isFinite(n) ? Number(n.toPrecision(12)).toString() : 'Error';
const angle = x => degrees ? x * Math.PI / 180 : x;
const unangle = x => degrees ? x * 180 / Math.PI : x;
function factorial(n) { if(n < 0 || !Number.isInteger(n) || n > 170) throw Error(); let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
function transformMath(text) {
  return text.replaceAll('π','pi').replaceAll('×','*').replaceAll('÷','/')
    .replace(/(\d|\)|(?<![a-zA-Z])(?:pi|e|Ans))(?=(sin|cos|tan|log|ln|sqrt|abs|factorial|reciprocal|square|negate|sinh|cosh|tanh|asin|acos|atan|\(|pi|e))/g,'$1*')
    .replace(/(\)|(?<![a-zA-Z])(?:pi|e|Ans))(?=\d)/g,'$1*');
}
function calculate(text=input) {
  if (!text) return 0;
  const exp = transformMath(text).replace(/\^/g,'**').replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
  const scope = { pi:Math.PI, e:Math.E, Ans:answer, sin:x=>Math.sin(angle(x)), cos:x=>Math.cos(angle(x)), tan:x=>Math.tan(angle(x)), asin:x=>unangle(Math.asin(x)), acos:x=>unangle(Math.acos(x)), atan:x=>unangle(Math.atan(x)), sinh:Math.sinh, cosh:Math.cosh, tanh:Math.tanh, log:Math.log10, ln:Math.log, sqrt:Math.sqrt, abs:Math.abs, factorial, reciprocal:x=>1/x, square:x=>x*x, negate:x=>-x };
  const keys = Object.keys(scope); return Function(...keys,`"use strict"; return (${exp})`)(...keys.map(k=>scope[k]));
}
function render(preview=true) {
  expression.textContent = input.replaceAll('*', '×').replaceAll('/', '÷') || '0';
  if(preview && input){try{result.textContent=format(calculate())}catch{result.textContent='…'}}
  else result.textContent=input ? result.textContent : '0';
  mode.textContent=degrees?'DEG':'RAD';
  document.querySelector('#angle').textContent=mode.textContent;
  memoryMark.style.visibility=memory?'visible':'hidden';
  for (const [id, active] of [['inverse', inverse], ['secondary', second]]) {
    const button = document.querySelector(`#${id}`);
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed', String(active));
  }
  for (const name of ['sin', 'cos', 'tan']) {
    document.querySelector(`[data-fn="${name}"]`).textContent=inverse?`${name}⁻¹`:second?`${name}h`:name;
  }
  document.querySelector('[data-fn="log"]').textContent=second?'10ˣ':'log';
  document.querySelector('[data-fn="ln"]').textContent=second?'eˣ':'ln';
  expression.scrollLeft=expression.scrollWidth;
}
function append(v){ const maps={pi:'π',e:'e'}; input += maps[v] || v; render(); }
function toggleSign() {
  // Sin un número activo, el signo menos inicia el próximo valor.
  if (!input || /[+*/^(]$/.test(input)) { input += '-'; return render(); }

  // Cambia solo el último número para no modificar el resto de la operación.
  const negative = input.match(/\(-([0-9]+(?:\.[0-9]+)?)\)$/);
  if (negative) input = input.slice(0, -negative[0].length) + negative[1];
  else {
    const number = input.match(/([0-9]+(?:\.[0-9]+)?)$/);
    if (number) input = input.slice(0, -number[0].length) + `(-${number[1]})`;
    else input = `-(${input})`;
  }
  render();
}
function functionInput(name) { const trig=['sin','cos','tan']; const inverseMap={sin:'asin',cos:'acos',tan:'atan'}; if(inverse && trig.includes(name)) name=inverseMap[name]; else if(second && trig.includes(name)) name=`${name}h`; else if(second && name==='log') name='10^'; else if(second && name==='ln') name='exp'; if(name==='factorial'||name==='reciprocal'||name==='square'||name==='negate'){input=`${name}(${input || '0'})`}else if(name==='10^'){input+='10^'}else if(name==='exp'){input+='e^'}else input+=`${name}(`; inverse=false; second=false; render(); }
document.querySelector('.controls').addEventListener('click', e=>{const b=e.target.closest('button');if(!b)return;const {value,fn,action}=b.dataset;if(value)return append(value);if(fn)return functionInput(fn);if(b.id==='angle'){degrees=!degrees;return render()}if(b.id==='inverse'){inverse=!inverse;return render()}if(b.id==='secondary'){second=!second;return render()}if(action==='clear'){input='';result.textContent='0'}if(action==='backspace'){input=input.slice(0,-1)}if(action==='negate')return toggleSign();if(action==='equals'){try{answer=calculate();input=format(answer);result.textContent=format(answer)}catch{result.textContent='Error'}}if(action==='ans')append('Ans');if(action==='memory-clear')memory=0;if(action==='memory-recall')append(`(${memory})`);if(action==='memory-add'||action==='memory-subtract'){try{memory+=(action==='memory-add'?1:-1)*calculate()}catch{}}render(action!=='equals')});
function setTheme(dark) {
  document.body.classList.toggle('dark',dark);
  const button=document.querySelector('#theme');
  button.textContent=dark?'☼':'☾';
  button.setAttribute('aria-label',dark?'Activar tema claro':'Activar tema oscuro');
  button.title=button.getAttribute('aria-label');
  document.querySelector('meta[name="theme-color"]').setAttribute('content',dark?'#101b1c':'#e7eeeb');
}
try { const saved=localStorage.getItem('nova-theme'); if(saved) setTheme(saved==='dark'); } catch {}
document.querySelector('#theme').addEventListener('click',()=>{
  setTheme(!document.body.classList.contains('dark'));
  try { localStorage.setItem('nova-theme',document.body.classList.contains('dark')?'dark':'light'); } catch {}
});
window.addEventListener('keydown',e=>{
  if(e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input, textarea, select, [contenteditable="true"]')) return;
  if(e.key==='Enter' && e.target.closest('button')) return;
  if(e.key==='Enter'||e.key==='='){e.preventDefault();document.querySelector('[data-action="equals"]').click()}
  else if(e.key==='Escape')document.querySelector('[data-action="clear"]').click();
  else if(e.key==='Backspace'){e.preventDefault();document.querySelector('[data-action="backspace"]').click()}
  else if(e.key.length===1 && '0123456789.+-*/^()%'.includes(e.key)){e.preventDefault();append(e.key)}
});render();
