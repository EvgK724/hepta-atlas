/* HEPTA — original educational architectural drawings.
 * All geometry is illustrative. Reconstructions are not measured surveys.
 * Plain-script globals: wonderDrawing(m, mode), wonderMini(id).
 */
(function () {
  'use strict';
  let serial = 0;
  const IDS = ['khufu','gardens','zeus','artemis','mausoleum','colossus','lighthouse'];
  const NAMES = {khufu:'Пирамида Хеопса',gardens:'Висячие сады',zeus:'Статуя Зевса',artemis:'Храм Артемиды',mausoleum:'Мавзолей в Галикарнасе',colossus:'Колосс Родосский',lighthouse:'Александрийский маяк'};
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n = v => Math.round(v * 10) / 10;
  const points = a => a.map(p=>p.map(n).join(',')).join(' ');
  const line = a => 'M '+a.map(p=>p.map(n).join(' ')).join(' L ');

  function artist(ns) {
    const P = (x,y,z=0) => [500+(x-y)*2.55,465+(x+y)*1.03-z*2.13];
    const palettes = {
      stone:['#cbb78b','#756e72','#e5d4ac'],
      pale:['#bdd8d6','#617f8c','#e0f1e8'],
      dark:['#3a394e','#222a40','#666077'],
      gold:['#ba884b','#72523c','#eed09a'],
      bronze:['#916c49','#4d4847','#c2a579'],
      wood:['#8b6850','#4e4050','#bf9970'],
      violet:['#776581','#403c59','#b29aab'],
      green:['#397065','#274c51','#70ab8a'],
    };
    const poly = (a,fill,stroke='#e7d5aa',width=.8,opacity=1) => `<polygon points="${points(a)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-opacity=".38" stroke-linejoin="round" opacity="${opacity}"/>`;
    const edge = (a,color='#c4eeea',width=1,opacity=.5,dash='') => `<path d="${line(a)}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''}/>`;
    const world = a => a.map(p=>P(...p));
    function box(x,y,z,w,d,h,tone='stone',courses=0) {
      const c=palettes[tone]||palettes.stone;
      const a=P(x,y,z+h),b=P(x+w,y,z+h),cc=P(x+w,y+d,z+h),dd=P(x,y+d,z+h);
      let out=poly([b,cc,P(x+w,y+d,z),P(x+w,y,z)],c[1])+poly([dd,cc,P(x+w,y+d,z),P(x,y+d,z)],c[0])+poly([a,b,cc,dd],c[2]);
      if(courses) for(let i=1;i<courses;i++) out+=edge(world([[x,y+d,z+h*i/courses],[x+w,y+d,z+h*i/courses],[x+w,y,z+h*i/courses]]),'#efe0ba',.75,.22);
      return out;
    }
    function cylinder(x,y,z,r,h,tone='stone',sides=12) {
      const c=palettes[tone]||palettes.stone;
      const low=Array.from({length:sides},(_,i)=>[x+r*Math.cos(i*Math.PI*2/sides),y+r*Math.sin(i*Math.PI*2/sides),z]);
      const faces=low.map((p,i)=>({a:p,b:low[(i+1)%sides],depth:p[0]+p[1]+low[(i+1)%sides][0]+low[(i+1)%sides][1],i})).sort((a,b)=>a.depth-b.depth);
      let out=faces.map(f=>poly(world([f.a,f.b,[f.b[0],f.b[1],z+h],[f.a[0],f.a[1],z+h]]),f.i<sides/2?c[0]:c[1],'#d5e4d7',.6)).join('');
      return out+poly(world(low.map(p=>[p[0],p[1],z+h])),c[2],'#d5e4d7',.8);
    }
    function column(x,y,z,h,r=3.3,tone='pale') {
      let out=box(x-r*1.5,y-r*1.5,z,r*3,r*3,2.1,tone);
      out+=cylinder(x,y,z+2.1,r*1.15,2,tone,12)+cylinder(x,y,z+4.1,r,h-9,tone,12);
      out+=cylinder(x,y,z+h-4.9,r*1.2,2.1,tone,12)+box(x-r*1.6,y-r*1.6,z+h-2.8,r*3.2,r*3.2,2.8,tone);
      return out;
    }
    function roof(x,y,z,w,d,h,tone='pale') {
      const c=palettes[tone]||palettes.pale;
      const a=P(x,y,z),b=P(x+w,y,z),cc=P(x+w,y+d,z),dd=P(x,y+d,z),r1=P(x,y+d/2,z+h),r2=P(x+w,y+d/2,z+h);
      let out=poly([a,b,r2,r1],c[1])+poly([b,cc,r2],c[0])+poly([dd,cc,r2,r1],c[2]);
      for(let i=1;i<10;i++)out+=edge([P(x+w*i/10,y+d,z),P(x+w*i/10,y+d/2,z+h)],'#536276',.75,.35);
      return out+edge([r1,r2],'#fbdeb0',1.5,.9);
    }
    function arch(center,wall,z,w,h,axis='x') {
      const to=(t,up)=>axis==='x'?P(t,wall,up):P(wall,t,up);
      const r=w/2, shoulder=z+h-r;
      const a=[to(center-r,z),to(center-r,shoulder)];
      for(let i=0;i<=12;i++){const t=Math.PI-i*Math.PI/12;a.push(to(center+r*Math.cos(t),shoulder+r*Math.sin(t)));}
      a.push(to(center+r,z));
      return poly(a,'#171e30','#d5c29b',1.1)+edge([to(center-r,z),to(center+r,z)],'#f0ce8d',1,.6);
    }
    function shrubs(x,y,z,w,d,seed=0) {
      let out='';
      const positions=[];
      for(let i=0;i<Math.max(4,w/12);i++)positions.push([x+5+i*(w-10)/Math.max(3,Math.floor(w/12)-1),y+d-4]);
      for(let i=0;i<Math.max(3,d/12);i++)positions.push([x+w-4,y+5+i*(d-10)/Math.max(2,Math.floor(d/12)-1)]);
      positions.sort((a,b)=>a[0]+a[1]-b[0]-b[1]).forEach(([xx,yy],i)=>{const p=P(xx,yy,z),r=7+(i+seed)%4;out+=`<ellipse cx="${n(p[0])}" cy="${n(p[1]-r/2)}" rx="${r*1.5}" ry="${r}" fill="${['#538d73','#79ac84','#3c756b'][(i+seed)%3]}" stroke="#b5dcc0" stroke-opacity=".25" stroke-width=".7"/>`;});
      return out;
    }
    function label(x,y,lines,target,side='right',color='#e9d3a8') {
      const cy=y+(lines.length-1)*15;
      const endX=side==='left'?x+174:x-15;
      const bendX=side==='left'?endX+24:endX-24;
      return `<g class="drawing-annotation">${edge([target,[bendX,cy-7],[endX,cy-7]],color,1.15,.63)}<circle cx="${n(target[0])}" cy="${n(target[1])}" r="3" fill="${color}"/><text x="${x}" y="${y}" fill="${color}" font-family="ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="27" font-weight="620">${lines.map((t,i)=>`<tspan x="${x}" dy="${i?31:0}">${esc(t)}</tspan>`).join('')}</text></g>`;
    }
    return {P,poly,edge,world,box,cylinder,column,roof,arch,shrubs,label,palettes,ns};
  }

  function khufu(a,structure) {
    const {poly,edge,label}=a;
    const top=[500,111],left=[181,443],front=[500,565],right=[819,443];
    let body=poly([[147,449],[499,584],[855,449],[503,314]],'#252637','#b7c6cc',1);
    body+=poly([top,left,front],structure?'#a58e67':'#d9d5bd')+poly([top,front,right],structure?'#242b40':'#819b9e');
    for(let i=1;i<=13;i++){
      const t=i/14, blend=p=>[top[0]+(p[0]-top[0])*t,top[1]+(p[1]-top[1])*t];
      body+=edge([blend(left),blend(front)],structure?'#f1d2a3':'#726f73',1,structure?.46:.36);
      if(!structure)body+=edge([blend(front),blend(right)],'#e4e2ca',.9,.32);
      const v1=blend(left),v2=blend(front);
      for(let k=1;k<i;k+=2){const r=k/i;body+=edge([[v1[0]+(v2[0]-v1[0])*r,v1[1]+(v2[1]-v1[1])*r],[v1[0]+(v2[0]-v1[0])*r+6,v1[1]+(v2[1]-v1[1])*r+14]],'#e9dcba',.7,.23);}
    }
    body+=edge([left,top,right],'#f6e3bb',1.9,.94)+edge([top,front],'#a7eef0',1.5,.85);
    if(structure){
      body+=poly([[181,443],[221,403],[505,510],[500,565]],'#e2dec4','#f6eccd',.8,.82);
      body+=edge([[755,459],[591,371],[569,363],[569,332]],'#b4eeeb',5,.93);
      body+=edge([[668,412],[537,486],[537,512]],'#7ab1c1',3.2,.8);
      body+=poly([[553,323],[600,340],[600,363],[553,346]],'#172332','#a2eeec',1.6);
      body+=poly([[543,390],[575,402],[575,420],[543,409]],'#172332','#a2eeec',1.5);
      body+=poly([[521,504],[557,517],[557,533],[521,520]],'#172332','#a2eeec',1.4);
      body+=edge([[551,318],[601,335]],'#f0ce8d',2,.8)+edge([[551,309],[601,327]],'#f0ce8d',2,.68)+edge([[551,300],[601,319]],'#f0ce8d',2,.5);
      return {body,labels:label(57,173,['Каменное','ядро'],[360,310],'left')+label(770,265,['Камеры','и ходы'],[584,354])+label(57,487,['Наружная','облицовка'],[336,478],'left')};
    }
    body+=poly([[500,111],[477,135],[500,144],[522,135]],'#f6dfad','#fff1c9',.8,.85);
    return {body,labels:label(57,177,['Наклонные','грани'],[387,269],'left')+label(774,259,['Каменная','кладка'],[682,365])+label(734,535,['Основание'],[639,511])};
  }

  function gardens(a,structure) {
    const {P,box,arch,shrubs,edge,label}=a;
    let body=box(-69,-53,0,138,106,7,'dark');
    const tiers=[{w:126,d:98,z:7,h:36},{w:92,d:72,z:49,h:33},{w:60,d:48,z:88,h:29}];
    tiers.forEach((t,j)=>{
      const x=-t.w/2,y=-t.d/2;
      if(structure){
        const pillarCoords=[];
        for(let i=0;i<4;i++)pillarCoords.push([x+7+i*(t.w-14)/3,y+t.d-7]);
        for(let i=0;i<3;i++)pillarCoords.push([x+t.w-7,y+7+i*(t.d-14)/2]);
        pillarCoords.sort((p,q)=>p[0]+p[1]-q[0]-q[1]).forEach(([xx,yy])=>body+=box(xx-3.6,yy-3.6,t.z,7.2,7.2,t.h,'stone'));
        body+=box(x-3,y-3,t.z+t.h,t.w+6,t.d+6,3.3,'pale');
        body+=box(x-3,y-3,t.z+t.h+3.3,t.w+6,t.d+6,1.5,'violet');
        body+=box(x-2,y-2,t.z+t.h+4.8,t.w+4,t.d+4,2.2,'wood');
      }else{
        body+=box(x,y,t.z,t.w,t.d,t.h,'stone',4);
        const count=j===0?7:j===1?5:3;
        for(let i=0;i<count;i++)body+=arch(x+10+i*(t.w-20)/(count-1),y+t.d+.12,t.z+3,11,j===2?21:27);
        const rightCount=j===0?5:j===1?4:3;
        for(let i=0;i<rightCount;i++)body+=arch(y+9+i*(t.d-18)/(rightCount-1),x+t.w+.12,t.z+3,10,j===2?21:27,'y');
        body+=box(x-3,y-3,t.z+t.h,t.w+6,t.d+6,5,'pale');
      }
      body+=shrubs(x,y,t.z+t.h+7,t.w,t.d,j);
      if(!structure)body+=edge([P(x+t.w-8,y+t.d-4,t.z+t.h+5),P(x+t.w-8,y+7,t.z+t.h+5)],'#9ce7e8',2,.57);
    });
    const tree=(x,y,z,s)=>{const p=P(x,y,z);return `<path d="M ${n(p[0])} ${n(p[1])} q -4 -24 1 -${s}" fill="none" stroke="#c0ae85" stroke-width="3"/><path d="M ${n(p[0])} ${n(p[1]-s)} q -30 -16 -42 1 q 26 -5 42 1 q 21 -23 40 -7 q -26 -1 -40 7 q -12 -28 -29 -20 q 16 2 29 20 q 13 -35 29 -27 q -21 12 -29 27" fill="none" stroke="#89b897" stroke-width="4" stroke-linecap="round"/>`;};
    body+=tree(-15,-6,122,43)+tree(15,10,122,35);
    if(structure)return {body,labels:label(57,161,['Террасы','с грунтом'],P(3,23,125),'left')+label(748,295,['Слои','покрытия'],P(35,31,91))+label(62,470,['Несущие','опоры'],P(-29,43,24),'left')};
    return {body,labels:label(57,146,['Озеленённые','ярусы'],P(-7,18,128),'left')+label(749,266,['Террасы'],P(40,24,87))+label(57,462,['Аркады'],P(-33,49,21),'left')};
  }

  function temple(a,structure) {
    const {P,box,column,roof,edge,label}=a;
    let body=box(-79,-45,0,158,90,3,'dark')+box(-76,-42,3,152,84,3,'stone')+box(-72,-38,6,144,76,3,'pale');
    const coords=[];
    for(let i=0;i<8;i++){const x=-65+i*130/7;coords.push([x,-31],[x,31]);}
    for(let j=1;j<4;j++){const y=-31+j*62/4;coords.push([-65,y],[65,y]);}
    for(let i=0;i<6;i++){const x=-46+i*92/5;coords.push([x,-19],[x,19]);}
    coords.sort((p,q)=>p[0]+p[1]-q[0]-q[1]);
    const back=coords.filter(p=>p[0]+p[1]<0),front=coords.filter(p=>p[0]+p[1]>=0);
    back.forEach(p=>body+=column(p[0],p[1],9,55,2.85));
    body+=box(-35,-12,9,70,24,48,structure?'dark':'stone',4);
    front.forEach(p=>body+=column(p[0],p[1],9,55,2.85));
    const entZ=structure?76:64, roofZ=structure?108:72;
    body+=box(-72,-38,entZ,144,76,5.5,'pale')+box(-73,-39,entZ+5.5,146,78,2.5,'gold');
    body+=roof(-76,-42,roofZ,152,84,23,'pale');
    if(structure){
      [[-65,31],[65,31],[65,-31]].forEach(([x,y])=>{body+=edge([P(x,y,64),P(x,y,76)],'#9ce7e8',1,.6,'4 5')+edge([P(x,y,84),P(x,y,108)],'#9ce7e8',1,.5,'4 5');});
      return {body,labels:label(56,134,['Кровля'],P(-10,25,123),'left')+label(786,326,['Антаблемент'],P(63,27,81))+label(57,441,['Двойная','колоннада'],P(-45,30,39),'left')};
    }
    return {body,labels:label(61,158,['Двускатная','кровля'],P(-12,25,86),'left')+label(825,310,['Два ряда','колонн'],P(59,26,40))+label(57,472,['Ступенчатое','основание'],P(-52,35,8),'left')};
  }

  function quadriga(x,y) {
    let out='';
    for(let i=0;i<4;i++){
      const xx=x-39+i*20;
      out+=`<path d="M ${xx} ${y+31} l -3 -17 5 -15 7 -4 6 7 -7 6 6 13 -2 16 -4 0 -2 -15 -5 0 3 18 -4 0 z" fill="${i%2?'#bea077':'#f1d5a3'}" stroke="#e8e4cc" stroke-width=".7"/>`;
    }
    out+=`<path d="M ${x+40} ${y+26} h 20 l -3 12 h -23 z M ${x+47} ${y+23} v -21 l 7 -4 5 4 -3 20" fill="#bd9b70" stroke="#f0d6a7" stroke-width="1"/><circle cx="${x+51}" cy="${y-4}" r="5" fill="#f1d3a0"/><circle cx="${x+39}" cy="${y+39}" r="5" fill="none" stroke="#dfc18e" stroke-width="2"/><circle cx="${x+60}" cy="${y+39}" r="5" fill="none" stroke="#dfc18e" stroke-width="2"/>`;
    return out;
  }

  function mausoleum(a,structure) {
    const {P,box,column,edge,label}=a;
    let body=box(-56,-43,0,112,86,4,'dark')+box(-52,-39,4,104,78,5,'pale')+box(-46,-33,9,92,66,48,'stone',7)+box(-49,-36,57,98,72,4,'pale');
    for(let i=0;i<7;i++){const p=P(-37+i*12,33.2,39);body+=`<path d="M ${n(p[0]-4)} ${n(p[1]+7)} v -14 l 5 -5 5 7 -3 13" fill="none" stroke="#e1c79b" stroke-width="1.6" opacity=".4"/>`;}
    const coords=[];
    for(let i=0;i<6;i++){const x=-41+i*82/5;coords.push([x,-29],[x,29]);}
    for(let i=1;i<3;i++){const y=-29+i*58/3;coords.push([-41,y],[41,y]);}
    coords.sort((p,q)=>p[0]+p[1]-q[0]-q[1]);
    coords.filter(p=>p[0]+p[1]<0).forEach(p=>body+=column(...p,61,37,2.55));
    body+=box(-25,-16,61,50,32,35,'dark');
    coords.filter(p=>p[0]+p[1]>=0).forEach(p=>body+=column(...p,61,37,2.55));
    const roofZ=structure?112:99;
    body+=box(-48,-35,roofZ,96,70,4,'pale');
    for(let j=0;j<8;j++){const w=91-j*9,d=65-j*6.5;body+=box(-w/2,-d/2,roofZ+4+j*4.1,w,d,4.1,j%2?'stone':'pale');}
    body+=box(-12,-8,roofZ+36.8,24,16,5,'gold');
    const qp=P(0,0,roofZ+50);body+=quadriga(qp[0]-8,qp[1]-18);
    if(structure){[[-41,29],[41,29],[41,-29]].forEach(([x,y])=>body+=edge([P(x,y,98),P(x,y,112)],'#9ce7e8',1,.65,'4 4'));
      return {body,labels:label(62,133,['Ступенчатая','кровля'],P(-15,15,139),'left')+label(749,290,['Колоннада'],P(41,24,78))+label(61,438,['Высокий','подиум'],P(-28,33,26),'left')};
    }
    return {body,labels:label(759,101,['Квадрига'],[qp[0]+21,qp[1]+7])+label(59,259,['Колоннада'],P(-39,27,82),'left')+label(745,471,['Подиум'],P(41,29,28))};
  }

  function zeus(a,structure) {
    const {box,label,edge}=a;
    let body=box(-67,-37,0,134,74,6,'dark')+box(-61,-31,6,122,62,5,'stone');
    body+=`<g opacity="${structure?.25:.48}" fill="url(#${a.ns}-pale)" stroke="#aacdd4" stroke-opacity=".36" stroke-width="1"><path d="M 243 483 V 151 h 30 v 332 z M 728 483 V 151 h 30 v 332 z"/><path d="M 232 141 h 537 v 17 H 232 z M 211 132 500 54 790 132 Z" fill="#454554"/><path d="M 249 166 V 473 M 258 166 V 473 M 267 166 V 473 M 736 166 V 473 M 746 166 V 473" fill="none"/><path d="M 225 482 h 65 v 13 h -65 z M 712 482 h 65 v 13 h -65 z"/></g>`;
    body+=`<path d="M 391 178 601 178 633 195 633 461 601 447 391 447 Z" fill="#342d40" stroke="#cead70" stroke-width="1.4"/><path d="M 405 195 H 588 V 426 H 405 Z" fill="#202033" stroke="#7d6a59" stroke-width="5"/><path d="M 391 181 411 164 498 150 583 164 605 181" fill="none" stroke="#d6ba84" stroke-width="6"/><path d="M 398 359 H 600 V 381 H 398 Z M 400 378 V 488 h 17 V 380 M 580 379 V 488 h 17 V 379" fill="#9a774f" stroke="#d9c096" stroke-width="1"/>`;
    if(structure){
      body+=`<g fill="#7c5e46" stroke="#d4af7b" stroke-width="1.8"><path d="M 482 172 h 34 l 9 53 21 88 -18 25 -55 -7 -18 -28 20 -78 Z"/><path d="M 476 330 434 367 435 453 424 469 444 469 449 375 498 345 Z M 511 339 560 369 550 456 538 470 561 470 575 363 529 326 Z"/><path d="M 473 224 443 239 417 281 444 297 468 279 458 269 438 278 456 245 481 243 Z M 528 226 550 241 575 282 603 268 610 280 572 301 548 272 522 245 Z"/></g>`;
      body+=`<g fill="none" stroke="#eed2a0" stroke-width="3"><path d="M 498 180 V 337 M 462 243 H 534 M 464 270 H 539 M 465 297 H 544 M 479 211 515 313 M 520 211 480 316"/></g>`;
      body+=`<path d="M 484 156 q -18 -15 -14 -35 3 -23 29 -23 26 0 31 22 l -4 28 -16 22 -16 4 z" fill="#e0e0c9" stroke="#f4ecce" stroke-width="1.4"/><path d="M 480 151 509 168 525 151 518 181 502 192 487 180 Z" fill="#c3c5b9" stroke="#f2dfb8" stroke-width="1"/>`;
      body+=`<path d="M 634 236 q 17 -18 39 -4 l 9 39 -32 12 -22 -15 z" fill="#dce6d4" stroke="#fff0c4" stroke-width="1.6"/><path d="M 631 380 661 360 688 389 674 435 639 428 Z" fill="url(#${a.ns}-gold)" stroke="#fae3aa" stroke-width="1.5"/>`;
      body+=edge([[649,258],[580,251],[544,247]],'#c8e9e4',1,.55,'4 5')+edge([[649,403],[593,382],[543,338]],'#f0ce8d',1,.55,'4 5');
      return {body,labels:label(54,220,['Деревянная','основа'],[480,279],'left')+label(755,237,['Слоновая','кость'],[668,254])+label(755,426,['Золотые','листы'],[663,399])};
    }
    body+=`<path d="M 486 166 H 513 L 516 218 505 229 484 217 Z M 434 365 461 355 475 380 449 452 435 465 415 461 429 447 Z M 543 355 574 364 567 411 553 458 534 465 520 458 537 445 Z" fill="url(#${a.ns}-ivory)" stroke="#f4e2bc" stroke-width="1.1"/>`;
    body+=`<path d="M 456 218 q 36 -22 75 -6 l 24 26 -14 63 18 39 -60 31 -53 -27 12 -41 -17 -62 Z" fill="url(#${a.ns}-ivory)" stroke="#f2dfb5" stroke-width="1.3"/><path d="M 449 226 426 239 405 279 371 269 361 281 409 304 445 275 462 248 Z M 542 224 566 237 585 278 616 262 626 277 580 304 546 269 533 245 Z" fill="url(#${a.ns}-ivory)" stroke="#eedcb7" stroke-width="1.2"/>`;
    body+=`<path d="M 450 223 439 253 446 305 414 357 401 398 454 417 493 391 535 410 570 388 579 352 548 314 475 331 460 298 470 243 Z" fill="url(#${a.ns}-gold)" stroke="#f8dba1" stroke-width="1.2"/><path d="M 457 327 426 388 M 477 339 451 404 M 506 339 491 385 M 535 333 545 394 M 551 344 561 380" fill="none" stroke="#70513e" stroke-width="3" opacity=".55"/>`;
    body+=`<path d="M 480 164 q -16 -15 -13 -38 4 -24 31 -24 27 0 32 23 l -4 27 -18 25 -19 -1 Z" fill="url(#${a.ns}-ivory)" stroke="#ead8ad" stroke-width="1.2"/><path d="M 470 133 q -11 -19 9 -32 22 -14 42 1 13 9 11 32 l -13 -17 -23 -4 -17 8 z M 479 151 l 18 8 12 -1 18 -14 -8 31 -18 19 -16 -15 Z" fill="#a88d63" stroke="#dfc18b" stroke-width="1.1"/><path d="M 478 111 q 17 -12 37 -2" fill="none" stroke="#f7d992" stroke-width="5"/><path d="M 485 138 h 7 M 509 138 h 7 M 501 138 l -3 10 6 1" fill="none" stroke="#756550" stroke-width="1.6"/>`;
    body+=`<path d="M 414 462 438 459 450 468 452 478 410 478 Z M 527 461 549 459 566 470 566 479 521 479 Z" fill="#d7bb7f" stroke="#f1d9a5" stroke-width="1.2"/><path d="M 624 188 V 474" stroke="#c8ac76" stroke-width="5"/><circle cx="624" cy="182" r="7" fill="#f1d4a0"/><path d="M 344 270 h 36 l 8 10 h -53 z" fill="#b79357"/><path d="M 359 266 v -36 l 8 -8 6 8 -1 36 M 364 237 l -15 -14 M 368 236 l 16 -14" fill="none" stroke="#e5c68e" stroke-width="3"/><circle cx="366" cy="216" r="5" fill="#e5c68e"/>`;
    return {body,labels:label(56,244,['Сидящая','фигура'],[464,308],'left')+label(772,308,['Трон'],[616,337])+label(755,451,['Золото','и кость'],[548,398])};
  }

  const colossusBody = `<path d="M 488 170 512 170 520 188 547 200 558 221 569 249 556 281 542 281 548 247 533 224 529 278 536 317 534 340 530 391 529 428 516 489 527 499 539 506 508 506 504 488 511 432 511 379 501 350 493 387 494 433 501 488 498 505 469 506 480 492 481 438 474 397 470 348 466 320 475 281 470 227 453 252 456 291 445 311 433 306 440 286 433 249 444 217 456 197 481 185 Z"/>`;
  function colossus(a,structure) {
    const {poly,edge,label}=a;
    let body=poly([[387,499],[500,459],[613,499],[500,540]],'#d3c7a9')+poly([[387,499],[500,540],[500,587],[387,546]],'#71686a')+poly([[500,540],[613,499],[613,546],[500,587]],'#424459');
    body+=edge([[387,514],[500,555],[613,514]],'#d7d1b2',1,.4)+edge([[387,531],[500,572],[613,531]],'#d7d1b2',1,.25);
    body+=`<g fill="${structure?'#373841':`url(#${a.ns}-bronze)`}" stroke="#c9b58d" stroke-width="1.35">${colossusBody}<path d="M 483 113 q 11 -10 29 -3 l 13 18 -3 31 -16 20 -16 -7 -15 -19 1 -29 Z"/></g>`;
    body+=`<path d="M 477 133 475 115 486 103 508 101 524 112 527 130 516 116 495 113 484 123 Z" fill="#7b694e" stroke="#c7b487" stroke-width="1"/><path d="M 483 113 473 94 M 491 107 487 86 M 503 105 505 81 M 515 110 526 89 M 523 119 542 104" stroke="#d6c08e" stroke-width="2.7"/><path d="M 486 138 h 7 M 507 138 h 7 M 501 140 497 149 503 151 M 490 161 q 10 5 17 -2" fill="none" stroke="#655d50" stroke-width="1.4"/>`;
    if(structure){
      body+=`<g fill="none" stroke="#d4b483" stroke-width="4"><path d="M 498 183 498 333 M 485 200 485 320 M 518 200 518 320 M 480 220 H 529 M 477 251 H 532 M 476 281 H 531 M 475 315 H 531 M 485 322 487 493 M 518 322 518 492 M 479 360 H 496 M 479 403 H 497 M 506 360 H 528 M 507 405 H 527"/><path d="M 484 224 517 249 484 280 518 314 M 518 223 485 251 517 281 485 314" stroke-width="2"/></g>`;
      body+=`<path d="M 474 192 455 202 445 224 460 238 476 215 491 207 Z M 469 323 474 356 491 364 503 342 492 318 Z" fill="url(#${a.ns}-bronze)" stroke="#dbc08b" stroke-width="1.5"/><path d="M 634 206 669 216 681 253 650 269 625 245 Z M 632 320 667 315 683 349 667 376 640 363 Z" fill="url(#${a.ns}-bronze)" stroke="#e4c28f" stroke-width="1.5"/>`;
      body+=edge([[639,239],[579,239],[532,222]],'#c6dad7',1,.5,'4 5')+edge([[639,343],[576,343],[532,318]],'#c6dad7',1,.5,'4 5');
      return {body,labels:label(747,209,['Бронзовая','оболочка'],[661,244])+label(57,291,['Внутренний','каркас'],[511,281],'left')+label(717,530,['Единое','основание'],[566,541])};
    }
    body+=`<path d="M 479 212 q 10 -8 19 -4 M 508 208 q 14 -1 24 11 M 499 222 V 275 M 480 241 q 11 7 18 2 M 507 242 q 13 5 22 -4 M 483 272 q 17 10 38 0 M 482 287 q 17 10 36 0 M 474 320 498 332 534 318 M 485 351 486 429 M 518 352 519 427" fill="none" stroke="#eedbb2" stroke-width="1.3" opacity=".47"/>`;
    body+=`<path d="M 457 201 464 191 482 195 475 215 468 243 454 253 455 300 442 309 445 270 437 248 Z" fill="#657075" stroke="#d4c5a1" stroke-width="1.1" opacity=".82"/>`;
    return {body,labels:label(58,190,['Образ','Гелиоса'],[496,138],'left')+label(748,293,['Бронзовая','статуя'],[530,268])+label(719,533,['Единый','постамент'],[560,541])};
  }

  function lighthouse(a,structure) {
    const {P,box,cylinder,column,arch,edge,label}=a;
    let body=`<g fill="none" stroke="#71abbf" opacity=".16"><path d="M 164 540 q 65 -19 118 1 t 116 0 M 642 543 q 65 -19 118 1 t 97 -2 M 211 570 q 68 -12 116 1 M 703 575 q 60 -13 94 -1"/></g>`;
    body+=box(-48,-42,0,96,84,5,'dark')+box(-43,-37,5,86,74,6,'stone');
    const baseH=structure?63:76, octZ=structure?90:92, octH=structure?32:39, cylZ=structure?137:136;
    body+=box(-34,-29,11,68,58,baseH,'stone',8);
    if(structure){
      body+=a.poly(a.world([[-21,29.1,16],[16,29.1,16],[16,29.1,69],[-21,29.1,69]]),'#192236','#add9db',1.3);
      const stair=[];
      for(let i=0;i<9;i++){const z=20+i*5.3;stair.push(P(i%2?-17:12,29.5,z),P(i%2?12:-17,29.5,z+3));}
      body+=edge(stair,'#d8c6a0',2,.85);
    }else{
      body+=arch(-5,29.2,11,14,27);
      [46,66].forEach(z=>{[-18,15].forEach(x=>body+=arch(x,29.2,z,7,12));[-14,14].forEach(y=>body+=arch(y,34.2,z,7,12,'y'));});
    }
    body+=box(-37,-32,11+baseH,74,64,4,'pale');
    body+=cylinder(0,0,octZ,26,octH,'pale',8)+cylinder(0,0,octZ+octH,29,3.5,'stone',8);
    body+=cylinder(0,0,cylZ,16,25,'pale',20)+cylinder(0,0,cylZ+25,19,3.2,'gold',20);
    for(let i=0;i<6;i++){const t=i*Math.PI/3;body+=column(Math.cos(t)*11,Math.sin(t)*11,cylZ+28.2,12,1.2,'stone');}
    body+=cylinder(0,0,cylZ+40.2,14,2.3,'pale',12);
    const flame=P(0,0,cylZ+43);
    body+=`<circle cx="${n(flame[0])}" cy="${n(flame[1]-8)}" r="39" fill="url(#${a.ns}-fire)"/><path d="M ${n(flame[0]-8)} ${n(flame[1]+1)} q -4 -12 9 -27 -2 13 6 18 4 8 -2 11 z" fill="#f7dc99" stroke="#ffedc2" stroke-width="1.1"/>`;
    if(structure){[[22,19],[-22,19]].forEach(([x,y])=>{body+=edge([P(x,y,78),P(x,y,90)],'#9ce7e8',1,.65,'4 4')+edge([P(x*.6,y*.6,126),P(x*.6,y*.6,137)],'#9ce7e8',1,.6,'4 4');});
      return {body,labels:label(751,141,['Верхняя','площадка'],P(12,9,cylZ+28))+label(56,313,['Внутренний','подъём'],P(-6,30,46),'left')+label(744,456,['Несущие','стены'],P(34,17,43))};
    }
    return {body,labels:label(746,178,['Цилиндрический','ярус'],P(11,12,151))+label(56,288,['Восьмигранный','ярус'],P(-14,20,112),'left')+label(740,449,['Квадратный','ярус'],P(34,20,43))};
  }

  function wonderDrawing(m,mode='exterior') {
    m=m||{};
    const id=IDS.includes(m.id)?m.id:'khufu';
    const structure=mode==='structure';
    const ns='hepta-'+id+'-'+(structure?'structure':'exterior')+'-'+(++serial);
    const a=artist(ns);
    const draw={khufu,gardens,zeus,artemis:temple,mausoleum,colossus,lighthouse}[id](a,structure);
    const title=(m.name||NAMES[id])+' — '+(id==='gardens'?(structure?'гипотетическая схема устройства; план не установлен':'гипотетическая реконструкция; план не установлен'):(structure?'условная схема устройства':'художественная реконструкция'));
    const uncertainty=id==='gardens'?'План Висячих садов не установлен. Изображена исключительно гипотетическая композиция террас, опор и озеленения. ':id==='colossus'?'Условная реконструкция: фигура стоит со сближенными ногами на одном постаменте. Устройство внутреннего каркаса и бронзовой оболочки показано как гипотеза. ':id==='zeus'?'Зевс изображён сидящим на троне. Деревянная основа, слоновая кость и золото показаны условно; конкретное устройство не восстановлено. ':id==='lighthouse'?'Квадратный, восьмигранный и цилиндрический ярусы показаны условно. Детали сборки, внутреннего подъёма и верхнего сооружения являются реконструкцией. ':'';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 630" class="wonder-drawing" role="img" aria-labelledby="${ns}-title ${ns}-desc" preserveAspectRatio="xMidYMid meet">
      <title id="${ns}-title">${esc(title)}</title>
      <desc id="${ns}-desc">${esc(uncertainty)}Учебный архитектурный рисунок. Пропорции, размеры и конструктивные детали не являются точным обмером или доказанным планом сооружения.</desc>
      <defs>
        <radialGradient id="${ns}-aura"><stop stop-color="#716076" stop-opacity=".2"/><stop offset=".6" stop-color="#31404e" stop-opacity=".12"/><stop offset="1" stop-color="#10101b" stop-opacity="0"/></radialGradient>
        <linearGradient id="${ns}-gold" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#f1d297"/><stop offset=".45" stop-color="#b99152"/><stop offset="1" stop-color="#6d513d"/></linearGradient>
        <linearGradient id="${ns}-ivory" x1="0" y1="0" x2="1" y2=".2"><stop stop-color="#f0ebd4"/><stop offset=".52" stop-color="#cfcebf"/><stop offset="1" stop-color="#87979e"/></linearGradient>
        <linearGradient id="${ns}-bronze" x1="0" y1="0" x2="1" y2=".1"><stop stop-color="#c9b18a"/><stop offset=".33" stop-color="#a88c62"/><stop offset=".72" stop-color="#626759"/><stop offset="1" stop-color="#414852"/></linearGradient>
        <linearGradient id="${ns}-pale" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#afb3ae"/><stop offset="1" stop-color="#4a5667"/></linearGradient>
        <radialGradient id="${ns}-fire"><stop stop-color="#ffdc99" stop-opacity=".3"/><stop offset=".5" stop-color="#f2b87a" stop-opacity=".1"/><stop offset="1" stop-color="#f2b87a" stop-opacity="0"/></radialGradient>
      </defs>
      <ellipse cx="500" cy="309" rx="445" ry="309" fill="url(#${ns}-aura)"/>
      <g fill="none" stroke="#9cb8c1" stroke-width=".8" opacity=".065"><path d="M 71 158 H 930 M 71 287 H 930 M 71 416 H 930 M 71 545 H 930 M 169 70 V 588 M 335 70 V 588 M 501 70 V 588 M 667 70 V 588 M 833 70 V 588"/><path d="M 104 490 500 350 896 490 500 619 Z M 104 490 500 619 M 250 438 648 567 M 396 386 791 516 M 750 438 353 567 M 603 386 207 516"/></g>
      <ellipse cx="500" cy="544" rx="274" ry="34" fill="#050811" opacity=".44"/>
      ${draw.body}
      ${draw.labels}
    </svg>`;
  }

  function wonderMini(id) {
    id=IDS.includes(id)?id:'khufu';
    const ns='hepta-mini-'+id+'-'+(++serial);
    const c='#d9c298', l='#b9dedc', d='#655d70', green='#73a88c';
    let body='';
    if(id==='khufu')body=`<path d="M 24 77 100 12 176 77 100 98 Z" fill="${d}"/><path d="M 24 77 100 12 100 98 Z" fill="${c}"/><path d="M 100 12 V 98 L 176 77 Z" fill="#718b93"/><path d="M 45 59 100 76 156 60 M 65 42 100 53 136 43" fill="none" stroke="#e5dfba" stroke-opacity=".48"/>`;
    if(id==='gardens'){
      body=`<path d="M 21 76 100 58 179 76 179 87 100 99 21 87 Z" fill="#777179"/><path d="M 35 49 100 36 165 49 165 75 100 90 35 75 Z" fill="${c}"/><path d="M 56 28 100 18 144 28 144 49 100 60 56 49 Z" fill="${c}"/>`;
      for(let i=0;i<6;i++)body+=`<path d="M ${42+i*21} 73 v -12 q 5 -8 10 0 v 14" fill="#32354b"/>`;
      [28,51,78].forEach((y,j)=>{const xx=58-j*18;body+=`<path d="M ${xx} ${y} q 8 -8 16 0 t 16 0 t 16 0 t 16 0 t 16 0" fill="none" stroke="${green}" stroke-width="7"/>`;});
    }
    if(id==='zeus')body=`<path d="M 52 24 H 148 V 89 H 52 Z" fill="#53485d" stroke="${c}" stroke-width="2"/><circle cx="99" cy="23" r="12" fill="${l}"/><path d="M 87 36 H 112 L 125 60 143 54 145 63 123 73 108 55 89 58 77 76 58 64 62 56 76 62 Z" fill="${l}"/><path d="M 85 52 117 52 135 77 119 84 98 73 77 84 65 74 Z" fill="${c}"/><path d="M 77 78 82 92 H 96 L 92 80 M 120 78 112 93 H 127 L 131 82" fill="${l}"/><path d="M 58 74 V 96 M 139 74 V 96 M 146 28 V 92" stroke="${c}" stroke-width="4"/><path d="M 38 97 H 162" stroke="#b0a389" stroke-width="5"/>`;
    if(id==='artemis'){
      body=`<path d="M 17 34 100 8 184 34 172 42 H 29 Z" fill="${c}" stroke="${l}"/><path d="M 31 39 H 171 V 48 H 31 Z" fill="#93877e"/>`;
      for(let i=0;i<9;i++)body+=`<path d="M ${37+i*16} 49 V 85" stroke="${i%2?l:c}" stroke-width="7"/>`;
      body+=`<path d="M 26 86 H 177 M 20 92 H 183 M 14 98 H 189" stroke="${c}" stroke-width="4"/>`;
    }
    if(id==='mausoleum'){
      body=`<path d="M 42 70 H 158 V 96 H 42 Z" fill="#887b76" stroke="${c}"/><path d="M 49 44 100 13 151 44 Z" fill="${c}"/><path d="M 44 45 H 156 V 51 H 44 Z" fill="#d5d3bd"/>`;
      for(let i=0;i<7;i++)body+=`<path d="M ${50+i*16} 51 V 70" stroke="${l}" stroke-width="5"/>`;
      body+=`<path d="M 89 18 V 7 l 5 -4 3 5 -1 10 M 103 17 V 6 l 5 -3 3 5 -1 10 M 34 98 H 166" fill="none" stroke="${c}" stroke-width="3"/>`;
    }
    if(id==='colossus')body=`<path d="M 98 8 109 10 113 23 106 32 98 28 94 18 Z" fill="${c}"/><path d="M 96 32 112 32 123 46 120 62 114 61 115 46 109 44 110 66 105 86 113 91 H 101 L 101 69 96 88 99 92 H 85 L 91 84 92 64 94 47 87 56 88 64 81 68 80 55 87 38 Z" fill="#b1a080"/><path d="M 71 93 H 131 V 100 H 71 Z" fill="#777280"/><path d="M 95 10 90 4 M 102 8 V 1.3 M 109 10 115 4" stroke="${c}" stroke-width="1.8"/>`;
    if(id==='lighthouse')body=`<path d="M 69 56 H 130 V 96 H 69 Z" fill="${c}"/><path d="M 80 32 87 27 H 113 L 120 32 V 54 H 80 Z" fill="${l}"/><path d="M 89 12 H 111 V 26 H 89 Z" fill="#b7bbaa"/><path d="M 88 28 H 113 M 78 55 H 123 M 63 98 H 137" fill="none" stroke="${c}" stroke-width="4"/><path d="M 96 12 q -4 -7 5 -11 0 6 4 8 l -2 5 Z" fill="#f7d691"/><path d="M 94 96 V 80 q 6 -9 12 0 V 96 M 79 63 v 7 M 118 63 v 7" fill="#4b5364" stroke="#4b5364" stroke-width="3"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" class="wonder-mini" aria-hidden="true" focusable="false"><defs><linearGradient id="${ns}-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="#10101b" stop-opacity="0"/><stop offset="1" stop-color="#10101b" stop-opacity=".33"/></linearGradient></defs><g stroke-linejoin="round" stroke-linecap="round">${body}</g><rect width="200" height="100" fill="url(#${ns}-fade)"/></svg>`;
  }

  globalThis.wonderDrawing=wonderDrawing;
  globalThis.wonderMini=wonderMini;
})();
