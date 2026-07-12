// Build the accepted-key identity map from the GBIF species cache.
const fs=require('fs'),vm=require('vm');
const S=__dirname;
const ctx={window:{},console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('/Users/dkapan/repos/travel/saexplore/data.js','utf8'),ctx);
const U=ctx.window.UNIC;

function readSp(key){try{return JSON.parse(fs.readFileSync(S+'/gcache/'+key+'.json'));}catch(e){return null;}}
// accepted usageKey for a GBIF record: follow acceptedKey when synonym; else its own key
function acceptedOf(j){
  if(!j) return null;
  if(j.acceptedKey) return String(j.acceptedKey);
  if(j.taxonomicStatus && /SYNONYM/i.test(j.taxonomicStatus) && j.acceptedKey) return String(j.acceptedKey);
  return String(j.key||j.usageKey||'');
}

// map every corpus key -> accepted key (+ metadata)
const idmap={}, meta={}, missing=[];
U.forEach(o=>{
  const raw=String(o.k).replace(/^k/,'');
  const j=readSp(raw);
  if(!j){missing.push(raw);return;}
  const acc=acceptedOf(j)||raw;
  idmap[o.k]=acc;
  if(!meta[acc]) meta[acc]={acc, gbif:j.canonicalName||j.scientificName||'', rank:j.rank||'', kingdom:j.kingdom||'', class:j.class||'', field:o.c||o.s||'', ourKeys:[]};
  meta[acc].ourKeys.push(o.k);
});
// corpus accepted-key set + collisions (two corpus keys -> same accepted = concept lump in our own data)
const acceptedSet=new Set(Object.values(idmap));
const collisions=Object.values(meta).filter(m=>m.ourKeys.length>1);

fs.writeFileSync(S+'/idmap.json',JSON.stringify({idmap,acceptedList:[...acceptedSet]}));
fs.writeFileSync(S+'/idmeta.json',JSON.stringify(meta));
console.log('corpus keys mapped:',Object.keys(idmap).length,'| missing cache:',missing.length);
console.log('distinct accepted keys:',acceptedSet.size,'(vs',U.length,'corpus rows )');
console.log('within-corpus lumps (2+ our keys -> 1 accepted):',collisions.length);
collisions.slice(0,12).forEach(m=>console.log('   ',m.field,'->',m.gbif,'  our keys:',m.ourKeys.join(',')));
if(missing.length) console.log('first missing:',missing.slice(0,8).join(','));
