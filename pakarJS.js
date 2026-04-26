// STARFIELD
(function(){
  const c=document.getElementById('starfield'),ctx=c.getContext('2d');let stars=[];
  function resize(){c.width=window.innerWidth;c.height=window.innerHeight;stars=[];for(let i=0;i<220;i++)stars.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.4+0.2,a:Math.random(),speed:Math.random()*0.3+0.1});}
  function draw(){ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#04060f';ctx.fillRect(0,0,c.width,c.height);stars.forEach(s=>{s.a+=s.speed*0.005;const al=(Math.sin(s.a)+1)/2*0.8+0.1;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(200,220,255,${al})`;ctx.fill();});requestAnimationFrame(draw);}
  window.addEventListener('resize',resize);resize();draw();
})();

// KNOWLEDGE BASE
const KB=[
  {id:'R01',cond:f=>f.bortle<=2,fire:f=>{f.zona='sangat_rendah';f.zona_cf=0.95;f.bortle_class='Bortle 1–2';},desc:'Bortle ≤ 2 → Polusi Sangat Rendah'},
  {id:'R02',cond:f=>f.bortle>=3&&f.bortle<=4,fire:f=>{f.zona='rendah';f.zona_cf=0.88;f.bortle_class='Bortle 3–4';},desc:'Bortle 3–4 → Polusi Rendah'},
  {id:'R03',cond:f=>f.bortle>=5&&f.bortle<=6,fire:f=>{f.zona='sedang';f.zona_cf=0.85;f.bortle_class='Bortle 5–6';},desc:'Bortle 5–6 → Polusi Sedang'},
  {id:'R04',cond:f=>f.bortle>=7&&f.bortle<=8,fire:f=>{f.zona='tinggi';f.zona_cf=0.90;f.bortle_class='Bortle 7–8';},desc:'Bortle 7–8 → Polusi Tinggi'},
  {id:'R05',cond:f=>f.bortle===9,fire:f=>{f.zona='kritis';f.zona_cf=0.97;f.bortle_class='Bortle 9';},desc:'Bortle = 9 → Polusi Kritis'},
  {id:'R06',cond:f=>f.kawasan==='pusat_kota'&&(f.zona==='sedang'||f.zona==='rendah'),fire:f=>{f.zona='tinggi';f.zona_cf=Math.min((f.zona_cf||0.7)+0.1,0.95);},desc:'Pusat Kota + Zona Rendah/Sedang → Koreksi ke Tinggi'},
  {id:'R07',cond:f=>f.kawasan==='rural'&&f.visib==='sangat_banyak'&&f.zona&&f.zona!=='sangat_rendah',fire:f=>{f.zona='rendah';f.zona_cf=Math.min((f.zona_cf||0.7)+0.05,0.95);},desc:'Rural + Bintang Sangat Banyak → Koreksi ke Rendah'},
  {id:'R08',cond:f=>f.visib==='tidak_ada'&&f.zona!=='kritis',fire:f=>{f.zona='kritis';f.zona_cf=0.90;},desc:'Bintang Tidak Terlihat → Polusi Kritis'},
  {id:'R09',cond:f=>f.visib==='sangat_banyak'&&f.cuaca==='cerah'&&f.bortle<=3,fire:f=>{f.zona='sangat_rendah';f.zona_cf=Math.min((f.zona_cf||0.7)+0.05,0.99);},desc:'Bintang Sangat Banyak + Cerah + Bortle ≤ 3 → Konfirmasi Sangat Rendah'},
  {id:'R10',cond:f=>f.sumber==='LED'&&(f.kawasan==='pusat_kota'||f.kawasan==='urban'),fire:f=>{f.penyebab.push('Lampu LED komersial suhu tinggi (>4000K): reklame digital & kawasan bisnis');},desc:'LED + Urban/Pusat Kota → LED Komersial & Reklame'},
  {id:'R11',cond:f=>f.sumber==='sodium'&&(f.kawasan==='urban'||f.kawasan==='suburban'),fire:f=>{f.penyebab.push('Lampu jalan sodium bertekanan tinggi (HPS) tanpa penutup full-cutoff');},desc:'Sodium + Urban/Suburban → Lampu Jalan HPS'},
  {id:'R12',cond:f=>f.sumber==='merkuri',fire:f=>{f.penyebab.push('Lampu merkuri/metal halida: spektrum emisi sangat lebar (UV hingga visible)');},desc:'Sumber Merkuri → Lampu Merkuri Spektrum Lebar'},
  {id:'R13',cond:f=>f.sumber==='campuran'&&f.bortle>=6,fire:f=>{f.penyebab.push('Multi-sumber perkotaan: lampu jalan, kawasan industri, pusat perbelanjaan & papan iklan');},desc:'Campuran + Bortle ≥ 6 → Multi-sumber Perkotaan'},
  {id:'R14',cond:f=>f.waktu==='dini_hari'&&(f.zona==='tinggi'||f.zona==='kritis'),fire:f=>{f.penyebab.push('Pencahayaan fasilitas 24 jam: pabrik, gudang, rumah sakit, bandara aktif dini hari');},desc:'Dini Hari + Zona Tinggi/Kritis → Industri 24 Jam'},
  {id:'R15',cond:f=>f.sumber==='LED'&&f.kawasan==='suburban',fire:f=>{f.penyebab.push('Lampu jalan LED baru (retrofit) tanpa shielding memadai di kawasan perumahan');},desc:'LED + Suburban → LED Jalan Tanpa Shielding'},
  {id:'R16',cond:f=>(f.cuaca==='berkabut'||f.cuaca==='mendung')&&(f.zona==='tinggi'||f.zona==='kritis'||f.zona==='sedang'),fire:f=>{f.amplifikasi=true;},desc:'Berkabut/Mendung + Zona ≥ Sedang → Amplifikasi Cuaca'},
  {id:'R17',cond:f=>f.zona==='sangat_rendah'&&f.cuaca==='cerah',fire:f=>{f.astronomi='sangat_layak';f.astro_cf=0.95;},desc:'Zona Sangat Rendah + Cerah → Sangat Layak Astronomi'},
  {id:'R18',cond:f=>f.zona==='rendah'&&(f.cuaca==='cerah'||f.cuaca==='berawan_tipis'),fire:f=>{f.astronomi='layak';f.astro_cf=0.82;},desc:'Zona Rendah + Cerah/Berawan Tipis → Layak Astronomi'},
  {id:'R19',cond:f=>f.zona==='sedang',fire:f=>{f.astronomi='kurang_layak';f.astro_cf=0.75;},desc:'Zona Sedang → Kurang Layak Astronomi'},
  {id:'R20',cond:f=>f.zona==='tinggi'||f.zona==='kritis',fire:f=>{f.astronomi='tidak_layak';f.astro_cf=0.93;},desc:'Zona Tinggi/Kritis → Tidak Layak Astronomi'},
  {id:'R21',cond:f=>f.zona==='kritis'||f.kawasan==='pusat_kota',fire:f=>{f.ekologis='kritis';f.eko_cf=0.91;f.eko_detail='Gangguan berat sirkadian flora-fauna nokturnal, migrasi burung, ekosistem serangga malam';},desc:'Zona Kritis/Pusat Kota → Risiko Ekologis Kritis'},
  {id:'R22',cond:f=>(f.zona==='tinggi'||f.kawasan==='urban')&&f.ekologis!=='kritis',fire:f=>{f.ekologis='tinggi';f.eko_cf=0.84;f.eko_detail='Gangguan siklus tidur hewan nokturnal, penurunan populasi ngengat & kelelawar';},desc:'Zona Tinggi/Urban → Risiko Ekologis Tinggi'}
];

