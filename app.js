/* Southern Africa — Species Explorer · app.js
 * Offline PWA, no dependencies. index.html loads data.js then this file.
 * CSS string IIFE -> window.APP5 (builds the funnel shell) -> window.__wire5 (renders + wires).
 * v1.0.24 — "funnel that becomes a workbench" redesign (imported from the design pass).
 */
(function(){var st=document.createElement("style");st.textContent="\n"+
":root{--paper:#f4efe4;--raised:#fbf7ee;--ink:#2b2723;--soft:#6b6459;--rule:#cfc5b2;--acacia:#5e7249;--terra:#b5623c;--museum:#9c7a2f;--genomic:#7a5aa6;--serif:\"Iowan Old Style\",\"Palatino Linotype\",Palatino,Georgia,serif}\n"+
"[data-theme=dark]{--paper:#22201c;--raised:#2b2824;--ink:#ede7da;--soft:#a79e8e;--rule:#3c382f;--acacia:#8aa06a;--terra:#c9784f;--museum:#c9a24e;--genomic:#a487cf}\n"+
"@keyframes drawerIn{from{transform:translateX(100%)}to{transform:none}}\n"+
"@keyframes mkPulse{0%{box-shadow:0 0 0 0 rgba(181,98,60,.45)}100%{box-shadow:0 0 0 9px rgba(181,98,60,0)}}\n"+
"*{box-sizing:border-box}html,body{margin:0}body{background:var(--paper);color:var(--ink);font-family:var(--serif);line-height:1.5;-webkit-font-smoothing:antialiased;transition:background .2s,color .2s}\n"+
"a{color:var(--acacia);text-underline-offset:2px}a:hover{color:var(--terra)}\n"+
".sans{font-family:system-ui,-apple-system,sans-serif}\n"+
"#app{max-width:1180px;margin:0 auto;padding:20px 24px 70px}\n"+
".fh{display:flex;align-items:baseline;gap:11px;cursor:pointer;padding:11px 0;border-top:1px solid var(--rule)}\n"+
".fh .tri{color:var(--terra);font-size:12px;width:11px;display:inline-block}\n"+
".fh .ix{font-family:system-ui,sans-serif;font-size:11px;color:var(--soft);letter-spacing:1.5px}\n"+
".fh h2{font-size:20px;margin:0;font-weight:600}\n"+
".fh .cap{font-family:system-ui,sans-serif;font-size:12.5px;color:var(--soft)}\n"+
".fb{padding:0 0 16px 22px}\n"+
".chip{border:1px solid var(--rule);background:var(--raised);border-radius:13px;padding:3px 10px;cursor:pointer;user-select:none;white-space:nowrap;font-family:system-ui,sans-serif;font-size:12px}\n"+
".chip.mini{font-size:11px;padding:3px 9px;border-radius:11px}\n"+
".btn{border:1px solid var(--acacia);color:var(--acacia);background:var(--raised);border-radius:8px;padding:5px 11px;cursor:pointer;font-family:system-ui,sans-serif;font-size:12.5px;font-weight:600}\n"+
".btn.pri{background:var(--acacia);color:#fbf7ee;border-color:var(--acacia)}\n"+
".strip{position:sticky;top:0;z-index:30;background:var(--raised);border:1px solid var(--rule);border-radius:9px;padding:8px 11px;margin-bottom:9px;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;font-family:system-ui,sans-serif;font-size:12px;box-shadow:0 1px 6px rgba(43,39,35,.06)}\n"+
".strip input[type=search]{border:1px solid var(--rule);border-radius:13px;padding:4px 11px;font:inherit;background:var(--paper);color:var(--ink);min-width:150px}\n"+
".mkr{position:absolute;transform:translate(-50%,-50%);cursor:pointer}\n"+
".mkr .dot{border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)}\n"+
".mkr .lb{position:absolute;left:15px;top:-2px;white-space:nowrap;font-family:system-ui,sans-serif;font-size:10px;background:rgba(251,247,238,.88);padding:0 4px;border-radius:3px;color:#2b2723}\n"+
"table.mx{border-collapse:collapse;font-family:var(--serif);min-width:100%}\n"+
"table.mx thead th{position:sticky;top:0;background:var(--raised);z-index:2;font-family:system-ui,sans-serif}\n"+
"tr.org{border-bottom:1px solid var(--rule)}tr.org:hover{background:var(--raised)}tr.org.hid{display:none}\n"+
"td.cell{width:30px;text-align:center;padding:3px;cursor:pointer}\n"+
"td.cell.seen{background:color-mix(in srgb,var(--acacia) 16%,transparent)}\n"+
".ckchip{white-space:nowrap;cursor:pointer;font-family:system-ui,sans-serif;font-size:11px;border-radius:11px;padding:3px 9px;border:1px solid var(--rule)}\n"+
".noteta{width:100%;min-height:70px;border:1px solid var(--rule);border-radius:6px;padding:8px;font-family:system-ui,sans-serif;font-size:13px;background:var(--raised);color:var(--ink);resize:vertical}\n"+
"#scrim{position:fixed;inset:0;background:rgba(30,26,22,.42);z-index:70;display:none}\n"+
"#drawer{position:fixed;top:0;right:0;height:100%;width:min(500px,94vw);background:var(--paper);z-index:71;box-shadow:-8px 0 34px rgba(30,26,22,.28);transform:translateX(100%);transition:transform .2s;overflow:auto;border-left:5px solid var(--soft)}\n"+
"#drawer.open{transform:none}\n"+
".dlab{font-size:9.5px;font-weight:700;letter-spacing:.5px;color:var(--acacia);text-transform:uppercase;margin-bottom:4px;font-family:system-ui,sans-serif}\n"+
"#journal{position:fixed;inset:0;background:#d9d2c2;z-index:90;display:none;overflow:auto}\n"+
"#themeToggle{position:fixed;top:8px;right:10px;z-index:80;width:34px;height:34px;border-radius:50%}\n"+
".dual{position:relative;height:26px;width:160px;display:inline-block}\n"+
".dual .trk{position:absolute;top:11px;height:3px;left:0;right:0;background:var(--rule);border-radius:2px}\n"+
".dual .bnd{position:absolute;top:10px;height:5px;background:var(--soft);opacity:.65;border-radius:2px}\n"+
".dual input{position:absolute;top:0;left:0;width:100%;height:26px;margin:0;background:none;-webkit-appearance:none;pointer-events:none}\n"+
".dual input::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:15px;height:15px;border-radius:50%;background:var(--raised);border:1.5px solid var(--ink);cursor:pointer}\n"+
".dual input::-moz-range-thumb{pointer-events:auto;width:15px;height:15px;border-radius:50%;background:var(--raised);border:1.5px solid var(--ink);cursor:pointer}\n"+
".tx-Aves{--tc:#4a6b8a}.tx-Mammalia{--tc:#b0925e}.tx-Reptilia{--tc:#c08a2e}.tx-Amphibia{--tc:#3e8a7e}.tx-Actinopterygii{--tc:#5f7e96}.tx-Insecta{--tc:#7a5a8a}.tx-Arachnida{--tc:#7a3b3b}.tx-Mollusca{--tc:#b3697e}.tx-Plantae{--tc:#5e7249}.tx-Other{--tc:#888}\n"+
"@media print{#app,#scrim,#drawer,#themeToggle{display:none!important}#journal{position:static!important;display:block!important;background:#fff!important;overflow:visible!important}#journal .jclose,#journal .jprint,#journal .jscope{display:none!important}}\n"+
"@media(max-width:680px){#app{padding:14px 12px 60px}#mapGrid{grid-template-columns:1fr!important}#mapLeft,#mapRight{border:none!important;border-top:1px solid var(--rule)!important;max-height:none!important}}\n"+
"";document.head.appendChild(st);})();

