const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),context=vm.createContext({Intl,Date,Set,Object,Number,Error});
const source=fs.readFileSync(path.join(root,'src/data.js'),'utf8').replace('/*__RESEARCH__*/',fs.readFileSync(path.join(root,'sources.json'),'utf8'));
vm.runInContext(source+'\n'+fs.readFileSync(path.join(root,'src/learning.js'),'utf8')+'\nglobalThis.api=Learning;globalThis.wonders=WONDERS;',context);
const L=context.api,now=1800000000000,day=86400000;
assert.equal(context.wonders.length,7);assert.equal(L.cards.length,28);assert.equal(new Set(L.cards.map(c=>c.id)).size,28);
assert.equal(L.select('all','architecture').length,20);assert.equal(L.select('geo','statue').length,2);assert.equal(L.select('all','gardens').length,4);
let entry;
for(const days of [1,3,7,14,30,30]){entry=L.grade(entry,'good',now);assert.equal(entry.due,now+days*day);}
entry=L.grade(entry,'again',now);assert.equal(entry.due,now+600000);assert.equal(entry.step,0);assert.equal(L.grade(entry,'good',now).due,now+day);
assert.equal(L.grade(undefined,'easy',now).due,now+3*day);assert.throws(()=>L.grade(undefined,'invalid',now));
const p={'zeus:name':L.grade(undefined,'good',now)};
assert.equal(L.due(L.cards,p,now).length,27);assert.equal(L.due(L.cards,p,now+day).length,28);
assert.equal(Object.keys(L.clean({version:1,cards:{...p,'bogus:name':p['zeus:name'],'zeus:geo':{step:99,due:now,seen:1},'khufu:name':{step:0,due:-1,seen:1}}})).length,1);
assert.equal(Object.keys(L.clean(null)).length,0);assert.equal(Object.keys(L.clean({version:2,cards:p})).length,0);
for(const card of L.cards){const c=L.content(card);for(const key of ['question','hint','answer','detail'])assert.ok(c[key]&&c[key].length>0,card.id+' '+key);}
assert.match(L.content(L.cards.find(c=>c.id==='gardens:era')).answer,/традици/);
assert.match(L.content(L.cards.find(c=>c.id==='artemis:era')).answer,/IV/);
assert.equal(context.wonders.find(w=>w.id==='gardens').city,'Вавилон');
console.log('PASS: 28 cards, filters, intervals, due boundary, storage validation, complete answers, historical qualifications.');