function forwardChain(facts){
  const log=[];let iter=0,checked=0,fired=0,newFacts=0,changed=true;
  const fired_ids=new Set();
  log.push({type:'sys',msg:'Inisialisasi working memory...'});
  log.push({type:'fact',msg:`Fakta dimuat: bortle=${facts.bortle||'?'}, kawasan=${facts.kawasan||'?'}, sumber=${facts.sumber||'?'}, cuaca=${facts.cuaca||'?'}, visib=${facts.visib||'?'}, waktu=${facts.waktu||'?'}`});
  log.push({type:'sys',msg:'Memulai forward chaining loop...'});
  while(changed){
    changed=false;iter++;
    log.push({type:'sys',msg:`── Iterasi ke-${iter} ──────────────────────────────`});
    for(const rule of KB){
      if(fired_ids.has(rule.id))continue;
      checked++;const before=JSON.stringify(facts);
      try{if(rule.cond(facts)){rule.fire(facts);fired++;fired_ids.add(rule.id);changed=true;if(JSON.stringify(facts)!==before)newFacts++;log.push({type:'fire',id:rule.id,msg:rule.desc});if(facts.zona)log.push({type:'con',msg:`→ Zona: ${facts.zona.toUpperCase()} (CF=${(facts.zona_cf||0).toFixed(2)})`});}}catch(e){}
    }
  }
  log.push({type:'sys',msg:'── Chaining selesai. Tidak ada rule baru terpicu. ──'});
  log.push({type:'ok',msg:`Iterasi: ${iter} | Diperiksa: ${checked} | Terpicu: ${fired} | Fakta Baru: ${newFacts}`});
  return{facts,log,stats:{iter,checked,fired,newFacts}};
}