window.APP5=function(UNIC,SMETA,MAPIMG){
 var esc=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
 window.__esc=esc;window.__MAPIMG=MAPIMG;
 function sec(n,title,cap){return '<div class="fh" data-sec="'+n+'"><span class="tri">▾</span><span class="ix">0'+n+'</span><h2>'+title+'</h2><span class="cap">— '+cap+'</span></div>';}
 var h='';
 h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap">'+
   '<div><h1 style="font-size:30px;margin:0 0 4px;font-weight:600;letter-spacing:-.2px">Southern Africa — Species Explorer</h1>'+
   '<p class="sans" style="margin:0;font-size:13px;color:var(--soft)">Cal Academy field guide · 20 Jul – 1 Aug 2026 · ten localities, Cape winter to Kruger dry season.</p></div>'+
   '<div style="display:flex;align-items:center;gap:12px"><span class="sans" style="font-size:11.5px;color:var(--soft);max-width:210px;text-align:right;line-height:1.35">Read down the funnel to orient. Collapse each <b style="color:var(--terra)">▾</b> as you learn it — the list rises and you graduate to fluent mode.</span>'+
   '<button id="openJournal" class="btn pri sans">Field journal ▸</button></div></div>';
 // 1 South Africa
 h+=sec(1,'South Africa','the frame')+'<div class="fb" data-body="1">'+
   '<p style="max-width:660px;margin:.1em 0 12px">Thirteen days across two of the planet’s great biological theatres: the <b>Cape Floristic Region</b> — the smallest and richest of the world’s six floral kingdoms<sup><a href="#refs" style="text-decoration:none">1</a></sup> — and the summer-rain <b>savanna of the Lowveld</b>. We travel in austral winter, and each region is read on its own clock.</p>'+
   '<div class="sans" id="saStats" style="display:flex;gap:28px;flex-wrap:wrap;font-size:12px;color:var(--soft);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:9px 0;max-width:660px"></div></div>';
 // 2 regions
 h+=sec(2,'The two regions','the axis everything hinges on')+'<div class="fb" data-body="2">'+
   '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:12px">'+
   '<div class="regcard" data-region="cape" style="flex:1;min-width:250px;background:var(--raised);border:1px solid var(--rule);border-left:5px solid rgb(45,110,126);border-radius:8px;padding:13px 15px;cursor:pointer"><div class="sans" style="font-size:10.5px;font-weight:700;letter-spacing:1px;color:rgb(45,110,126);text-transform:uppercase">Cape · first half</div><h3 style="margin:3px 0 5px;font-size:17px;font-weight:600">Winter-rain fynbos</h3><p class="sans" style="margin:0;font-size:12.5px;color:var(--soft);line-height:1.45">Five peninsula sites, 20–24 Jul. Cool, wet, still mornings; sunbirds on the proteas, seabirds inshore. Rain comes now.</p></div>'+
   '<div class="regcard" data-region="lowveld" style="flex:1;min-width:250px;background:var(--raised);border:1px solid var(--rule);border-left:5px solid rgb(176,120,52);border-radius:8px;padding:13px 15px;cursor:pointer"><div class="sans" style="font-size:10.5px;font-weight:700;letter-spacing:1px;color:rgb(176,120,52);text-transform:uppercase">Lowveld · second half</div><h3 style="margin:3px 0 5px;font-size:17px;font-weight:600">Summer-rain savanna</h3><p class="sans" style="margin:0;font-size:12.5px;color:var(--soft);line-height:1.45">Five escarpment &amp; Kruger sites, 26 Jul–1 Aug. Dry season — game and birds concentrate at the last water. Rain is months away.</p></div></div>'+
   '<div class="sans" style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--soft);flex-wrap:wrap"><span>Focus the trip on:</span><div id="regToggle" style="display:inline-flex;border:1px solid var(--rule);border-radius:9px;overflow:hidden">'+
   '<button class="segbtn" data-region="all" style="border:none;background:none;padding:5px 12px;cursor:pointer;font:inherit;color:var(--acacia)">Whole trip</button>'+
   '<button class="segbtn" data-region="cape" style="border:none;border-left:1px solid var(--rule);background:none;padding:5px 12px;cursor:pointer;font:inherit;color:var(--acacia)">Cape</button>'+
   '<button class="segbtn" data-region="lowveld" style="border:none;border-left:1px solid var(--rule);background:none;padding:5px 12px;cursor:pointer;font:inherit;color:var(--acacia)">Lowveld</button></div>'+
   '<span style="color:var(--soft)">— the top filter; the map, sites and list all follow.</span></div></div>';
 // 3 trip + map
 h+=sec(3,'The trip','itinerary &amp; the shared map')+'<div class="fb" data-body="3">'+
   '<div style="background:var(--raised);border:1px solid var(--rule);border-radius:10px;overflow:hidden">'+
   '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--rule)"><div style="display:flex;gap:5px">'+
   '<button id="tPrev" title="previous stop" class="sans" style="border:1px solid var(--rule);background:var(--paper);border-radius:7px;padding:4px 9px;cursor:pointer;color:var(--acacia)">◀</button>'+
   '<button id="tPlay" class="sans" style="border:1px solid var(--acacia);background:var(--acacia);color:#fbf7ee;border-radius:7px;padding:4px 12px;cursor:pointer;font-size:12.5px;font-weight:600">▶ Play tour</button>'+
   '<button id="tNext" title="next stop" class="sans" style="border:1px solid var(--rule);background:var(--paper);border-radius:7px;padding:4px 9px;cursor:pointer;color:var(--acacia)">▶</button></div>'+
   '<div id="itin" style="display:flex;gap:0;overflow-x:auto;flex:1;align-items:stretch"></div></div>'+
   '<div id="mapGrid" style="display:grid;grid-template-columns:262px 1fr 236px">'+
   '<div id="mapLeft" class="sans" style="border-right:1px solid var(--rule);padding:13px 14px;font-size:12px;min-height:312px;max-height:412px;overflow:auto"></div>'+
   '<div style="position:relative"><div id="mapSurface" style="position:relative;height:100%;min-height:312px;overflow:hidden;background:linear-gradient(160deg,#e9e4d3,#e0d9c4)"></div></div>'+
   '<div id="mapRight" class="sans" style="border-left:1px solid var(--rule);padding:12px 12px;font-size:12px;min-height:312px;max-height:412px;overflow:auto"></div></div></div></div>';
 // 4 sites
 h+=sec(4,'The sites','ten localities, each with a field account')+'<div class="fb" data-body="4">'+
   '<p class="sans" style="margin:.1em 0 10px;font-size:12.5px;color:var(--soft);max-width:660px">Chips are tinted by winter rainfall — <span style="color:rgb(45,110,126)">wet Cape teal</span> to <span style="color:rgb(176,120,52)">dry Lowveld sand</span>. Click one to focus (map zooms, its Grinnell account opens beside the map, the list narrows to that column). Click it again to restore. ⌘/Ctrl-click to compare.</p>'+
   '<div id="siteChips" style="display:flex;flex-wrap:wrap;gap:7px"></div></div>';
 // 5 groups
 h+=sec(5,'The groups','taxa: the first, most visual cut')+'<div class="fb" data-body="5">'+
   '<div style="display:flex;flex-wrap:wrap;gap:7px;align-items:center"><div id="taxaChips" style="display:flex;flex-wrap:wrap;gap:7px"></div>'+
   '<button id="taxAll" class="chip sans">all</button><button id="taxNone" class="chip sans">none</button></div></div>';
 // 6 filters & evidence
 h+=sec(6,'Filters &amp; evidence','how you narrow, and why to trust it')+'<div class="fb sans" data-body="6" style="font-size:12.5px">'+
   '<div style="display:flex;flex-wrap:wrap;gap:26px 40px">'+
   '<div><div class="dlab">Abundance</div><div id="abChips" style="display:flex;gap:5px;align-items:center"></div><div style="font-size:11px;color:var(--soft);margin-top:5px">rare ← → common</div></div>'+
   '<div><div class="dlab">Specimen year</div><div class="dual" id="yrD"><span class="trk"></span><span class="bnd" id="yrBnd"></span><input type="range" id="yrLo"><input type="range" id="yrHi"></div><div style="font-size:11px;color:var(--soft)"><span id="yrLoLab"></span> – <span id="yrHiLab"></span> · museum records</div></div>'+
   '<div><div class="dlab">Season</div><div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap"><button class="tripBtn" style="border:1px solid #2f4f86;background:var(--raised);color:#2f4f86;border-radius:13px;padding:4px 11px;cursor:pointer;font:inherit;font-weight:600">★ late Jul</button><button class="allyrBtn" style="border:1px solid var(--rule);background:var(--raised);color:var(--soft);border-radius:13px;padding:4px 11px;cursor:pointer;font:inherit">all yr</button><span class="seasonchip" data-se="0">Summer</span><span class="seasonchip" data-se="1">Autumn</span><span class="seasonchip" data-se="2">Winter</span><span class="seasonchip" data-se="3">Spring</span></div></div>'+
   '<div><div class="dlab">Sort</div><div style="display:flex;gap:5px"><span class="sortchip" data-sort="az">A→Z</span><span class="sortchip" data-sort="za">Z→A</span><span class="sortchip" data-sort="tax">taxonomic</span></div></div></div>'+
   '<div style="margin-top:18px;border-top:1px solid var(--rule);padding-top:12px"><div class="dlab" style="margin-bottom:8px">Evidence — strongest on the left</div><div id="evLegend" style="display:flex;flex-wrap:wrap;gap:20px"></div></div></div>';
 // 7 results
 h+=sec(7,'The results','the working checklist · columns are sites, rows are organisms')+'<div class="fb" data-body="7" style="padding:0 0 16px 8px">'+
   '<div class="strip"><span style="font-weight:700;color:var(--soft);font-size:10.5px;letter-spacing:.5px;text-transform:uppercase">Filters at hand</span>'+
   '<div id="stripTaxa" style="display:flex;gap:5px;flex-wrap:wrap"></div>'+
   '<input id="q" type="search" placeholder="search name or type…">'+
   '<div id="stripSites" style="display:flex;gap:5px;flex-wrap:wrap"></div>'+
   '<button class="tripBtn" style="border:1px solid #2f4f86;background:var(--raised);color:#2f4f86;border-radius:13px;padding:4px 11px;cursor:pointer;font:inherit;font-weight:600">★ late Jul</button>'+
   '<span id="seenTally" class="sans" style="font-size:11.5px;font-weight:700;color:#fbf7ee;background:var(--acacia);border:1px solid var(--acacia);border-radius:12px;padding:3px 10px;display:none"></span>'+
   '<span id="count" style="margin-left:auto;color:var(--soft);font-weight:600"></span></div>'+
   '<div id="matrix"></div><div id="status" class="sans" style="font-size:12px;color:var(--soft);margin-top:8px"></div></div>';
 // 8 export
 h+=sec(8,'Export','a Grinnell field-journal page')+'<div class="fb" data-body="8"><div id="exportPanel" style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;background:var(--raised);border:1px solid var(--rule);border-radius:10px;padding:14px 16px">'+
   '<div style="flex:1;min-width:220px"><p class="sans" style="margin:0 0 10px;font-size:12.5px;color:var(--soft);max-width:460px">A saveable page per day, in the spirit of the buff Grinnell journal: the day’s <b>narrative</b> on top, <b>species accounts with your own notes</b> in the middle, the day’s <b>checklist</b> at the bottom. Prints beautifully — a keepsake, not a CSV. <b>Export is how notes are saved</b> — there is no cloud; export early, export often.</p>'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="openJournal2 btn pri sans">Open field journal ▸</button><button id="expJson" class="btn sans">Export notes (JSON)</button><button id="impJson" class="btn sans">Import…</button><input id="impFile" type="file" accept="application/json,.json" style="display:none"></div></div></div></div>';
 // footer + references
 h+='<footer class="sans" id="appfoot" style="margin-top:30px;border-top:1px solid var(--rule);padding:12px 0;font-size:11.5px;color:var(--soft)"><span style="font-weight:700;color:var(--acacia)">v1.0.24</span> · built 2026-07-10 PDT<br>One organism per row, reconciled on the GBIF Backbone. Evidence glyphs by solidity: <b>filled square</b>=museum voucher (physical truth) · <b>outlined square</b>=genomic (a projection) · <b>ring</b>=iNaturalist sighting · <b>chevron</b>=eBird. Photos CC-licensed via iNaturalist, with Wikimedia Commons fallback.</footer>';
 var app=document.getElementById('app');app.innerHTML=h;
 // overlays
 var ov=document.createElement('div');ov.innerHTML='<div id="scrim"></div><div id="drawer"></div><div id="journal"></div><button class="btn sans" id="themeToggle" title="light / dark">◐</button>';
 while(ov.firstChild)document.body.appendChild(ov.firstChild);
 window.__wire5&&window.__wire5(UNIC,SMETA);
};

