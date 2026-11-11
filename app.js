/* Dependency-free SVG dashboard. All financial values are in KRW 100 million. */
(() => {
'use strict';
const DATA=window.BUDGET_DATA;
const COLORS=['#6375ef','#a576e7','#35bcb1','#ffac67','#f27a9b','#59b6dc','#d1a544','#8096b0'];
const sectorColors={'전력운영':COLORS[0],'방위력개선':COLORS[1],'병무행정':COLORS[2]};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>n.toLocaleString('ko-KR',{maximumFractionDigits:0});
const signed=n=>(n>0?'+':'')+num(n);
const compact=n=>{const a=Math.abs(n),sign=n<0?'−':'';return a>=10000?`${sign}${(a/10000).toLocaleString('ko-KR',{maximumFractionDigits:1})}조`:`${sign}${num(a)}억`;};
const full=n=>{const a=Math.abs(n);return (n<0?'−':'')+(a>=10000?`${Math.floor(a/10000)}조 ${num(a%10000)}억`:`${num(a)}억`);};
const total=(rows,key)=>rows.reduce((s,r)=>s+r[key],0);
const rate=(a,b)=>a===0?null:(b-a)/Math.abs(a)*100;
const percent=n=>n===null?'—':(n>0?'+':'')+n.toFixed(1)+'%';
const group=(rows,key)=>Object.entries(rows.reduce((a,r)=>{const k=r[key];if(!a[k])a[k]={name:k,y2026:0,y2027:0};a[k].y2026+=r.y2026;a[k].y2027+=r.y2027;return a;},{})).map(([,v])=>v);
const txt=(x,y,text,attrs='')=>`<text x="${x}" y="${y}" fill="#8992a9" font-size="11" ${attrs}>${esc(text)}</text>`;
const rect=(x,y,w,h,fill,tip='',rx=4)=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${Math.max(0,h)}" rx="${rx}" fill="${fill}"${tip?` data-tip="${esc(tip)}" tabindex="0" role="img" aria-label="${esc(tip)}"`:''}/>`;
function svg(id,body,h=290){$(id).innerHTML=`<svg viewBox="0 0 560 ${h}" role="img" aria-label="${esc($(id).closest('.panel').querySelector('h3').textContent)}">${body}</svg>`;}
function emptyChart(id,message='표시할 데이터가 없습니다.'){svg(id,txt(280,145,message,'text-anchor="middle"'));}
function dual(id,rows,h=290,c1='#a6b6ff',c2='#5765f2'){
 if(!rows.length)return emptyChart(id);
 const values=rows.flatMap(r=>[r.y2026,r.y2027]),min=Math.min(0,...values),max=Math.max(0,...values)||1,left=185,right=510,step=(h-40)/rows.length;
 const X=v=>left+(v-min)/(max-min)*(right-left),zero=X(0);
 let b='';for(let i=0;i<=3;i++){const x=left+(right-left)*i/3;b+=`<line x1="${x}" x2="${x}" y1="5" y2="${h-22}" stroke="#edf0f6"/>`+txt(x,h-4,compact(min+(max-min)*i/3),'text-anchor="middle" font-size="11"');}
 rows.forEach((r,i)=>{const y=12+i*step,bar=Math.min(13,step*.27);b+=txt(left-12,y+bar+5,r.name,'text-anchor="end" font-size="12"');b+=rect(Math.min(zero,X(r.y2026)),y,Math.abs(X(r.y2026)-zero),bar,c1,`${r.name}\n2026년: ${num(r.y2026)}억 원`);b+=rect(Math.min(zero,X(r.y2027)),y+bar+4,Math.abs(X(r.y2027)-zero),bar,c2,`${r.name}\n2027년: ${num(r.y2027)}억 원`);});svg(id,b,h);
}
function diverging(id,rows,key,h=290){
 if(!rows.length)return emptyChart(id);
 const left=185,width=280,min=Math.min(0,...rows.map(r=>r[key])),max=Math.max(0,...rows.map(r=>r[key]))||1,X=v=>left+(v-min)/(max-min)*width,zero=X(0),step=(h-30)/rows.length;
 let b=`<line x1="${zero}" x2="${zero}" y1="0" y2="${h-15}" stroke="#dae0ed"/>`;
 rows.forEach((r,i)=>{const y=i*step+8,v=r[key],bar=Math.min(23,step*.58),bw=Math.abs(X(v)-zero);b+=txt(left-10,y+bar*.7,r.name,'text-anchor="end" font-size="12"');b+=rect(Math.min(zero,X(v)),y,bw,bar,v<0?'#53bdd1':'#ff9c74',`${r.name}\n${signed(v)}억 원`);b+=txt(550,y+bar*.7,compact(v),'text-anchor="end" font-size="11"');});svg(id,b,h);
}
function donut(rows,key){
 const data=group(rows.filter(r=>r[key]>0),'sector'),sum=total(data,key);if(!sum)return emptyChart('donut-chart','양수 재원이 없습니다.');
 let offset=0,b='';const radius=91,c=2*Math.PI*radius;
 data.forEach(r=>{const part=r[key]/sum,arc=part*c;b+=`<circle cx="160" cy="140" r="${radius}" fill="none" stroke="${sectorColors[r.name]}" stroke-width="35" stroke-dasharray="${arc} ${c-arc}" stroke-dashoffset="${-offset*c}" transform="rotate(-90 160 140)" data-tip="${esc(`${r.name}\n${num(r[key])}억 원 · ${(part*100).toFixed(2)}%`)}"/>`;offset+=part;});
 b+=txt(160,130,'양수 재원 합계','text-anchor="middle"')+`<text x="160" y="160" text-anchor="middle" fill="#303950" font-size="24" font-weight="700">${compact(sum)}</text>`;
 data.forEach((r,i)=>{const y=85+i*68;b+=rect(310,y-11,9,9,sectorColors[r.name])+txt(330,y,r.name)+`<text x="330" y="${y+23}" fill="#353e58" font-size="17" font-weight="700">${(r[key]/sum*100).toFixed(1)}%</text>`+txt(450,y+23,compact(r[key]),'font-size="10"');});svg('donut-chart',b);
}
function treemap(rows,key){
 const groups=group(rows.filter(r=>r[key]>0),'group').sort((a,b)=>b[key]-a[key]);const sum=total(groups,key);if(!sum)return emptyChart('treemap-chart','양수 재원이 없습니다.');
 let x=0,y=0,w=554,h=280,b='';
 groups.forEach((r,i)=>{const remaining=total(groups.slice(i),key),p=r[key]/remaining;let rw,rh;if(w>h){rw=w*p;rh=h;}else{rw=w;rh=h*p;}const tip=`${r.name}\n${num(r[key])}억 원 · ${(r[key]/sum*100).toFixed(1)}%`;b+=rect(x+2,y+2,rw-4,rh-4,COLORS[i%COLORS.length],tip,7);
 if(rw>65&&rh>35){const maxLen=Math.floor((rw-16)/13),name=r.name.length>maxLen?r.name.slice(0,Math.max(1,maxLen-1))+'…':r.name;b+=`<text x="${x+12}" y="${y+24}" fill="white" font-size="12" font-weight="600" pointer-events="none">${esc(name)}</text>`;if(rh>65)b+=`<text x="${x+12}" y="${y+46}" fill="#ffffffda" font-size="11" pointer-events="none">${compact(r[key])}</text>`;}
 if(w>h){x+=rw;w-=rw;}else{y+=rh;h-=rh;}});svg('treemap-chart',b);
}
function scatter(rows){
 const data=rows.filter(r=>r.y2026>0&&r.y2027>0);if(!data.length)return emptyChart('scatter-chart','양 연도 양수 프로그램이 없습니다.');
 const maxX=Math.max(...data.map(r=>r.y2027))*1.1||1,rs=data.map(r=>rate(r.y2026,r.y2027)),minY=Math.min(0,...rs)-5,maxY=Math.max(5,...rs)+8;
 const X=v=>65+v/maxX*450,Y=v=>245-(v-minY)/(maxY-minY)*215;let b='';
 for(let i=0;i<=4;i++){const val=minY+(maxY-minY)*i/4,y=Y(val);b+=`<line x1="65" x2="515" y1="${y}" y2="${y}" stroke="#edf0f6"/>`+txt(53,y+4,val.toFixed(0)+'%','text-anchor="end"');b+=txt(X(maxX*i/4),269,compact(maxX*i/4),'text-anchor="middle" font-size="9"');}
 const zy=Y(0);b+=`<line x1="65" x2="515" y1="${zy}" y2="${zy}" stroke="#bac5df" stroke-dasharray="4 4"/>`;
 data.forEach(r=>{const v=rate(r.y2026,r.y2027),tip=`${r.program}\n${r.sector} / ${r.account}\n2027년: ${num(r.y2027)}억 원\n증감률: ${percent(v)}`;b+=`<circle cx="${X(r.y2027)}" cy="${Y(v)}" r="${5+Math.sqrt(r.y2027/maxX)*13}" fill="${sectorColors[r.sector]}" fill-opacity=".7" stroke="white" stroke-width="2" tabindex="0" data-tip="${esc(tip)}" aria-label="${esc(tip)}"/>`;});b+=txt(515,288,'2027년 재원 →','text-anchor="end" font-size="9"');svg('scatter-chart',b);
}
function growth(rows){
 const data=group(rows,'sector');if(!data.length)return emptyChart('growth-chart');let b='';const rates=data.map(r=>rate(r.y2026,r.y2027)),max=Math.max(...rates.map(x=>Math.abs(x||0)),1);
 data.forEach((r,i)=>{const y=22+i*82,v=rates[i];b+=txt(15,y+5,r.name)+`<text x="540" y="${y+5}" text-anchor="end" font-size="22" font-weight="700" fill="${sectorColors[r.name]}">${percent(v)}</text>`+rect(15,y+22,525,13,'#f0f2f8')+rect(15,y+22,v===null?0:Math.abs(v)/max*525,13,sectorColors[r.name],`${r.name}\n2026년: ${num(r.y2026)}억 원\n2027년: ${num(r.y2027)}억 원\n증감률: ${percent(v)}`,6);});svg('growth-chart',b);
}
let sortKey='y2027',sortDir=-1,current=[];
function filtered(){return DATA.filter(r=>(!$('sector').value||r.sector===$('sector').value)&&(!$('account').value||r.account===$('account').value));}
function tableRows(){const q=$('search').value.trim().toLowerCase();return current.filter(r=>!q||(r.program+' '+r.group).toLowerCase().includes(q)).map(r=>({...r,delta:r.y2027-r.y2026,rate:rate(r.y2026,r.y2027)})).sort((a,b)=>sortDir*(typeof a[sortKey]==='string'?a[sortKey].localeCompare(b[sortKey],'ko'):(a[sortKey]??-Infinity)-(b[sortKey]??-Infinity)));}
function renderTable(){
 const rows=tableRows();$('row-count').textContent=`${rows.length}개 프로그램`;$('empty').hidden=rows.length>0;
 $('tbody').innerHTML=rows.map(r=>`<tr><td><span class="sector-chip" style="--chip:${sectorColors[r.sector]}">${esc(r.sector)}</span></td><td>${esc(r.account)}</td><td>${esc(r.group)}</td><td>${esc(r.program)}</td><td class="num">${num(r.y2026)}</td><td class="num">${num(r.y2027)}</td><td class="num ${r.delta>=0?'pos':'neg'}">${signed(r.delta)}</td><td class="num ${r.rate>=0?'pos':'neg'}">${percent(r.rate)}</td></tr>`).join('');
 const a=total(rows,'y2026'),b=total(rows,'y2027');$('tfoot').innerHTML=`<tr><td colspan="4">표시 행 합계 (억 원)</td><td class="num">${num(a)}</td><td class="num">${num(b)}</td><td class="num">${signed(b-a)}</td><td class="num">${percent(rate(a,b))}</td></tr>`;
 document.querySelectorAll('[data-sort]').forEach(btn=>btn.closest('th').setAttribute('aria-sort',btn.dataset.sort===sortKey?(sortDir===1?'ascending':'descending'):'none'));
}
function render(){
 current=filtered();const a=total(current,'y2026'),b=total(current,'y2027'),key=$('year').value;
 $('k27').textContent=full(b);$('k26').textContent=full(a);$('kd').textContent=(b-a>0?'+':'')+full(b-a);$('kr').textContent=`전년 대비 ${percent(rate(a,b))}`;$('kn').textContent=current.length+'개';$('kp').textContent=`증가 ${current.filter(r=>r.y2027>r.y2026).length}개 · 감소 ${current.filter(r=>r.y2027<r.y2026).length}개`;
 $('filter-summary').textContent=[$('sector').value||'전체 부문',$('account').value||'전체 회계구분'].join(' / ');
 dual('sector-chart',group(current,'sector'));donut(current,key);diverging('account-chart',group(current,'account'),key);treemap(current,key);
 dual('ranking-chart',current.filter(r=>r[key]>0).sort((a,b)=>b[key]-a[key]).slice(0,10).map(r=>({...r,name:r.program})),415,'#b8afff','#8059eb');
 diverging('change-chart',current.map(r=>({...r,name:r.program,delta:r.y2027-r.y2026})).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)).slice(0,10),'delta',415);scatter(current);growth(current);renderTable();
}
function accountOptions(){const old=$('account').value;const opts=[...new Set(DATA.filter(r=>!$('sector').value||r.sector===$('sector').value).map(r=>r.account))];$('account').innerHTML='<option value="">전체 회계구분</option>'+opts.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('');if(opts.includes(old))$('account').value=old;}
$('sector').innerHTML+=[...new Set(DATA.map(r=>r.sector))].map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('');accountOptions();
$('sector').addEventListener('change',()=>{accountOptions();render();});$('account').addEventListener('change',render);$('year').addEventListener('change',render);$('search').addEventListener('input',renderTable);
$('reset').addEventListener('click',()=>{$('sector').value='';$('account').value='';$('year').value='y2027';$('search').value='';sortKey='y2027';sortDir=-1;accountOptions();render();});
document.querySelectorAll('[data-sort]').forEach(btn=>btn.addEventListener('click',()=>{if(sortKey===btn.dataset.sort)sortDir*=-1;else{sortKey=btn.dataset.sort;sortDir=typeof DATA[0][sortKey]==='string'?1:-1;}renderTable();}));
$('download').addEventListener('click',()=>{const head=['부문','회계구분','구분','프로그램명','2026년(억원)','2027년(억원)','증감액(억원)','증감률(%)'];const cell=v=>'"'+String(v??'').replaceAll('"','""')+'"';const csv='\uFEFF'+[head,...tableRows().map(r=>[r.sector,r.account,r.group,r.program,r.y2026,r.y2027,r.delta,r.rate===null?'':r.rate.toFixed(2)])].map(r=>r.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='국방예산_선택재원.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
const tip=$('tooltip');
document.addEventListener('pointermove',e=>{const el=e.target.closest('[data-tip]');if(!el){tip.hidden=true;return;}tip.textContent=el.dataset.tip;tip.hidden=false;tip.style.left=Math.min(e.clientX+14,innerWidth-tip.offsetWidth-12)+'px';tip.style.top=Math.max(8,Math.min(e.clientY+14,innerHeight-tip.offsetHeight-12))+'px';});
document.addEventListener('focusin',e=>{const el=e.target.closest('[data-tip]');if(!el)return;const r=el.getBoundingClientRect();tip.textContent=el.dataset.tip;tip.hidden=false;tip.style.left=Math.max(8,Math.min(r.x,innerWidth-330))+'px';tip.style.top=Math.min(r.bottom+8,innerHeight-140)+'px';});
document.addEventListener('focusout',()=>tip.hidden=true);document.addEventListener('keydown',e=>{if(e.key==='Escape')tip.hidden=true;});
document.querySelectorAll('.nav').forEach(el=>el.addEventListener('click',()=>{document.querySelectorAll('.nav').forEach(n=>n.classList.remove('active'));el.classList.add('active');}));
window.dashboardModel={filtered,group,total,rate,tableRows};render();
})();