function buildRecommendations(facts){
  const r=[],z=facts.zona;
  if(z==='kritis'||z==='tinggi'){r.push({head:'🔦 Full-Cutoff Luminaires',body:'Ganti semua lampu jalan ke model full-cutoff yang mengarahkan cahaya ke bawah saja, menghilangkan spill light ke atas.'});r.push({head:'🌡 Reduksi CCT',body:'Turunkan suhu warna LED ke <3000K (warm white). CCT tinggi (>4000K) mengandung spektrum biru 5× lebih menyebar di atmosfer.'});}
  if(facts.sumber==='LED')r.push({head:'💡 Adaptive Dimming',body:'Pasang sistem smart dimming: kurangi intensitas LED 50–70% setelah tengah malam saat aktivitas manusia berkurang.'});
  if(facts.sumber==='merkuri')r.push({head:'🔄 Retrofit Lampu Merkuri',body:'Ganti lampu merkuri dengan LED warm-white berfitur shielding. Merkuri termasuk lampu paling polutan karena spektrum UV-nya.'});
  if(z==='sedang'||z==='tinggi'||z==='kritis')r.push({head:'📋 Regulasi Pencahayaan',body:'Dorong penerapan Dark Sky Ordinance untuk kawasan. Atur batas lux pada jam tertentu dan wajibkan shielding pada instalasi baru.'});
  if(facts.amplifikasi)r.push({head:'📅 Jadwal Pengukuran',body:'Lakukan pengukuran SQM hanya saat cerah tanpa kabut. Berkabut/mendung dapat meningkatkan bacaan polusi hingga 2–3× nilai aktual.'});
  if(z==='sangat_rendah'||z==='rendah'){r.push({head:'🌟 Preserve Dark Sky',body:'Pertahankan kondisi langit gelap. Daftarkan ke IDA (International Dark-Sky Association) sebagai kawasan lindung.'});r.push({head:'📐 Monitoring Rutin',body:'Lakukan pengukuran SQM secara rutin (bulanan) sebagai early warning terhadap potensi perkembangan infrastruktur.'});}
  if(facts.ekologis==='kritis'||facts.ekologis==='tinggi')r.push({head:'🦋 Perlindungan Ekosistem',body:'Gunakan lampu amber/merah di kawasan dekat habitat satwa. Spektrum merah minimal 20× kurang berbahaya bagi serangga nokturnal.'});
  if(facts.waktu==='dini_hari'&&(z==='tinggi'||z==='kritis'))r.push({head:'🏭 Audit Industri Malam',body:'Audit fasilitas industri 24 jam. Wajibkan shielding pada lampu area kerja luar ruang dan minimalisir uplighting.'});
  if(r.length===0)r.push({head:'ℹ Lengkapi Data',body:'Lengkapi semua fakta untuk mendapatkan rekomendasi yang spesifik dan akurat.'});
  return r;
}

