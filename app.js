const cap=s=>s[0].toUpperCase()+s.slice(1);
const get=u=>fetch(u).then(r=>r.json()).catch(()=>null);
const lagos=()=>{const p=new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Lagos",weekday:"long",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());const g=t=>p.find(x=>x.type===t).value;return{day:g("weekday").toLowerCase(),mins:+g("hour")*60+ +g("minute")}};
const mins=t=>{const[h,m]=t.split(":").map(Number);return h*60+m};
const fmt=t=>{const[h,m]=t.split(":").map(Number);return`${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}`};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function rows(list,live){return list.length?`<ul class="rows">${list.map(s=>{const n=live!=null&&mins(s.start)<=live&&live<mins(s.end);return`<li${n?' class="now"':""}><span class="time">${fmt(s.start)} – ${fmt(s.end)}</span><span>${esc(s.title)}${n?' <span class="badge">On air</span>':""}</span><span class="host">${esc(s.host)}</span></li>`}).join("")}</ul>`:'<p class="empty">No programmes listed for this day yet.</p>'}
async function init(){
  const NAV=[["index.html","Home"],["schedule.html","Schedule"],["shows.html","Shows"],["stories.html","Stories"],["team.html","Team"],["transcripts.html","Transcripts"],["index.html#contact","Contact"]];
  const nv=document.querySelector("header nav");
  if(nv){const norm=s=>s.replace(/\.html$/,"")||"index";const here=norm(location.pathname.split("/").pop());
    nv.innerHTML=NAV.map(([h,t])=>`<a href="${h}"${!h.includes("#")&&norm(h)===here?' aria-current="page"':""}>${t}</a>`).join("");
    const css=document.createElement("style");css.textContent="@media(max-width:780px){nav{gap:16px!important;font-size:.9rem!important;overflow-x:auto;white-space:nowrap;scrollbar-width:none;min-width:0;margin-left:12px}.brand img{width:40px!important;height:40px!important}}";document.head.appendChild(css)}

  const btn=document.getElementById("play");
  if(btn){const a=new Audio();btn.onclick=()=>{if(a.paused){a.src=btn.dataset.stream;a.play();btn.classList.add("playing");btn.lastChild.textContent="Pause"}else{a.pause();a.removeAttribute("src");a.load();btn.classList.remove("playing");btn.lastChild.textContent="Listen live"}}}
  const sched=await get("schedule.json");const items=(sched&&sched.shows)||[];
  const byDay=d=>items.filter(s=>(s.days||[]).includes(d)).sort((a,b)=>mins(a.start)-mins(b.start));
  const now=lagos();
  const today=document.getElementById("today");
  if(today)today.innerHTML=rows(byDay(now.day),now.mins);
  const week=document.getElementById("week");
  if(week){const tabs=document.getElementById("tabs"),show=d=>{tabs.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",b.dataset.d===d));week.innerHTML=rows(byDay(d),d===now.day?now.mins:null)};
    tabs.innerHTML=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map(d=>`<button role="tab" data-d="${d}">${cap(d)}</button>`).join("");
    tabs.onclick=e=>{if(e.target.dataset.d)show(e.target.dataset.d)};show(now.day)}
  const st=document.getElementById("stories-list");
  if(st){const d=await get("stories.json");const l=((d&&d.stories)||[]).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
    st.innerHTML=l.length?l.map(s=>`<article class="story"><time>${new Date(s.date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</time><h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p></article>`).join(""):'<p class="empty">Stories will appear here.</p>'}
  const all=document.getElementById("stories-all");
  if(all){const d=await get("stories.json");const l=((d&&d.stories)||[]).sort((a,b)=>b.date.localeCompare(a.date));
    all.innerHTML=l.length?l.map(s=>`<article class="full"><time>${new Date(s.date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</time><h2>${esc(s.title)}</h2><p class="lead">${esc(s.summary)}</p>${String(s.body||"").split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join("")}</article>`).join(""):'<p class="empty">No stories yet.</p>'}
  const sh=document.getElementById("shows-list");
  if(sh){const O=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
    const a=i=>cap(O[i]).slice(0,3);
    const dayText=ds=>{const i=O.filter(x=>(ds||[]).includes(x)).map(x=>O.indexOf(x));if(!i.length)return"";const run=i.every((v,k)=>k==0||v==i[k-1]+1);return i.length>2&&run?`${a(i[0])} – ${a(i[i.length-1])}`:i.map(a).join(", ")};
    const d=await get("shows.json");const l=(d&&d.shows)||[];
    sh.innerHTML=l.length?l.map(s=>{const when=items.filter(x=>x.title===s.title).map(x=>`${dayText(x.days)} · ${fmt(x.start)} – ${fmt(x.end)}`);
      const r=(s.rundown||[]).map(x=>`<li><span class="rt">${esc(x.time)}</span><span><b>${esc(x.segment)}</b>${x.note?`<br><span class="rn">${esc(x.note)}</span>`:""}</span></li>`).join("");
      return`<details class="show"><summary><span class="st">${esc(s.title)}</span><span class="sm">${esc(s.host)}${when.length?" · "+esc(when.join(" | ")):""}</span></summary><div class="sb">${s.description?`<p>${esc(s.description)}</p>`:""}${r?`<h3>Rundown</h3><ol class="run">${r}</ol>`:'<p class="empty">Rundown coming soon.</p>'}</div></details>`}).join(""):'<p class="empty">Shows will appear here.</p>'}
  const tm=document.getElementById("team-list");
  if(tm){const d=await get("team.json");const l=(d&&d.team)||[];const ini=n=>String(n).split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
    tm.innerHTML=l.length?l.map(p=>`<article class="person">${p.photo?`<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="ph">${esc(ini(p.name))}</div>`}<h2>${esc(p.name)}</h2><p class="role">${esc(p.role)}</p>${p.bio?`<p class="bio">${esc(p.bio)}</p>`:""}</article>`).join(""):'<p class="empty">Team profiles will appear here.</p>'}
  const tr=document.getElementById("tr-list");
  if(tr){const d=await get("transcripts.json");const all=((d&&d.transcripts)||[]).sort((a,b)=>b.date.localeCompare(a.date));const q=document.getElementById("q");
    const draw=()=>{const k=(q.value||"").toLowerCase().trim();const l=all.filter(t=>!k||[t.title,t.show,t.text].join(" ").toLowerCase().includes(k));
      tr.innerHTML=l.length?l.map(t=>`<details class="show"><summary><span class="st">${esc(t.title)}</span><span class="sm">${esc(t.show)} · ${new Date(t.date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span></summary><div class="sb">${String(t.text||"").split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join("")}</div></details>`).join(""):'<p class="empty">No transcripts found.</p>'};
    q.oninput=draw;draw()}
}
init();
