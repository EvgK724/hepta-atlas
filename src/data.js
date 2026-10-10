/* Museum and archaeological source records are embedded at build time. */
const RESEARCH = /*__RESEARCH__*/;
const EDITORIAL = {
  khufu:{evidenceAnswer:"Единую схему подъёма всех блоков",titles:["Единственное уцелевшее", "Высота тогда и сейчас", "Логистика в папирусах"],anchor:'Каменная вечность',engineeringTitle:'Масса, геометрия и распределение нагрузки',pair:'lighthouse'},
  gardens:{evidenceAnswer:"Место, облик и отождествление садов",titles:["Не в воздухе", "Поздние свидетельства", "Гипотеза Ниневии"],anchor:'Зелёный вопрос',engineeringTitle:'Вода и сад над землёй — инженерная гипотеза',pair:'khufu'},
  zeus:{evidenceAnswer:"Точное место и обстоятельства гибели",titles:["Сидящий бог", "Не монолит", "Следы мастерской"],anchor:'Бог, который сидит',engineeringTitle:'Каркас внутри, драгоценные материалы снаружи',pair:'colossus'},
  artemis:{evidenceAnswer:"Полную точность облика и декора",titles:["Несколько строительных эпох", "Колонна как скульптура", "Древний и современный город"],anchor:'Храм, построенный заново',engineeringTitle:'Колонна и балка — каменный лес опор',pair:'mausoleum'},
  mausoleum:{evidenceAnswer:"Точные пропорции целого здания",titles:["Имя стало словом", "Кони над крышей", "Галикарнас и Бодрум"],anchor:'Имя стало словом',engineeringTitle:'Высокий постамент и ярусы над ним',pair:'artemis'},
  colossus:{evidenceAnswer:"Место установки, позу и способ сборки",titles:["Бог Солнца", "Миф о гавани", "Бронзовые мастерские"],anchor:'Бронзовый великан',engineeringTitle:'Большая статуя не обязана быть сплошной',pair:'zeus'},
  lighthouse:{evidenceAnswer:"Точную высоту и устройство света",titles:["Остров Фарос", "Монеты как источник", "Подводная археология"],anchor:'Свет над морем',engineeringTitle:'Ярусы, сужение и устойчивость башни',pair:'khufu'}
};
const WONDERS=RESEARCH.wonders.map(w=>({...w,...EDITORIAL[w.id],cityFull:w.city,city:w.city.split(' — ')[0].split(', ')[0],eraShort:w.eraShort.split(' · ')[0],lat:w.coordinates.lat,lon:w.coordinates.lon}));
const BY_ID=Object.fromEntries(WONDERS.map(w=>[w.id,w]));
const memoryText=w=>w.mnemonic.replace(/^Учебная ассоциация:\s*/,'');
const groupName=w=>w.group==='statue'?'Скульптура':'Архитектура';