const ZONA_CFG={sangat_rendah:{label:'SANGAT RENDAH',color:'#4ecdc4',sub:'Kualitas langit luar biasa · Langit gelap sempurna'},rendah:{label:'RENDAH',color:'#39ff7a',sub:'Kualitas langit baik · Langit pedesaan'},sedang:{label:'SEDANG',color:'#ffd93d',sub:'Kualitas langit cukup · Pinggiran kota'},tinggi:{label:'TINGGI',color:'#ffb347',sub:'Kualitas langit buruk · Kawasan urban'},kritis:{label:'KRITIS',color:'#ff4f4f',sub:'Kualitas langit sangat buruk · Pusat kota'}};
const ASTRO_CFG={sangat_layak:{color:'#4ecdc4',label:'Sangat Layak',note:'Ideal untuk semua jenis observasi termasuk objek redup (mag > 15)'},layak:{color:'#39ff7a',label:'Layak',note:'Cocok untuk planet, gugus bintang, dan nebula terang'},kurang_layak:{color:'#ffd93d',label:'Kurang Layak',note:'Hanya cocok untuk bulan, planet, dan bintang ganda terang'},tidak_layak:{color:'#ff4f4f',label:'Tidak Layak',note:'Langit terlalu cerah, tidak ada nilai ilmiah untuk observasi'}};
const EKO_CFG={rendah:{color:'#4ecdc4',label:'Risiko Rendah',note:'Dampak minimal terhadap ekosistem nokturnal'},sedang:{color:'#ffd93d',label:'Risiko Sedang',note:'Beberapa gangguan pada satwa nokturnal lokal'},tinggi:{color:'#ffb347',label:'Risiko Tinggi',note:''},kritis:{color:'#ff4f4f',label:'Risiko Kritis',note:''}};

function appendLog(e){
  const la=document.getElementById('log-area'),d=document.createElement('div');d.className='log-line';
  const ts=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  let h=`<span class="log-ts">[${ts}]</span> `;
  if(e.type==='sys')h+=`<span class="log-sys">SYS</span>  ${e.msg}`;
  if(e.type==='fact')h+=`<span class="log-fact">FACT</span> ${e.msg}`;
  if(e.type==='fire')h+=`<span class="log-fire">FIRE</span> <span class="log-rule">${e.id}</span>: ${e.msg}`;
  if(e.type==='con')h+=`<span class="log-con">CON </span> ${e.msg}`;
  if(e.type==='ok')h+=`<span class="log-ok">DONE</span> ${e.msg}`;
  if(e.type==='err')h+=`<span class="log-err">ERR </span> ${e.msg}`;
  d.innerHTML=h;la.appendChild(d);la.scrollTop=la.scrollHeight;
}

async function animateLog(entries){for(const e of entries){appendLog(e);await sleep(e.type==='fire'?55:e.type==='sys'?28:18);}}

