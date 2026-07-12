const fs=require('fs'),vm=require('vm');const ctx={window:{},console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('/Users/dkapan/repos/travel/saexplore/data.js','utf8'),ctx);
const U=ctx.window.UNIC;
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();
function find(sci){const ns=norm(sci);let m=U.find(o=>norm(o.s)===ns);if(m)return m;
  m=U.find(o=>norm(o.s).startsWith(ns+' '));if(m)return m;
  const g=ns.split(' ')[0];const gm=U.filter(o=>norm(o.s).split(' ')[0]===g);return gm[0]||null;}
// curated final list: [tier, scientific]
const L=[
 // TOUR — the shared spectacle
 ['tour','Spheniscus demersus'],['tour','Anthobaphes violacea'],['tour','Promerops cafer'],
 ['tour','Protea cynaroides'],['tour','Procavia capensis'],['tour','Damaliscus pygargus'],
 ['tour','Equus zebra'],['tour','Arctocephalus pusillus'],['tour','Eubalaena australis'],
 ['tour','Aquila verreauxii'],['tour','Geronticus calvus'],['tour','Podica senegalensis'],
 ['tour','Oreotragus oreotragus'],['tour','Cercopithecus mitis'],['tour','Panthera leo'],
 ['tour','Panthera pardus'],['tour','Loxodonta africana'],['tour','Syncerus caffer'],
 ['tour','Ceratotherium simum'],['tour','Acinonyx jubatus'],['tour','Bucorvus leadbeateri'],
 ['tour','Torgos tracheliotos'],['tour','Stephanoaetus coronatus'],['tour','Coracias caudatus'],
 ['tour','Icthyophaga vocifer'],['tour','Ardeotis kori'],['tour','Hippopotamus amphibius'],
 ['tour','Crocodylus niloticus'],['tour','Lycaon pictus'],
 // FOCAL — the naturalist's deeper list
 ['focal','Papio ursinus'],['focal','Agama atra'],['focal','Chersina angulata'],
 ['focal','Dictyophorus spumans'],['focal','Podocarpus latifolius'],['focal','Mimetes fimbriifolius'],
 ['focal','Chlorocebus pygerythrus'],['focal','Aloe arborescens'],['focal','Ortygornis sephaena'],
 ['focal','Sclerocarya birrea'],['focal','Colophospermum mopane'],['focal','Buphagus erythrorhynchus'],
 ['focal','Chamaeleo dilepis'],['focal','Adansonia digitata'],['focal','Vachellia xanthophloea'],
 // SPECIALTY (focal) — the story others miss
 ['focal','Aeropetes tulbaghia'],['focal','Disa uniflora'],['focal','Scotopelia peli'],
];
const marks={};const rows=[];const seenKey={};
for(const [tier,sci] of L){const o=find(sci);if(!o){rows.push('MISS '+sci);continue;}
  if(seenKey[o.k]){rows.push('dup '+sci+' -> '+o.k);continue;}seenKey[o.k]=1;
  marks[o.k]=tier;rows.push(tier+'  '+o.k+'  '+(o.c||o.s)+'  ('+o.s+')');}
const out={v:2,app:'saexplore',exported:'2026-07-11',note:'Focal/tour favorites preload — Cal Academy SA 2026. Import merges these pins; your notes/checklist/journal are untouched.',marks:marks};
const dir='/Users/dkapan/repos/travel/saexplore/samples';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(dir+'/saexplore-favorites.json',JSON.stringify(out,null,2));
const n={tour:0,focal:0};Object.values(marks).forEach(v=>n[v]++);
console.log(rows.join('\n'));
console.log('\nWROTE samples/saexplore-favorites.json  ·  '+n.tour+' tour + '+n.focal+' focal = '+Object.keys(marks).length+' favorites');
