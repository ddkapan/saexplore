const fs=require('fs'),vm=require('vm');const ctx={window:{},console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('/Users/dkapan/repos/travel/saexplore/data.js','utf8'),ctx);
const U=ctx.window.UNIC;
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();
// find by scientific (genus+species or genus), then common
function find(sci, common){
  const ns=norm(sci), nc=norm(common);
  // exact sci
  let m=U.find(o=>norm(o.s)===ns); if(m) return {m,how:'sci='};
  // sci starts-with (handles subspecies / author)
  m=U.find(o=>norm(o.s).startsWith(ns+' ')||norm(o.s)===ns); if(m) return {m,how:'sci^'};
  // genus match (first word) if binomial given
  const genus=ns.split(' ')[0];
  const spec=ns.split(' ')[1];
  if(spec){ m=U.find(o=>norm(o.s)===genus+' '+spec); if(m) return {m,how:'binom'}; }
  // exact common
  if(nc){ m=U.find(o=>norm(o.c)===nc); if(m) return {m,how:'com='}; }
  // common contains
  if(nc){ m=U.find(o=>norm(o.c).includes(nc)); if(m) return {m,how:'com~'}; }
  // genus-only (any species in genus) - report count
  const gm=U.filter(o=>norm(o.s).split(' ')[0]===genus);
  if(gm.length) return {m:gm[0],how:'genus('+gm.length+')',genusAll:gm};
  return null;
}
const TARGETS=[
 // [tier, region, common, scientific]
 ['tour','Cape','African Penguin','Spheniscus demersus'],
 ['tour','Cape','Orange-breasted Sunbird','Anthobaphes violacea'],
 ['tour','Cape','Cape Sugarbird','Promerops cafer'],
 ['tour','Cape','King Protea','Protea cynaroides'],
 ['tour','Cape','Rock Hyrax','Procavia capensis'],
 ['tour','Cape','Bontebok','Damaliscus pygargus'],
 ['tour','Cape','Cape Mountain Zebra','Equus zebra'],
 ['tour','Cape','Cape Fur Seal','Arctocephalus pusillus'],
 ['tour','Cape','Southern Right Whale','Eubalaena australis'],
 ['focal','Cape','Chacma Baboon','Papio ursinus'],
 ['focal','Cape','Southern Rock Agama','Agama atra'],
 ['focal','Cape','Angulate Tortoise','Chersina angulata'],
 ['focal','Cape','Foam Grasshopper','Dictyophorus spumans'],
 ['focal','Cape','Real Yellowwood','Podocarpus latifolius'],
 ['focal','Cape','Crane Flower','Strelitzia reginae'],
 ['focal','Cape','Pagoda (Mimetes)','Mimetes'],
 ['tour','Panorama','Verreaux’s Eagle','Aquila verreauxii'],
 ['tour','Panorama','Southern Bald Ibis','Geronticus calvus'],
 ['tour','Panorama','African Finfoot','Podica senegalensis'],
 ['tour','Panorama','Klipspringer','Oreotragus oreotragus'],
 ['tour','Panorama','Samango Monkey','Cercopithecus albogularis'],
 ['focal','Panorama','Vervet Monkey','Chlorocebus pygerythrus'],
 ['focal','Panorama','Cycad (Encephalartos)','Encephalartos'],
 ['focal','Panorama','Aloe','Aloe'],
 ['tour','Lowveld','Lion','Panthera leo'],
 ['tour','Lowveld','Leopard','Panthera pardus'],
 ['tour','Lowveld','African Elephant','Loxodonta africana'],
 ['tour','Lowveld','African Buffalo','Syncerus caffer'],
 ['tour','Lowveld','White Rhino','Ceratotherium simum'],
 ['tour','Lowveld','Cheetah','Acinonyx jubatus'],
 ['tour','Lowveld','Southern Ground Hornbill','Bucorvus leadbeateri'],
 ['tour','Lowveld','Lappet-faced Vulture','Torgos tracheliotos'],
 ['tour','Lowveld','Crowned Eagle','Stephanoaetus coronatus'],
 ['focal','Lowveld','Crested Francolin','Dendroperdix sephaena'],
 ['focal','Lowveld','Marula','Sclerocarya birrea'],
 ['focal','Lowveld','Mopane','Colophospermum mopane'],
 ['tour','Kruger','Lilac-breasted Roller','Coracias caudatus'],
 ['tour','Kruger','African Fish Eagle','Haliaeetus vocifer'],
 ['tour','Kruger','Kori Bustard','Ardeotis kori'],
 ['tour','Kruger','Hippopotamus','Hippopotamus amphibius'],
 ['tour','Kruger','Nile Crocodile','Crocodylus niloticus'],
 ['tour','Kruger','African Wild Dog','Lycaon pictus'],
 ['focal','Kruger','Red-billed Oxpecker','Buphagus erythrorhynchus'],
 ['focal','Kruger','Flap-necked Chameleon','Chamaeleo dilepis'],
 ['focal','Kruger','Baobab','Adansonia digitata'],
 ['focal','Kruger','Fever Tree','Vachellia xanthophloea'],
 // SPECIALTY candidates (hidden gems)
 ['SPEC','Cape','Table Mountain Ghost Frog','Heleophryne rosei'],
 ['SPEC','Cape','Table Mountain Beauty (butterfly)','Aeropetes tulbaghia'],
 ['SPEC','Cape','Red Disa / Pride of Table Mtn','Disa uniflora'],
 ['SPEC','Cape','Cape Rockjumper','Chaetops frenatus'],
 ['SPEC','Kruger','Pel’s Fishing Owl','Scotopelia peli'],
 ['SPEC','Cape','Cape Fever Tree acacia alt','Acacia xanthophloea'],
];
let hit=0,miss=0;
for(const [tier,region,common,sci] of TARGETS){
  const r=find(sci,common);
  if(r){const o=r.m;const sites=Object.keys(o.st).join(',');
    console.log(`${r.how==='genus('+(r.genusAll?r.genusAll.length:0)+')'?'~':'✓'} [${tier}] ${region} | ${common}  ->  ${o.k} | ${o.c||''} | ${o.s} | ${o.g} | e${o._e||0} | @${sites} | (${r.how})`);
    if(!/genus/.test(r.how))hit++;else miss++;
  } else { console.log(`✗ [${tier}] ${region} | ${common} (${sci})  ->  NOT IN DB`); miss++; }
}
console.log(`\n${hit} solid matches, ${miss} miss/genus-only of ${TARGETS.length}`);