async function displayResults(facts,recos){
  document.getElementById('output-idle').style.display='none';
  document.getElementById('output-result').style.display='block';
  await sleep(200);
  const zona=facts.zona||'sedang',zc=ZONA_CFG[zona]||ZONA_CFG.sedang;
  const badge=document.getElementById('zone-badge');
  badge.textContent=facts.bortle||'?';badge.style.borderColor=zc.color;badge.style.color=zc.color;
  badge.style.boxShadow=`0 0 18px ${zc.color}55`;badge.style.background=zc.color+'15';
  document.getElementById('zone-main').textContent=zc.label;document.getElementById('zone-main').style.color=zc.color;
  document.getElementById('zone-sub').textContent=(facts.bortle_class||'')+' · '+zc.sub;
  const cf=facts.zona_cf||0.7;
  document.getElementById('cf-fill').style.width=(cf*100)+'%';
  document.getElementById('cf-txt').textContent=`CF = ${cf.toFixed(2)} (${Math.round(cf*100)}% keyakinan)`;
  await sleep(120);
  const cl=document.getElementById('cause-list');cl.innerHTML='';
  if(facts.penyebab&&facts.penyebab.length>0){facts.penyebab.forEach(c=>{const li=document.createElement('li');li.className='cause-item';li.textContent=c;cl.appendChild(li);});}
  else cl.innerHTML='<li class="cause-empty">Sumber cahaya minimal / tidak signifikan terdeteksi</li>';
  const aw=document.getElementById('amp-warning');facts.amplifikasi?aw.classList.add('show'):aw.classList.remove('show');
  await sleep(120);
  const astro=facts.astronomi||'kurang_layak',ac=ASTRO_CFG[astro]||ASTRO_CFG.kurang_layak;
  document.getElementById('astro-status').innerHTML=`<div class="status-item"><div class="status-dot" style="background:${ac.color};box-shadow:0 0 8px ${ac.color}"></div><span class="status-label">Status:</span><span class="status-value" style="color:${ac.color}">${ac.label}</span></div><div class="status-note">${ac.note}</div><div class="status-item" style="margin-top:6px;"><span class="status-label">CF Astronomi:</span><span class="status-value" style="color:var(--accent-amber)">${(facts.astro_cf||0).toFixed(2)}</span></div>`;
  await sleep(120);
  const eko=facts.ekologis||'sedang',ec=EKO_CFG[eko]||EKO_CFG.sedang;
  document.getElementById('eco-status').innerHTML=`<div class="status-item"><div class="status-dot" style="background:${ec.color};box-shadow:0 0 8px ${ec.color}"></div><span class="status-label">Status:</span><span class="status-value" style="color:${ec.color}">${ec.label}</span></div><div class="status-note">${facts.eko_detail||ec.note||'Perlu analisis lebih lanjut'}</div><div class="status-item" style="margin-top:6px;"><span class="status-label">CF Ekologis:</span><span class="status-value" style="color:var(--accent-amber)">${(facts.eko_cf||0).toFixed(2)}</span></div>`;
  await sleep(120);
  const rl=document.getElementById('reco-list');rl.innerHTML='';
  recos.forEach((r,i)=>{const d=document.createElement('div');d.className='reco-item';d.style.animationDelay=(i*0.05)+'s';d.innerHTML=`<div class="reco-head">${r.head}</div>${r.body}`;rl.appendChild(d);});
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

let isRunning=false;
async function runInference(){
  if(isRunning)return;
  const bortle=parseInt(document.getElementById('f-bortle').value),kawasan=document.getElementById('f-kawasan').value,sumber=document.getElementById('f-sumber').value,cuaca=document.getElementById('f-cuaca').value,visib=document.getElementById('f-visib').value,waktu=document.getElementById('f-waktu').value;
  const missing=[];
  if(!bortle)missing.push('Bortle Scale');if(!kawasan)missing.push('Tipe Kawasan');if(!sumber)missing.push('Sumber Cahaya');if(!cuaca)missing.push('Kondisi Cuaca');if(!visib)missing.push('Visibilitas Bintang');if(!waktu)missing.push('Waktu Pengukuran');
  document.getElementById('log-area').innerHTML='';
  if(missing.length>0){appendLog({type:'err',msg:`Fakta tidak lengkap! Harap isi: ${missing.join(', ')}`});return;}
  isRunning=true;
  const btn=document.getElementById('run-btn');btn.classList.add('running');btn.querySelector('span').textContent='⏳ MEMPROSES...';
  document.getElementById('scan-overlay').classList.add('active');
  const facts={bortle,kawasan,sumber,cuaca,visib,waktu,zona:null,zona_cf:0,penyebab:[],amplifikasi:false,astronomi:null,astro_cf:0,ekologis:null,eko_cf:0,eko_detail:''};
  const{facts:result,log,stats}=forwardChain(facts);
  await animateLog(log);
  const recos=buildRecommendations(result);
  const sb=document.getElementById('rule-stats-bar');sb.style.display='flex';
  document.getElementById('s-checked').textContent=stats.checked;document.getElementById('s-fired').textContent=stats.fired;document.getElementById('s-newfacts').textContent=stats.newFacts;document.getElementById('s-iter').textContent=stats.iter;
  document.getElementById('info-fired').textContent=stats.fired;
  await displayResults(result,recos);
  document.getElementById('scan-overlay').classList.remove('active');btn.classList.remove('running');btn.querySelector('span').textContent='▶ JALANKAN INFERENSI';isRunning=false;
}

function resetAll(){
  ['f-bortle','f-kawasan','f-sumber','f-cuaca','f-visib','f-waktu'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('log-area').innerHTML='<span class="log-idle">Menunggu input fakta dan eksekusi inferensi...</span>';
  document.getElementById('output-idle').style.display='flex';document.getElementById('output-result').style.display='none';
  document.getElementById('rule-stats-bar').style.display='none';document.getElementById('info-fired').textContent='—';
}