window.__wire5=function(UNIC,SMETA){
 var esc=window.__esc,MI=window.__MAPIMG;
 var $=function(s,r){return (r||document).querySelector(s);},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
 var C={paper:'#f4efe4',raised:'#fbf7ee',ink:'#2b2723',soft:'#6b6459',rule:'#cfc5b2',acacia:'#5e7249',terra:'#b5623c'};
 var TAXCOL={Aves:'#4a6b8a',Mammalia:'#b0925e',Reptilia:'#c08a2e',Amphibia:'#3e8a7e',Actinopterygii:'#5f7e96',Insecta:'#7a5a8a',Arachnida:'#7a3b3b',Mollusca:'#b3697e',Plantae:'#5e7249',Other:'#888'};
 var GORDER=[['Aves','Birds'],['Mammalia','Mammals'],['Reptilia','Reptiles'],['Amphibia','Amphibians'],['Actinopterygii','Fish'],['Insecta','Insects'],['Arachnida','Arachnids'],['Mollusca','Molluscs'],['Plantae','Plants'],['Other','Other']];
 var order={};GORDER.forEach(function(p,i){order[p[0]]=i;});
 var MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 var SITES=SMETA.sites;var SI={};SITES.forEach(function(s,i){SI[s.key]=s;s.i=i;s.rk=(s.region==='Cape Town')?'cape':'lowveld';});
 // itinerary dates (authored — data.js carries no date field)
 var DATE={kirstenbosch:'20 Jul',tablemtn:'21 Jul',capepoint:'22 Jul',boulders:'23 Jul',houtbay:'24 Jul',blyde:'26 Jul',moholoholo:'27 Jul',karongwe:'28 Jul',kruger_letaba:'30 Jul',kruger_mdluli:'31 Jul'};
 var DORD={kirstenbosch:0,tablemtn:1,capepoint:2,boulders:3,houtbay:4,blyde:5,moholoholo:6,karongwe:7,kruger_letaba:8,kruger_mdluli:9};
 SITES.forEach(function(s){s.date=DATE[s.key]||'';s.dord=DORD[s.key]==null?99:DORD[s.key];});
 var WET={kirstenbosch:.95,tablemtn:.88,houtbay:.82,boulders:.7,capepoint:.62,blyde:.42,moholoholo:.28,karongwe:.2,kruger_letaba:.16,kruger_mdluli:.14};
 function colr(w){var a=[176,120,52],b=[45,110,126];return 'rgb('+Math.round(a[0]+(b[0]-a[0])*w)+','+Math.round(a[1]+(b[1]-a[1])*w)+','+Math.round(a[2]+(b[2]-a[2])*w)+')';}
 function sitecol(k){var v=WET[k];if(v==null)v=.5;return colr(v);}window.__sitecol=sitecol;
 // ---------- glyphs ----------
 function glyph(k,lit){var op=lit?1:.26;var s='<svg width="12" height="12" viewBox="0 0 12 12" style="opacity:'+op+';vertical-align:middle">';
  if(k==='m')s+='<rect x="2" y="2" width="8" height="8" fill="#9c7a2f"/>';
  else if(k==='g')s+='<rect x="2.5" y="2.5" width="7" height="7" fill="none" stroke="#7a5aa6" stroke-width="1.3"/><line x1="3" y1="9" x2="9" y2="3" stroke="#7a5aa6" stroke-width="1"/>';
  else if(k==='e')s+='<path d="M2 8 L6 4 L10 8" fill="none" stroke="#4a6b8a" stroke-width="1.6"/>';
  else s+='<circle cx="6" cy="6" r="3.4" fill="none" stroke="#3e8a7e" stroke-width="1.5"/>';
  return s+'</svg>';}
 window.__GLYPH=glyph;
 function badges(o){return ['m','g','i','e'].map(function(k){return glyph(k,o.src.indexOf(k)>=0?1:0);}).join('');}
 // ---------- precompute per-org ----------
 UNIC.forEach(function(o,i){o.i=i;o._sites=Object.keys(o.st);var me=0,yrs=[];o._sites.forEach(function(k){var s=o.st[k];if(s.e&&s.e[4]>me)me=s.e[4];if(s.i&&s.i[2]>me)me=s.i[2];var m=s.m;if(m){if(m[4]&&m[4].length)m[4].forEach(function(y){yrs.push(y);});else if(m[3]&&m[3][0])yrs.push(m[3][0]);}});o._e=me||0;o._yr=yrs;});
 UNIC.sort(function(a,b){var d=(order[a.g]==null?9:order[a.g])-(order[b.g]==null?9:order[b.g]);if(d)return d;return (a.c||a.s).localeCompare(b.c||b.s);});
 UNIC.forEach(function(o,i){o.i=i;});
 // ---------- persistence ----------
 var seen,notes,seenOrder,journal,inatobs;
 function LG(k,d){try{return JSON.parse(localStorage.getItem(k))||d;}catch(e){return d;}}
 seen=new Set(LG('sa5_seen',[]));notes=LG('sa5_notes',{});seenOrder=LG('sa5_seenOrder',[]);journal=LG('sa5_journal',{});inatobs=LG('sa5_inatobs',{});
 function save(){try{localStorage.setItem('sa5_seen',JSON.stringify(Array.from(seen)));localStorage.setItem('sa5_notes',JSON.stringify(notes));localStorage.setItem('sa5_seenOrder',JSON.stringify(seenOrder));localStorage.setItem('sa5_journal',JSON.stringify(journal));localStorage.setItem('sa5_inatobs',JSON.stringify(inatobs));}catch(e){}}
 window.__sa={get seen(){return seen;},get notes(){return notes;},get journal(){return journal;},get inatobs(){return inatobs;},save:save};
 function seenSpeciesMap(){var m={};seen.forEach(function(ck){m[ck.split('|')[0]]=1;});return m;}
 function seenSpeciesCount(){return Object.keys(seenSpeciesMap()).length;}
 function updateSeenOrder(){var m=seenSpeciesMap();seenOrder=seenOrder.filter(function(k){return m[k];});Object.keys(m).forEach(function(k){if(seenOrder.indexOf(k)<0)seenOrder.push(k);});save();}
 // ---------- state ----------
 var S={region:'all',focus:null,taxa:{},q:'',months:new Set([0,1,2,3,4,5,6,7,8,9,10,11]),tripwin:false,abMin:1,yLo:(SMETA.gbifYears||[1838,2026])[0],yHi:(SMETA.gbifYears||[1838,2026])[1],sort:'az'};
 GORDER.forEach(function(p){S.taxa[p[0]]=1;});
 var GY=SMETA.gbifYears||[1838,2026];
 window.__S=S;
 // ---------- helpers ----------
 function visSites(){return SITES.filter(function(s){return S.region==='all'||s.rk===S.region;});}
 function presentAt(o,k){var s=o.st[k];return !!(s&&(s.e||s.i||s.m));}
 function itinList(){return visSites().slice().sort(function(a,b){return a.dord-b.dord;});}

 // ---------- SA stats ----------
 (function(){var el=$('#saStats');if(!el)return;el.innerHTML='<span><b style="font-family:var(--serif);font-size:16px;color:var(--ink)">~9,000</b>&nbsp; fynbos plant species, ~70% endemic</span><span><b style="font-family:var(--serif);font-size:16px;color:var(--ink)">10</b>&nbsp; localities</span><span><b style="font-family:var(--serif);font-size:16px;color:var(--ink)">'+UNIC.length.toLocaleString()+'</b>&nbsp; organisms on file</span>';})();

 // ---------- evidence legend ----------
 (function(){var el=$('#evLegend');if(!el)return;var rows=[['m','Museum voucher','A physical specimen — the firmest evidence a name exists here.'],['g','Genomic','Sequence derived from a specimen; links back to the collection event.'],['i','iNaturalist','Photographed, community-curated sightings — a public virtual museum.'],['e','eBird','Reviewer-vetted bird records; an honor system that works at scale.']];el.innerHTML=rows.map(function(r){return '<div style="max-width:230px">'+glyph(r[0],1)+' <b>'+r[1]+'</b><div style="color:var(--soft);line-height:1.4;margin-top:2px">'+r[2]+'</div></div>';}).join('');})();

 // ---------- taxa chips ----------
 function buildTaxa(){['#taxaChips','#stripTaxa'].forEach(function(sel){var box=$(sel);if(!box)return;box.innerHTML='';GORDER.forEach(function(p){var b=document.createElement('button');b.className='chip tax mini';b.dataset.g=p[0];b.textContent=p[1];b.style.borderColor=TAXCOL[p[0]];box.appendChild(b);});});
  $$('.chip.tax').forEach(function(b){b.onclick=function(){S.taxa[b.dataset.g]=S.taxa[b.dataset.g]?0:1;paintTaxa();applyFilters();};});paintTaxa();}
 function paintTaxa(){$$('.chip.tax').forEach(function(b){var on=S.taxa[b.dataset.g];var col=TAXCOL[b.dataset.g];b.style.background=on?col:C.raised;b.style.color=on?'#fff':col;});}
 $('#taxAll').onclick=function(){GORDER.forEach(function(p){S.taxa[p[0]]=1;});paintTaxa();applyFilters();};
 $('#taxNone').onclick=function(){GORDER.forEach(function(p){S.taxa[p[0]]=0;});paintTaxa();applyFilters();};

 // ---------- site chips (funnel + strip) ----------
 function buildSiteChips(){['#siteChips','#stripSites'].forEach(function(sel,idx){var box=$(sel);if(!box)return;box.innerHTML='';SITES.forEach(function(s){var b=document.createElement('button');b.className='chip site mini';b.dataset.site=s.key;b.textContent=idx===0?s.short:s.short.replace('Kruger–','K–');box.appendChild(b);});});
  $$('.chip.site').forEach(function(b){b.onclick=function(e){if(e&&(e.metaKey||e.ctrlKey)){return;}if(S.focus===b.dataset.site)clearFocus();else focusSite(b.dataset.site);};});paintSiteChips();}
 function paintSiteChips(){$$('.chip.site').forEach(function(b){var s=SI[b.dataset.site],on=(S.region==='all'||s.rk===S.region);var isFocus=S.focus===s.key,dim=S.focus&&!isFocus;b.style.display=on?'':'none';if(isFocus){b.style.background=C.terra;b.style.color='#fff';b.style.borderColor=C.terra;}else{b.style.background=C.raised;b.style.color=sitecol(s.key);b.style.borderColor=sitecol(s.key);}b.style.opacity=dim?'.4':'1';});}

 // ---------- abundance ----------
 (function(){var box=$('#abChips');if(!box)return;for(var i=1;i<=5;i++){var b=document.createElement('button');b.dataset.ab=i;b.style.cssText='border:1px solid '+C.rule+';background:'+C.raised+';border-radius:9px;padding:3px 8px;cursor:pointer;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:'+C.soft;b.textContent=Array(i+1).join('●');box.appendChild(b);b.onclick=function(){S.abMin=(+this.dataset.ab===S.abMin)?1:+this.dataset.ab;paintAb();applyFilters();};}paintAb();})();
 function paintAb(){$$('#abChips button').forEach(function(b){var on=+b.dataset.ab>=S.abMin;b.style.color=on?C.acacia:C.rule;b.style.borderColor=on?C.acacia:C.rule;});}

 // ---------- year dual ----------
 (function(){var lo=$('#yrLo'),hi=$('#yrHi'),bnd=$('#yrBnd');lo.min=hi.min=GY[0];lo.max=hi.max=GY[1];lo.value=GY[0];hi.value=GY[1];
  function upd(){var a=Math.min(+lo.value,+hi.value),b=Math.max(+lo.value,+hi.value),sp=GY[1]-GY[0];S.yLo=a;S.yHi=b;bnd.style.left=((a-GY[0])/sp*100)+'%';bnd.style.right=((GY[1]-b)/sp*100)+'%';$('#yrLoLab').textContent=a;$('#yrHiLab').textContent=b;applyFilters();}
  lo.oninput=upd;hi.oninput=upd;upd();})();

 // ---------- season / sort ----------
 var SEAS=[[11,0,1],[2,3,4],[5,6,7],[8,9,10]];
 $$('.tripBtn').forEach(function(b){b.onclick=function(){S.tripwin=!S.tripwin;if(S.tripwin)S.months=new Set([6]);else S.months=new Set([0,1,2,3,4,5,6,7,8,9,10,11]);paintSeason();applyFilters();};});
 $$('.allyrBtn').forEach(function(b){b.onclick=function(){S.tripwin=false;S.months=new Set([0,1,2,3,4,5,6,7,8,9,10,11]);paintSeason();applyFilters();};});
 $$('.seasonchip').forEach(function(c){c.style.cssText='border:1px solid '+C.rule+';border-radius:11px;padding:3px 9px;font-size:11px;cursor:pointer;font-family:system-ui,sans-serif';c.onclick=function(){var mm=SEAS[+c.dataset.se];var allon=mm.every(function(m){return S.months.has(m);});mm.forEach(function(m){if(allon)S.months.delete(m);else S.months.add(m);});S.tripwin=false;paintSeason();applyFilters();};});
 function paintSeason(){$$('.tripBtn').forEach(function(b){b.style.background=S.tripwin?'#2f4f86':C.raised;b.style.color=S.tripwin?'#fff':'#2f4f86';});var sc=['#c0392b','#cf7d3a','#3f6fb0','#8e6fb0'];$$('.seasonchip').forEach(function(c){var mm=SEAS[+c.dataset.se];var on=mm.some(function(m){return S.months.has(m);});var col=sc[+c.dataset.se];c.style.background=on?col:C.raised;c.style.color=on?'#fff':col;c.style.borderColor=col;});}
 $$('.sortchip').forEach(function(c){c.style.cssText='border:1px solid '+C.rule+';border-radius:11px;padding:3px 10px;font-size:11.5px;cursor:pointer;color:'+C.soft+';font-family:system-ui,sans-serif';c.onclick=function(){S.sort=c.dataset.sort;$$('.sortchip').forEach(function(x){x.style.background=C.raised;x.style.color=C.soft;x.style.borderColor=C.rule;});c.style.background=C.ink;c.style.color=C.paper;c.style.borderColor=C.ink;sortRows();};});

 // ---------- search ----------
 var _BF=['nymphalidae','pieridae','lycaenidae','papilionidae','hesperiidae','riodinidae'];var _SNK=['colubridae','elapidae','viperidae','lamprophiidae','pythonidae','typhlopidae','leptotyphlopidae','atractaspididae'];function _isBF(o){return _BF.indexOf((o.f||'').toLowerCase())>=0;}
 var KWMAP={butterfly:_isBF,butterflies:_isBF,moth:function(o){return o.o==='Lepidoptera'&&!_isBF(o);},beetle:function(o){return o.o==='Coleoptera';},spider:function(o){return o.cl==='Arachnida'&&o.o==='Araneae';},dragonfly:function(o){return o.o==='Odonata';},bird:function(o){return o.g==='Aves';},birds:function(o){return o.g==='Aves';},mammal:function(o){return o.g==='Mammalia';},mammals:function(o){return o.g==='Mammalia';},frog:function(o){return o.cl==='Amphibia';},snake:function(o){return _SNK.indexOf((o.f||'').toLowerCase())>=0;},snakes:function(o){return _SNK.indexOf((o.f||'').toLowerCase())>=0;},lizard:function(o){return o.o==='Squamata'&&_SNK.indexOf((o.f||'').toLowerCase())<0;},plant:function(o){return o.g==='Plantae';},plants:function(o){return o.g==='Plantae';},tree:function(o){return o.g==='Plantae';},fish:function(o){return o.g==='Actinopterygii';},snail:function(o){return o.g==='Mollusca';}};
 var qt;$('#q').oninput=function(e){clearTimeout(qt);qt=setTimeout(function(){S.q=e.target.value.trim().toLowerCase();applyFilters();},150);};

 // ---------- filter predicates ----------
 function seasonOK(o){if(S.months.size>=12)return true;if(!(o.g==='Aves'||o.g==='Plantae'||o.g==='Insecta'))return true;for(var k in o.st){var s=o.st[k];var mo=s.e?s.e[2]:(s.i?s.i[1]:null);if(mo&&mo.length){for(var i=0;i<mo.length;i++)if(S.months.has(mo[i]))return true;}}return false;}
 function yearOK(o){if(S.yLo<=GY[0]&&S.yHi>=GY[1])return true;if(!o._yr.length)return true;for(var i=0;i<o._yr.length;i++)if(o._yr[i]>=S.yLo&&o._yr[i]<=S.yHi)return true;return false;}
 function textOK(o,tr){var kw=KWMAP[S.q];if(kw)return kw(o);return (tr.dataset.txt.indexOf(S.q)>=0)||((o.o||'').toLowerCase().indexOf(S.q)>=0)||((o.f||'').toLowerCase().indexOf(S.q)>=0)||((o.cl||'').toLowerCase().indexOf(S.q)>=0);}

 // ---------- matrix ----------
 function cellHTML(o,s){var ck=o.k+'|'+s.key;var pres=presentAt(o,s.key);var isSeen=seen.has(ck);return '<td class="cell'+(isSeen?' seen':'')+'" data-oi="'+o.i+'" data-site="'+s.key+'" data-pres="'+(pres?1:0)+'">'+(isSeen?'<span style="display:inline-block;width:14px;height:14px;line-height:14px;font-size:10px;color:#fff;background:'+C.acacia+';border-radius:3px">✓</span>':(pres?'<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+TAXCOL[o.g]+'"></span>':''))+'</td>';}
 function buildMatrix(){
  var thead='<tr><th style="width:3px;padding:0"></th><th style="width:38px;padding:4px"></th><th style="text-align:left;padding:5px 8px;font-size:11px;color:'+C.soft+';font-weight:600" id="mxCount">species</th><th style="padding:4px 6px;font-size:10px;color:'+C.soft+';font-weight:500">evidence</th>'+SITES.map(function(s){return '<th class="colh" data-site="'+s.key+'" data-rk="'+s.rk+'" style="padding:4px 5px;font-size:10px;color:'+sitecol(s.key)+';font-weight:600;white-space:nowrap;cursor:pointer;border-bottom:2px solid '+sitecol(s.key)+';vertical-align:bottom">'+esc(s.short.replace('Kruger–','K–'))+'</th>';}).join('')+'</tr>';
  var body=UNIC.map(function(o){var cells=SITES.map(function(s){return cellHTML(o,s);}).join('');
   return '<tr class="org tx-'+o.g+'" data-i="'+o.i+'" data-g="'+o.g+'" data-txt="'+esc((o.c+' '+o.s).toLowerCase())+'" style="border-bottom:1px solid '+C.rule+'"><td style="width:3px;padding:0;background:'+TAXCOL[o.g]+'"></td>'+
    '<td style="padding:3px 4px">'+(o.p?'<img loading="lazy" src="'+esc(o.p[0])+'" style="width:30px;height:30px;object-fit:cover;border-radius:4px;background:'+C.raised+'">':'<div style="width:30px;height:30px;border-radius:4px;background:'+C.raised+'"></div>')+'</td>'+
    '<td style="padding:4px 8px;cursor:pointer;min-width:190px"><div style="font-size:13.5px;font-weight:500;line-height:1.15">'+esc(o.c||o.s)+'</div><div style="font-size:11px;color:'+C.soft+';font-style:italic">'+esc(o.c?o.s:'')+'</div><div class="sans" style="font-size:9.5px;color:#9a917f;letter-spacing:.2px">'+esc([o.cl,o.o,o.f].filter(Boolean).join(' · '))+'</div></td>'+
    '<td style="white-space:nowrap;padding:0 5px">'+badges(o)+'</td>'+cells+'</tr>';}).join('');
  $('#matrix').innerHTML='<div style="overflow:auto;border:1px solid '+C.rule+';border-radius:8px;max-height:calc(100vh - 30px);background:'+C.raised+'"><table class="mx"><thead>'+thead+'</thead><tbody>'+body+'</tbody></table></div>';
  $$('#matrix .colh').forEach(function(th){th.onclick=function(){if(S.focus===th.dataset.site)clearFocus();else focusSite(th.dataset.site);};});
  $$('#matrix .cell').forEach(function(td){td.onclick=function(e){e.stopPropagation();toggleSeen(UNIC[+td.dataset.oi],td.dataset.site);};});
  $$('#matrix tr.org').forEach(function(tr){tr.onclick=function(){openDrawer(+tr.dataset.i);};});
  colVisibility();sortRows();
 }
 function repaintCell(o,sk){var td=$('#matrix .cell[data-oi="'+o.i+'"][data-site="'+sk+'"]');if(!td)return;var on=seen.has(o.k+'|'+sk);td.classList.toggle('seen',on);td.innerHTML=on?'<span style="display:inline-block;width:14px;height:14px;line-height:14px;font-size:10px;color:#fff;background:'+C.acacia+';border-radius:3px">✓</span>':(td.dataset.pres==='1'?'<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+TAXCOL[o.g]+'"></span>':'');}
 function toggleSeen(o,sk){var ck=o.k+'|'+sk;var now=!seen.has(ck);if(now)seen.add(ck);else seen.delete(ck);save();updateSeenOrder();repaintCell(o,sk);paintSeenTally();setTimeout(sortRows,0);var ch=$('#drawer .ckchip[data-key="'+ck+'"]');if(ch)paintCk(ch,SI[sk],now);}
 // ---------- seen-row float + sort ----------
 function makeSeenHdr(n){var tr=document.createElement('tr');tr.id='seenHdr';var td=document.createElement('td');td.colSpan=30;td.style.cssText='padding:5px 9px;background:rgba(94,114,73,.13);border-bottom:1px solid '+C.rule+';font-family:system-ui,sans-serif;font-size:10.5px;font-weight:700;letter-spacing:.5px;color:'+C.acacia+';text-transform:uppercase';td.textContent='✓ Seen this trip · '+n+' species — newest on top';tr.appendChild(td);return tr;}
 function sortRows(){var tb=$('#matrix tbody');if(!tb)return;var oh=tb.querySelector('#seenHdr');if(oh)oh.remove();var rws=$$('tr.org',tb);var sm=seenSpeciesMap();
  function nm(o){return (o.c||o.s).toLowerCase();}
  var base=S.sort==='za'?function(a,b){return nm(b).localeCompare(nm(a));}:S.sort==='tax'?function(a,b){return ((order[a.g]||0)-(order[b.g]||0))||((a.cl||'').localeCompare(b.cl))||((a.o||'').localeCompare(b.o))||((a.f||'').localeCompare(b.f))||nm(a).localeCompare(nm(b));}:function(a,b){return nm(a).localeCompare(nm(b));};
  rws.sort(function(x,y){var ox=UNIC[+x.dataset.i],oy=UNIC[+y.dataset.i];var sx=sm[ox.k]?1:0,sy=sm[oy.k]?1:0;if(sx!==sy)return sy-sx;if(sx&&sy)return seenOrder.indexOf(oy.k)-seenOrder.indexOf(ox.k);return base(ox,oy);});
  var nSeen=0;rws.forEach(function(r){var o=UNIC[+r.dataset.i];var isS=!!sm[o.k];if(isS)nSeen++;r.style.background=isS?'rgba(94,114,73,.07)':'';});
  if(nSeen>0)tb.appendChild(makeSeenHdr(nSeen));rws.forEach(function(r){tb.appendChild(r);});
  if(nSeen>0&&nSeen<rws.length){rws[nSeen-1].style.borderBottom='2px solid '+C.rule;}
 }
 function paintSeenTally(){var t=$('#seenTally');if(!t)return;var n=seenSpeciesCount();t.style.display=n?'':'none';t.textContent='✓ '+n+' seen this trip';}
 // ---------- filters apply ----------
 function applyFilters(){var cols=visSites(),colKeys=cols.map(function(s){return s.key;}),vis=0;
  $$('#matrix tr.org').forEach(function(tr){var o=UNIC[+tr.dataset.i];var ok=!!S.taxa[o.g];
   if(ok&&S.q)ok=textOK(o,tr);
   if(ok&&o._e>0)ok=o._e>=S.abMin;
   if(ok)ok=seasonOK(o);
   if(ok)ok=yearOK(o);
   if(ok)ok=colKeys.some(function(k){return presentAt(o,k);});
   var dimF=ok&&S.focus&&!presentAt(o,S.focus);
   tr.classList.toggle('hid',!ok);tr.style.opacity=dimF?'.32':'1';if(ok)vis++;});
  $$('#matrix .cell, #matrix .colh').forEach(function(el){var isF=!S.focus||el.dataset.site===S.focus;el.style.opacity=isF?'':'.24';});
  var cnt=$('#count');if(cnt)cnt.textContent=vis.toLocaleString()+' / '+UNIC.length.toLocaleString();var mc=$('#mxCount');if(mc)mc.textContent=vis.toLocaleString()+' species';
  var stt=$('#status');if(stt){var Gon=GORDER.filter(function(p){return S.taxa[p[0]];});var taxa=Gon.length>=GORDER.length?'all taxa':Gon.length===0?'no taxa':Gon.length<=3?Gon.map(function(p){return p[1].toLowerCase();}).join(', '):Gon.length+' groups';var season=S.months.size>=12?'year-round':(S.tripwin?'in the late-July window':'in the chosen season');var site=S.focus?('at '+SI[S.focus].short):(S.region==='all'?'across all ten sites':'in the '+(S.region==='cape'?'Cape':'Lowveld'));var ns=seenSpeciesCount();stt.innerHTML='<b style="color:'+C.ink+'">'+vis.toLocaleString()+'</b> of '+UNIC.length.toLocaleString()+' organisms — '+taxa+', '+season+', '+site+'.'+(ns?' &nbsp;<b style="color:'+C.acacia+'">✓ '+ns+' seen this trip.</b>':'');}
 }
 function colVisibility(){$$('#matrix .colh, #matrix .cell').forEach(function(el){var s=SI[el.dataset.site];el.style.display=(S.region==='all'||(s&&s.rk===S.region))?'':'none';});}

 // ---------- region ----------
 function setRegion(r){S.region=r;S.focus=null;paintRegion();paintSiteChips();colVisibility();renderMap();renderItin();renderRails();applyFilters();}
 function paintRegion(){$$('.segbtn').forEach(function(b){var on=b.dataset.region===S.region;b.style.background=on?C.acacia:'none';b.style.color=on?'#fff':C.acacia;});$$('.regcard').forEach(function(c){var on=c.dataset.region===S.region;c.style.boxShadow=on?'0 0 0 2px '+C.acacia+' inset':'none';});}
 $$('.segbtn').forEach(function(b){b.onclick=function(){setRegion(b.dataset.region);};});
 $$('.regcard').forEach(function(c){c.onclick=function(){setRegion(S.region===c.dataset.region?'all':c.dataset.region);};});

 // ---------- shared map (real MAPIMG tiles) ----------
 var lon2x=function(lo,z){return (lo+180)/360*Math.pow(2,z);},lat2y=function(la,z){var r=la*Math.PI/180;return (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*Math.pow(2,z);};
 function mapKey(){if(S.focus)return SI[S.focus].rk==='cape'?'cape':'low';return S.region==='cape'?'cape':S.region==='lowveld'?'low':'sa';}
 function renderMap(){var surf=$('#mapSurface');if(!surf||!MI)return;var mk=mapKey();var mi=MI[mk]||MI.sa;var url=(mi.layers&&mi.layers.streets)||mi.url;
  var list=(mk==='sa')?SITES:visSites();
  var markers=list.map(function(s){if(mi.z==null)return '';var px=(lon2x(s.coord[1],mi.z)*256-mi.x0*256)/mi.w*100,py=(lat2y(s.coord[0],mi.z)*256-mi.y0*256)/mi.h*100;var isF=S.focus===s.key,dim=S.focus&&!isF;var sz=isF?16:12;
   return '<div class="mkr" data-site="'+s.key+'" style="left:'+px.toFixed(2)+'%;top:'+py.toFixed(2)+'%;opacity:'+(dim?'.4':'1')+';z-index:'+(isF?5:2)+'"><div class="dot" style="width:'+sz+'px;height:'+sz+'px;background:'+(isF?C.terra:sitecol(s.key))+(isF?';animation:mkPulse 1.6s infinite':'')+'"></div><span class="lb"'+(isF?' style="font-weight:700"':'')+'>'+esc(s.short)+(s.uncertain?' ⚑':'')+'</span></div>';}).join('');
  var tag='<div class="sans" style="position:absolute;left:8px;bottom:7px;font-family:ui-monospace,Menlo,monospace;font-size:9px;color:#8a8271;background:rgba(251,247,238,.8);padding:2px 6px;border-radius:3px">◱ offline tiles · '+(mk==='cape'?'Cape peninsula':mk==='low'?'Lowveld / Kruger':'South Africa')+'</div>';
  surf.innerHTML='<img src="'+url+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">'+markers+tag;
  $$('.mkr',surf).forEach(function(m){m.onclick=function(){if(S.focus===m.dataset.site)clearFocus();else focusSite(m.dataset.site);};});
 }
 // ---------- itinerary ----------
 function renderItin(){var box=$('#itin');if(!box)return;box.innerHTML='';itinList().forEach(function(s){var isF=S.focus===s.key;var d=document.createElement('button');d.dataset.site=s.key;d.className='sans';d.style.cssText='flex:0 0 auto;border:none;border-bottom:3px solid '+(isF?C.terra:'transparent')+';background:'+(isF?C.paper:'none')+';padding:5px 11px;cursor:pointer;text-align:left;white-space:nowrap;border-radius:6px 6px 0 0';d.innerHTML='<div style="font-size:10px;color:'+sitecol(s.key)+';font-weight:700">'+esc(s.date)+'</div><div style="font-size:11.5px;color:'+(isF?C.terra:C.ink)+';font-weight:'+(isF?'700':'500')+'">'+esc(s.short)+'</div>';d.onclick=function(){if(S.focus===s.key)clearFocus();else focusSite(s.key);};box.appendChild(d);});}
 // ---------- rails ----------
 function acct(lab,txt){return txt?'<div style="margin-bottom:7px"><div style="font-size:9.5px;font-weight:700;letter-spacing:.4px;color:'+C.acacia+';text-transform:uppercase">'+lab+'</div><div style="font-size:11.5px;color:'+C.ink+';line-height:1.4">'+esc(txt)+'</div></div>':'';}
 function hlCard(o,sk){var star=sk&&(o.notable?o.notable.indexOf(sk)>=0:false);return '<div class="hl" data-oi="'+o.i+'" style="display:flex;gap:8px;align-items:center;padding:5px 0;border-top:1px solid var(--rule);cursor:pointer">'+(o.p?'<img src="'+esc(o.p[0])+'" style="width:34px;height:34px;flex-shrink:0;border-radius:4px;object-fit:cover;border-left:3px solid '+TAXCOL[o.g]+'">':'<div style="width:34px;height:34px;flex-shrink:0;border-radius:4px;border-left:3px solid '+TAXCOL[o.g]+';background:'+C.raised+'"></div>')+'<div style="flex:1;min-width:0"><div style="font-size:11.5px;font-weight:600;color:'+C.ink+';line-height:1.2">'+(star?'★ ':'')+esc(o.c||o.s)+'</div><div style="font-size:10px;color:'+C.soft+';font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(o.s)+'</div></div><div style="flex-shrink:0">'+badges(o)+'</div></div>';}
 function siteHighlights(sk){return UNIC.filter(function(o){return presentAt(o,sk);}).sort(function(a,b){return (b._e||0)-(a._e||0);}).slice(0,6);}
 function renderRails(){var L=$('#mapLeft'),R=$('#mapRight');if(!L||!R)return;
  if(!S.focus){L.innerHTML='<div style="color:var(--soft);font-size:12px;line-height:1.5"><b style="color:'+C.ink+';font-family:var(--serif);font-size:15px">The itinerary</b><br>Ten localities, Cape winter to Kruger dry season. <b style="color:'+C.terra+'">Tap a stop</b> (or a map dot) to read its field account here and see its highlights.<br><br>Or press <b>▶ Play tour</b> to walk the route.</div>';
   var hl=itinList().slice(0,5).map(function(s){return siteHighlights(s.key)[0];}).filter(Boolean);var seenk={};hl=hl.filter(function(o){if(seenk[o.k])return false;seenk[o.k]=1;return true;});
   R.innerHTML='<div style="font-size:10px;font-weight:700;letter-spacing:.5px;color:'+C.terra+';text-transform:uppercase;margin-bottom:8px">Trip highlights</div>'+hl.map(function(o){return hlCard(o);}).join('');return;}
  var s=SI[S.focus],a=s.a||{};
  L.innerHTML='<div style="font-size:10px;font-weight:700;letter-spacing:.7px;color:'+C.terra+';text-transform:uppercase">'+esc(s.region)+' · '+esc(s.date)+'</div><div style="font-family:var(--serif);font-size:17px;font-weight:600;margin:2px 0 3px">'+esc(s.label)+'</div>'+(s.uncertain?'<div style="display:inline-block;background:#fff5ec;border:1px dashed '+C.terra+';color:#8a4a33;border-radius:5px;padding:1px 7px;font-size:10.5px;margin-bottom:5px">⚑ location approximate</div>':'')+'<div style="font-size:11px;color:var(--soft);margin-bottom:8px">'+esc(s.elev||'')+'</div>'+acct('Access',a.ac)+acct('Physiography',a.ph)+acct('Vegetation',a.vg)+acct('Best time',a.bt)+acct('People &amp; history',a.hi);
  var here=siteHighlights(s.key);
  R.innerHTML='<div style="font-size:10px;font-weight:700;letter-spacing:.5px;color:'+C.terra+';text-transform:uppercase;margin-bottom:8px">Highlights · '+esc(s.short)+'</div>'+(here.length?here.map(function(o){return hlCard(o,s.key);}).join(''):'<div style="color:var(--soft);font-size:11.5px">No species recorded here yet.</div>');
 }
 document.addEventListener('click',function(e){var hl=e.target.closest&&e.target.closest('.hl');if(hl)openDrawer(+hl.dataset.oi);});
 // ---------- focus + tour ----------
 var tourTimer=null;
 function focusSite(k){S.focus=k;if(S.region!=='all'&&SI[k].rk!==S.region){S.region='all';paintRegion();colVisibility();}paintSiteChips();renderItin();renderMap();renderRails();applyFilters();}
 function clearFocus(){S.focus=null;paintSiteChips();renderItin();renderMap();renderRails();applyFilters();}
 function stopTour(){if(tourTimer){clearInterval(tourTimer);tourTimer=null;var p=$('#tPlay');if(p){p.innerHTML='▶ Play tour';p.style.background=C.acacia;}}}
 function stepTour(dir){var list=itinList();var idx=S.focus?list.map(function(s){return s.key;}).indexOf(S.focus):-1;idx=(idx+dir+list.length)%list.length;focusSite(list[idx].key);}
 $('#tPrev').onclick=function(){stopTour();stepTour(-1);};$('#tNext').onclick=function(){stopTour();stepTour(1);};
 $('#tPlay').onclick=function(){if(tourTimer){stopTour();return;}var p=$('#tPlay');p.innerHTML='⏸ Stop';p.style.background=C.terra;stepTour(1);tourTimer=setInterval(function(){stepTour(1);},3200);};

 // ---------- detail drawer ----------
 var drawer=$('#drawer'),scrim=$('#scrim');
 function closeDrawer(){drawer.classList.remove('open');scrim.style.display='none';}
 scrim.onclick=closeDrawer;document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDrawer();});
 function paintCk(ch,s,on){ch.style.background=on?sitecol(s.key):C.raised;ch.style.color=on?'#fff':sitecol(s.key);ch.style.borderColor=sitecol(s.key);ch.textContent=(on?'✓ ':'')+s.short.replace('Kruger–','K–');}
 function openDrawer(i){var o=UNIC[i];var col=TAXCOL[o.g];drawer.style.borderLeftColor=col;
  var med=o.p?o.p[0].replace('/square.','/medium.'):'';
  var whereSites=o._sites.map(function(k){return SI[k]?SI[k].short:k;});
  // museum aggregate + best monthly
  var sp=0,gn=0,ymin=9999,ymax=0,monthly=null,bestpk=-1,tr=0,nObs=0;o._sites.forEach(function(k){var s=o.st[k];var m=s.m;if(m){sp+=m[0]||0;gn+=m[1]||0;if(m[3]&&m[3][0]){ymin=Math.min(ymin,m[3][0]);ymax=Math.max(ymax,m[3][1]);}}if(s.i)nObs+=s.i[0]||0;var e=s.e;if(e&&e[0]>bestpk){bestpk=e[0];monthly=e[3];tr=e[1];}});
  // deep links (port of __open5)
  var _gk=(window.BB&&window.BB[(o.s||'').toLowerCase()])?(window.BB[(o.s||'').toLowerCase()].key||0):0;
  function firstWith(L){if(S.focus&&o.st[S.focus]&&o.st[S.focus][L])return S.focus;for(var z=0;z<o._sites.length;z++){var k=o._sites[z];if(o.st[k]&&o.st[k][L])return k;}return null;}
  var iK=firstWith('i'),iU=o.ii?('https://www.inaturalist.org/observations?verifiable=true&taxon_id='+o.ii+(iK&&SI[iK].pid?('&place_id='+SI[iK].pid):'')):'';
  var eK=firstWith('e'),eU='';if(eK){var ec=o.st[eK].e[7]||'';if(ec)eU='https://ebird.org/species/'+ec;}
  var mK=firstWith('m'),mU='';if(mK)mU='https://www.gbif.org/occurrence/search?basisOfRecord=PRESERVED_SPECIMEN&'+(_gk?('taxonKey='+_gk):('q='+encodeURIComponent(o.s)));
  var gU=gn>0?('https://www.gbif.org/occurrence/search?basisOfRecord=MATERIAL_SAMPLE&'+(_gk?('taxonKey='+_gk):('q='+encodeURIComponent(o.s)))):'';
  function ev(k,lit,txt,url){var link=lit&&url;return '<'+(link?'a':'div')+' style="display:flex;flex-direction:column;align-items:center;gap:2px;font-family:system-ui,sans-serif;font-size:10px;color:'+C.soft+';text-decoration:none;opacity:'+(lit?'1':'.32')+'"'+(link?(' href="'+url+'" target="_blank" rel="noopener"'):'')+'>'+glyph(k,lit?1:0)+'<span>'+txt+'</span></'+(link?'a':'div')+'>';}
  var evband='<div style="display:flex;gap:16px;padding:9px 0;border-top:1px solid '+C.rule+';border-bottom:1px solid '+C.rule+'">'+ev('m',sp>0,'voucher'+(sp>0?' '+sp:''),mU)+ev('g',gn>0,'genomic'+(gn>0?' '+gn:''),gU)+ev('i',o.src.indexOf('i')>=0,'iNat'+(nObs?' '+nObs:''),iU)+ev('e',o.src.indexOf('e')>=0,'eBird',eU)+'</div>';
  var spark='';if(monthly){var mx=Math.max.apply(null,monthly)||1;spark='<div style="margin-bottom:13px"><div class="dlab">Season'+(tr>=0.3?' · good in late July':tr>0?' · possible late July':' · scarce late July')+'</div><div style="display:flex;align-items:flex-end;gap:3px;height:40px">'+monthly.map(function(v,k){return '<div title="'+MN[k]+'" style="flex:1;border-radius:1px;background:'+([6,7].indexOf(k)>=0?C.terra:C.rule)+';height:'+Math.max(2,Math.round(v/mx*40))+'px"></div>';}).join('')+'</div></div>';}
  var ckchips=SITES.map(function(s){var ck=o.k+'|'+s.key;var on=seen.has(ck);var known=presentAt(o,s.key);return '<span class="ckchip" data-key="'+ck+'" data-known="'+(known?1:0)+'" style="background:'+(on?sitecol(s.key):C.raised)+';color:'+(on?'#fff':sitecol(s.key))+';border-color:'+sitecol(s.key)+';opacity:'+(known?'1':'.5')+'">'+(on?'✓ ':'')+esc(s.short.replace('Kruger–','K–'))+'</span>';}).join('');
  var nk='sp:'+o.k;var iok=inatobs[o.k]||'';
  drawer.className='tx-'+o.g;drawer.classList.add('open');
  drawer.innerHTML='<button class="dclose" style="position:absolute;top:10px;right:14px;font-size:24px;line-height:1;cursor:pointer;color:'+C.soft+';background:none;border:none;z-index:3">×</button>'+
   '<div style="padding:16px 18px 12px;border-bottom:1px solid '+C.rule+'"><div style="font-family:var(--serif);font-size:24px;font-weight:600;line-height:1.1">'+esc(o.c||o.s)+'</div><div style="font-style:italic;color:'+C.soft+';font-size:14px">'+esc(o.s)+'</div><div class="sans" style="font-size:10.5px;color:#9a917f;letter-spacing:.3px;margin-top:2px">'+esc([o.cl,o.o,o.f].filter(Boolean).join(' · '))+'</div></div>'+
   '<div style="padding:0 18px">'+evband+'</div>'+
   '<div class="sans" style="padding:14px 18px;font-size:13px">'+
   (med?'<div style="margin-bottom:13px"><img class="dphoto" src="'+esc(med)+'" style="width:100%;max-height:300px;object-fit:contain;border-radius:6px;background:'+C.raised+'"><div style="font-size:10.5px;color:'+C.soft+';margin-top:3px">'+esc(o.p[2]||'')+(o.p[1]?(' · '+o.p[1].toUpperCase()):'')+' · via iNaturalist</div></div>':'')+
   '<div style="margin-bottom:13px"><div class="dlab">Where on this trip</div>'+whereSites.length+' site'+(whereSites.length>1?'s':'')+': '+esc(whereSites.join(', '))+'</div>'+
   spark+
   '<div style="margin-bottom:13px" class="dwiki"><div class="dlab">Normally</div><span style="color:'+C.soft+'">loading…</span></div>'+
   '<div style="margin-bottom:13px"><div class="dlab">Explore</div>'+[_gk?'<a href="https://www.gbif.org/species/'+_gk+'" target="_blank" rel="noopener">GBIF</a>':'',o.ii?'<a href="https://www.inaturalist.org/taxa/'+o.ii+'" target="_blank" rel="noopener">iNaturalist</a>':'','<a href="https://en.wikipedia.org/wiki/'+encodeURIComponent((o.s||'').replace(/ /g,'_'))+'" target="_blank" rel="noopener">Wikipedia</a>'].filter(Boolean).join(' · ')+'</div>'+
   '<div style="margin-bottom:13px"><div class="dlab">Seen on this trip</div><div style="display:flex;flex-wrap:wrap;gap:5px">'+ckchips+'</div></div>'+
   '<div style="margin-bottom:13px"><div class="dlab">iNaturalist observation</div><input class="inatobs sans" data-k="'+o.k+'" value="'+esc(iok)+'" placeholder="paste an iNat observation URL / id" style="width:100%;border:1px solid '+C.rule+';border-radius:6px;padding:6px 8px;font-size:12px;background:'+C.raised+';color:'+C.ink+'"></div>'+
   '<div style="margin-bottom:8px"><div class="dlab">My notes</div><textarea class="noteta" data-nk="'+nk+'" placeholder="What you saw, where, with whom…">'+esc(notes[nk]||'')+'</textarea></div>'+
   '</div>';
  scrim.style.display='block';
  $('.dclose',drawer).onclick=closeDrawer;
  $$('.ckchip',drawer).forEach(function(ch){ch.onclick=function(){toggleSeen(o,ch.dataset.key.split('|')[1]);};});
  var ta=$('.noteta',drawer);ta.oninput=function(){notes[nk]=ta.value;save();};
  var io=$('.inatobs',drawer);io.oninput=function(){if(io.value.trim())inatobs[o.k]=io.value.trim();else delete inatobs[o.k];save();};
  // wikipedia summary via iNat
  var w=$('.dwiki',drawer),wsci=encodeURIComponent((o.s||'').replace(/ /g,'_'));
  if(o.ii&&typeof fetch==='function'){fetch('https://api.inaturalist.org/v1/taxa/'+o.ii).then(function(r){return r.json();}).then(function(j){var t=j.results&&j.results[0];var su=t&&t.wikipedia_summary;if(su){su=su.replace(/<[^>]+>/g,'');if(su.length>420)su=su.slice(0,420).replace(/\s+\S*$/,'')+'…';w.innerHTML='<div class="dlab">Normally</div>'+esc(su)+(o.blurb?'':'');}else w.innerHTML='<div class="dlab">Normally</div><a href="https://en.wikipedia.org/wiki/'+wsci+'" target="_blank" rel="noopener">Wikipedia →</a>';}).catch(function(){w.innerHTML='<div class="dlab">Normally</div><a href="https://en.wikipedia.org/wiki/'+wsci+'" target="_blank" rel="noopener">Wikipedia →</a>';});}
  else w.innerHTML='<div class="dlab">Normally</div><a href="https://en.wikipedia.org/wiki/'+wsci+'" target="_blank" rel="noopener">Wikipedia →</a>';
 }
 window.__openDrawer=openDrawer;

 // ---------- disclosure triangles ----------
 var OPEN=LG('sa5_open',null);
 $$('.fh').forEach(function(hd){var sec=hd.dataset.sec;var body=$('.fb[data-body="'+sec+'"]');var tri=$('.tri',hd);
  if(OPEN&&OPEN[sec]===0){body.style.display='none';tri.textContent='▸';}
  hd.onclick=function(){var open=body.style.display!=='none';body.style.display=open?'none':'';tri.textContent=open?'▸':'▾';OPEN=OPEN||{};OPEN[sec]=open?0:1;try{localStorage.setItem('sa5_open',JSON.stringify(OPEN));}catch(e){}};});

 // ---------- theme ----------
 var root=document.documentElement;try{var th=localStorage.getItem('sa_theme');if(th)root.dataset.theme=th;}catch(e){}
 $('#themeToggle').onclick=function(){root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('sa_theme',root.dataset.theme);}catch(e){}renderMap();};

 // ---------- observer notebook: JSON backup (offline; export is the save mechanism) ----------
 function collectNotes(){return {v:1,app:'saexplore',exported:'2026',seen:Array.from(seen),notes:notes,seenOrder:seenOrder,journal:journal,inatobs:inatobs};}
 function exportJSON(){try{var blob=new Blob([JSON.stringify(collectNotes(),null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='saexplore-fieldnotes.json';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(url);a.remove();},0);}catch(e){window.alert&&alert('Export failed: '+e.message);}}
 function importJSON(text){try{var d=JSON.parse(text);if(d.seen)seen=new Set(d.seen);if(d.notes)notes=d.notes;if(d.seenOrder)seenOrder=d.seenOrder;if(d.journal)journal=d.journal;if(d.inatobs)inatobs=d.inatobs;save();buildMatrix();updateSeenOrder();paintSeenTally();applyFilters();window.alert&&alert('Field notes imported.');}catch(e){window.alert&&alert('Import failed: '+e.message);}}
 var ej=$('#expJson');if(ej)ej.onclick=exportJSON;
 var ij=$('#impJson'),iff=$('#impFile');if(ij&&iff){ij.onclick=function(){iff.click();};iff.onchange=function(){var f=iff.files&&iff.files[0];if(!f)return;var r=new FileReader();r.onload=function(){importJSON(r.result);};r.readAsText(f);};}
 window.__exportJSON=exportJSON;window.__importJSON=importJSON;

 // ---------- Grinnell field-journal export ----------
 function jAccounts(s){return UNIC.filter(function(o){return presentAt(o,s.key)&&(seen.has(o.k+'|'+s.key)||notes['sp:'+o.k]);});}
 function jChecklist(s){return UNIC.filter(function(o){return seen.has(o.k+'|'+s.key);});}
 function jSection(s){
  var jk=s.date+'|'+s.key,J=journal[jk]||{};var accounts=jAccounts(s),checklist=jChecklist(s);
  var acctHTML=accounts.length?accounts.map(function(o){var mine=notes['sp:'+o.k]||'';return '<div style="break-inside:avoid;display:flex;gap:12px;padding:9px 0;border-bottom:1px solid #d8cdb6">'+(o.p?'<img src="'+esc(o.p[0])+'" style="width:60px;height:60px;flex-shrink:0;border-radius:3px;object-fit:cover;border-left:3px solid '+TAXCOL[o.g]+'">':'<div style="width:60px;height:60px;flex-shrink:0;border-radius:3px;border-left:3px solid '+TAXCOL[o.g]+';background:#efe8d8"></div>')+'<div style="flex:1"><div style="font-family:var(--serif);font-size:15px;font-weight:600">'+esc(o.c||o.s)+' <span style="font-style:italic;font-weight:400;color:#6b6459;font-size:13px">'+esc(o.s)+'</span></div><div class="sans" style="font-size:11px;color:#9a917f">'+esc([o.cl,o.o,o.f].filter(Boolean).join(' · '))+'</div><div class="sans" style="font-size:12px;color:#2b2723;margin-top:4px"><span style="color:#5e7249;font-weight:700">Field note.</span> '+(mine?esc(mine):'<span style="border-bottom:1px dotted #b5623c;display:inline-block;min-width:280px">&nbsp;</span>')+'</div></div></div>';}).join(''):'<div class="sans" style="color:#9a917f;font-size:12px;padding:6px 0">No species logged here yet — tick sightings in the checklist, or add a species note in the drawer.</div>';
  var checkHTML=checklist.length?('<table style="border-collapse:collapse;width:100%;font-size:13.5px"><thead><tr style="border-bottom:1.5px solid #2b2723">'+['','Common','Scientific','iNat obs'].map(function(hh){return '<th class="sans" style="text-align:left;padding:2px 6px;font-size:10.5px;color:#6b6459;font-weight:600">'+hh+'</th>';}).join('')+'</tr></thead><tbody>'+checklist.map(function(o){var io=inatobs[o.k];return '<tr style="border-bottom:1px solid #e2d9c6"><td style="padding:2px 6px;width:22px;text-align:center;color:#5e7249">✓</td><td style="padding:2px 6px;font-family:var(--serif)">'+esc(o.c||o.s)+'</td><td style="padding:2px 6px;font-style:italic;color:#6b6459;font-size:12px">'+esc(o.s)+'</td><td class="sans" style="padding:2px 6px;font-size:11px;color:#6b6459">'+(io?esc(io):'')+'</td></tr>';}).join('')+'</tbody></table>'):'<div class="sans" style="color:#9a917f;font-size:12px">No checklist entries yet — tick a cell in the matrix to record a sighting here.</div>';
  return '<div class="jday" style="background:#fbf9f2;border:1px solid #d8cdb6;box-shadow:0 3px 16px rgba(43,39,35,.18);padding:44px 52px;margin-bottom:22px;font-family:var(--serif);color:#2b2723">'+
   '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #2b2723;padding-bottom:8px"><div style="font-size:24px;font-weight:600">'+esc(s.label)+'</div><div class="sans" style="font-size:12.5px;color:#6b6459;text-align:right">'+esc(s.date)+' 2026<br>S. Bennett · Cal Academy</div></div>'+
   '<input class="jweather sans" data-jk="'+esc(jk)+'" value="'+esc(J.weather||'')+'" placeholder="weather / habitat note (e.g. Clear, 9–16°C, SE wind easing by midday · winter)" style="width:100%;border:none;border-bottom:1px dotted #cfc5b2;background:none;font-size:11.5px;color:#6b6459;margin:6px 0 16px;padding:2px 0">'+
   '<div class="sans" style="font-size:10.5px;font-weight:700;letter-spacing:1px;color:#b5623c;text-transform:uppercase;margin-bottom:5px">Journal</div>'+
   '<textarea class="jnote" data-jk="'+esc(jk)+'" placeholder="What happened, who we met, conditions, effort…" style="width:100%;min-height:90px;border:1px solid #e2d9c6;border-radius:6px;background:#fffdf8;font-family:var(--serif);font-size:15px;line-height:1.6;color:#2b2723;padding:8px 10px;margin-bottom:18px;resize:vertical">'+esc(J.note||'')+'</textarea>'+
   '<div class="sans" style="font-size:10.5px;font-weight:700;letter-spacing:1px;color:#b5623c;text-transform:uppercase;margin-bottom:5px">Species accounts</div><div style="margin-bottom:20px">'+acctHTML+'</div>'+
   '<div class="sans" style="font-size:10.5px;font-weight:700;letter-spacing:1px;color:#b5623c;text-transform:uppercase;margin-bottom:5px">The day’s checklist</div>'+checkHTML+
   '<div class="sans" style="margin-top:22px;border-top:1px solid #cfc5b2;padding-top:8px;font-size:10.5px;color:#9a917f">Southern Africa Species Explorer · Grinnell field-journal export · evidence reconciled on the GBIF Backbone</div>'+
  '</div>';
 }
 function renderJournal(scope){var jn=$('#journal');var days=(scope==='all')?itinList():(SI[scope]?[SI[scope]]:itinList());
  var opts='<option value="all">Whole trip (all days)</option>'+itinList().map(function(s){return '<option value="'+s.key+'"'+(scope===s.key?' selected':'')+'>'+esc(s.date+' · '+s.short)+'</option>';}).join('');
  jn.innerHTML='<div style="max-width:820px;margin:0 auto;padding:26px 20px 60px">'+
   '<div class="jscope sans" style="display:flex;justify-content:space-between;gap:10px;margin-bottom:14px;flex-wrap:wrap"><button class="jclose btn">← Back to explorer</button><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span style="color:#6b6459;font-size:11.5px">Notes save to this device — export to keep them.</span><select class="jsel btn" style="font-weight:400">'+opts+'</select><button class="jprint btn pri">Print / Save PDF</button></div></div>'+
   days.map(jSection).join('')+'</div>';
  jn.style.display='block';jn.scrollTop=0;
  $('.jclose',jn).onclick=function(){jn.style.display='none';};
  var pr=$('.jprint',jn);if(pr)pr.onclick=function(){if(typeof window.print==='function')window.print();};
  var sel=$('.jsel',jn);if(sel)sel.onchange=function(){renderJournal(sel.value);};
  $$('.jnote',jn).forEach(function(t){t.oninput=function(){var jk=t.dataset.jk;journal[jk]=journal[jk]||{};journal[jk].note=t.value;save();};});
  $$('.jweather',jn).forEach(function(t){t.oninput=function(){var jk=t.dataset.jk;journal[jk]=journal[jk]||{};journal[jk].weather=t.value;save();};});
 }
 function openJournal(){renderJournal('all');}
 var oj=$('#openJournal');if(oj)oj.onclick=openJournal;$$('.openJournal2').forEach(function(b){b.onclick=openJournal;});
 window.__openJournal=openJournal;

 // ---------- init ----------
 buildTaxa();buildSiteChips();buildMatrix();paintRegion();paintSeason();renderItin();renderMap();renderRails();updateSeenOrder();paintSeenTally();applyFilters();
};

try{APP5(window.UNIC,window.SMETA,window.MAPIMG);}catch(e){var _a=document.getElementById("app");if(_a)_a.innerHTML="<pre>BOOT: "+(e&&e.message)+"</pre>";}
