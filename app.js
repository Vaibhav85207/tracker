const PLAN_DAYS = 84;
const START_KEY = "consistencyPlanStart";
const DATA_KEY = "consistencyTrackerDataV1";
const TOPICS = [
"Arrays, strings, complexity","Hash maps and sets","Two pointers","Sliding window","Prefix sums","Sorting and binary search","Recursion and stack",
"Queues and linked lists","Trees and BFS/DFS","Heap / top-K","Intervals and greedy","Basic dynamic programming","SQL filtering and NULLs","Joins and join cardinality",
"GROUP BY and HAVING","Window functions","CTEs and subqueries","Date/time SQL","Deduplication patterns","Top-N per group","Query plans and indexes",
"Python collections","Functions, iterators, generators","Exceptions and testing","Data modeling basics","Fact/dimension tables","SCD Type 1 vs Type 2",
"Incremental loads and watermarks","Idempotency and retries","ETL vs ELT","Batch vs streaming","Spark architecture","Lazy evaluation and DAGs",
"Transformations vs actions","Spark partitions","Shuffle mechanics","Data skew and salting","Broadcast joins","Join strategies","Caching and persistence",
"Adaptive Query Execution","Spark UI troubleshooting","Delta Lake transaction log","MERGE and upserts","Partitioning vs file layout","Small files and OPTIMIZE",
"Change Data Feed","Schema evolution","Time travel and recovery","Medallion architecture","Bronze/Silver/Gold responsibilities","Data quality checks",
"Late-arriving data","Structured Streaming","Checkpointing and exactly-once semantics","Kafka topics and partitions","Consumer groups and offsets",
"Azure Data Factory triggers","ADF parameterization","Databricks Jobs/Workflows","Secrets and service principals","Unity Catalog governance",
"ADLS Gen2 access patterns","CI/CD with Git and Jenkins","Dev vs prod deployment","Testing PySpark pipelines","Logging and observability",
"Failure recovery and backfills","Pipeline cost optimization","Data lakehouse system design","Scalable ingestion design","Data contracts and schema validation",
"Security and least privilege","SLAs and incident response","Trade-offs: latency, cost, reliability","Project deep dive","Behavioral stories using STAR",
"Mock interview: SQL + Python","Mock interview: Spark + Delta","Mock interview: system design","Review weak areas and mistake log","Full mock interview and readiness review"
];
const $ = id => document.getElementById(id);
const fields = ["py1","py2","sql1","sql2","py1Status","py2Status","sql1Status","sql2Status","theoryStatus","engineeringTask","engineeringStatus","mockStatus","notes"];
const statuses = ["py1Status","py2Status","sql1Status","sql2Status","theoryStatus"];
let selectedIndex = 0;
let data = loadData();
let deferredInstall = null;

function parseLocalDate(value) {
  const [y,m,d] = value.split("-").map(Number);
  return new Date(y, m-1, d, 12, 0, 0);
}
function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function planStart() {
  const saved = localStorage.getItem(START_KEY);
  if (saved) return parseLocalDate(saved);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  localStorage.setItem(START_KEY, dateKey(start));
  return start;
}
const startDate = planStart();
function dayDate(i) { const d = new Date(startDate); d.setDate(d.getDate()+i); return d; }
function keyAt(i) { return dateKey(dayDate(i)); }
function dayIndexForDate(d) {
  const diff = Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate()) - new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate()))/86400000);
  return Math.max(0, Math.min(PLAN_DAYS-1, diff));
}
function loadData() {
  try { return JSON.parse(localStorage.getItem(DATA_KEY) || "{}"); } catch { return {}; }
}
function saveData() { localStorage.setItem(DATA_KEY, JSON.stringify(data)); }
function defaultDay(i) {
  return {py1:"",py2:"",sql1:"",sql2:"",py1Status:"Not done",py2Status:"Not done",sql1Status:"Not done",sql2Status:"Not done",theoryStatus:"Not done",engineeringTask:"",engineeringStatus:"Not planned",mockStatus:"Not planned",notes:""};
}
function getDay(i) { return {...defaultDay(i), ...(data[keyAt(i)] || {})}; }
function coreCount(d) { return statuses.filter(k=>d[k]==="Done").length; }
function hasAny(d) { return coreCount(d)>0 || statuses.some(k=>d[k]==="Partial"||d[k]==="Missed") || ["py1","py2","sql1","sql2","notes"].some(k=>(d[k]||"").trim()); }
function fmtDate(d, options={weekday:"short", day:"numeric", month:"short"}) { return d.toLocaleDateString(undefined, options); }
function currentTodayIndex() {
  const now = new Date(); const n = Math.round((new Date(now.getFullYear(),now.getMonth(),now.getDate())-new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate()))/86400000);
  return Math.max(0, Math.min(PLAN_DAYS-1, n));
}
function setView(view) {
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("dailyView").classList.toggle("hidden",view!=="daily");
  $("calendarView").classList.toggle("hidden",view!=="calendar");
  $("reviewView").classList.toggle("hidden",view!=="review");
  if(view==="calendar") renderCalendar();
  if(view==="review") renderWeekly();
}
function renderDay() {
  const d = getDay(selectedIndex), date = dayDate(selectedIndex);
  $("todayLabel").textContent = fmtDate(new Date(),{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  $("selectedDateTitle").textContent = fmtDate(date,{weekday:"long",day:"numeric",month:"long"});
  $("dayNumber").textContent = `Day ${selectedIndex+1} of ${PLAN_DAYS}`;
  $("weekNumber").textContent = `Week ${Math.floor(selectedIndex/7)+1}`;
  $("theoryLabel").textContent = TOPICS[selectedIndex] || "Review core data engineering concepts";
  for(const field of fields) {
    const el = $(field); if(!el) continue;
    el.value = d[field] ?? (el.tagName==="SELECT" ? "Not done" : "");
  }
  $("engineeringStatus").value = d.engineeringStatus || "Not planned";
  $("mockStatus").value = d.mockStatus || "Not planned";
  updateTodayStats();
}
function collectForm() {
  const d = getDay(selectedIndex);
  for(const field of fields) { const el=$(field); if(el) d[field]=el.value; }
  data[keyAt(selectedIndex)] = d;
  saveData();
}
function updateTodayStats() {
  const d=getDay(selectedIndex), count=coreCount(d), pct=Math.round(count/5*100);
  $("todayPercent").textContent=`${pct}%`; $("ringText").textContent=`${count}/5`; $("todayBar").style.width=`${pct}%`;
  $("todayRing").style.borderTopColor=pct===100?"#25a45a":"#3975c6";
  $("todayRing").style.borderRightColor=pct>=40?"#3975c6":"#dce6f3";
  $("encouragement").textContent = pct===100 ? "Excellent. Five commitments complete — consistency is building." : count>0 ? "Good start. Finish the next small task, then save your progress." : "Start small. Mark each commitment honestly.";
  renderDashboard();
}
function renderDashboard() {
  let perfect=0, logged=0, completed=0, due=0;
  const todayIdx=currentTodayIndex();
  for(let i=0;i<PLAN_DAYS;i++){
    const d=getDay(i), count=coreCount(d);
    if(count===5) perfect++;
    if(hasAny(d)) logged++;
    completed+=count; if(i<=todayIdx) due+=5;
  }
  let streak=0;
  for(let i=Math.min(todayIdx,PLAN_DAYS-1);i>=0;i--){if(coreCount(getDay(i))===5)streak++;else break;}
  $("streak").textContent=`${streak} ${streak===1?"day":"days"}`;
  $("perfectDays").textContent=perfect;
  $("planProgress").textContent=`${Math.round(completed/(PLAN_DAYS*5)*100)}%`;
  $("daysLogged").textContent=`${logged}/${PLAN_DAYS}`;
}
function saveCurrent() {
  collectForm();
  $("saveMessage").textContent="Saved on this device ✓";
  updateTodayStats();
  if(!$("calendarView").classList.contains("hidden")) renderCalendar();
}
function renderCalendar() {
  const grid=$("calendarGrid"); grid.innerHTML="";
  const today=new Date(); const todayKey=dateKey(today);
  for(let i=0;i<PLAN_DAYS;i++){
    const d=getDay(i), date=dayDate(i), count=coreCount(d), key=keyAt(i);
    const btn=document.createElement("button"); btn.type="button";
    btn.className="calendar-day"+(count===5?" complete":count>0?" partial":"")+(i===selectedIndex?" selected":"")+(key>todayKey?" future":"");
    btn.innerHTML=`<span class="date-dow">${date.toLocaleDateString(undefined,{weekday:"short"})}</span><span class="date-num">${date.getDate()}</span><span class="day-score">${count}/5</span>`;
    btn.setAttribute("aria-label",`${fmtDate(date)}, ${count} of 5 core tasks complete`);
    btn.addEventListener("click",()=>{collectForm();selectedIndex=i;renderDay();setView("daily");window.scrollTo({top:0,behavior:"smooth"});});
    grid.appendChild(btn);
  }
}
function renderWeekly() {
  const root=$("weeklyCards"); root.innerHTML="";
  for(let w=0;w<12;w++){
    let total=0, logged=0, perfect=0;
    for(let j=0;j<7;j++){const d=getDay(w*7+j);total+=coreCount(d);if(hasAny(d))logged++;if(coreCount(d)===5)perfect++;}
    const pct=Math.round(total/35*100);
    const card=document.createElement("article");card.className="week-card";
    card.innerHTML=`<div class="week-card-top"><h3>Week ${w+1}</h3><strong>${pct}%</strong></div><div class="week-dates">${fmtDate(dayDate(w*7),{day:"numeric",month:"short"})} – ${fmtDate(dayDate(w*7+6),{day:"numeric",month:"short"})} · ${perfect}/7 perfect days · ${logged}/7 logged</div><div class="week-track"><div style="width:${pct}%"></div></div>`;
    root.appendChild(card);
  }
  $("weeklyReflection").value=data.weeklyReflection||"";
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{collectForm();setView(b.dataset.view);}));
$("prevDay").addEventListener("click",()=>{collectForm();selectedIndex=Math.max(0,selectedIndex-1);renderDay();});
$("nextDay").addEventListener("click",()=>{collectForm();selectedIndex=Math.min(PLAN_DAYS-1,selectedIndex+1);renderDay();});
$("jumpToday").addEventListener("click",()=>{collectForm();selectedIndex=currentTodayIndex();renderDay();setView("daily");});
$("saveBtn").addEventListener("click",saveCurrent);
for(const field of fields){const el=$(field);if(el){el.addEventListener("change",()=>{collectForm();updateTodayStats();});}}
$("saveReflection").addEventListener("click",()=>{data.weeklyReflection=$("weeklyReflection").value;saveData();$("reflectionMessage").textContent="Reflection saved ✓";});
$("exportBtn").addEventListener("click",()=>{
  collectForm();const blob=new Blob([JSON.stringify({version:1,startDate:dateKey(startDate),data},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="consistency-tracker-backup.json";a.click();URL.revokeObjectURL(url);
});
$("importFile").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  try{const parsed=JSON.parse(await file.text());if(!parsed.data||typeof parsed.data!=="object")throw new Error("Invalid backup");data=parsed.data;saveData();renderDay();renderDashboard();renderCalendar();alert("Backup imported successfully.");}
  catch{alert("Could not import this file. Choose a backup exported by this app.");}
  e.target.value="";
});
$("resetBtn").addEventListener("click",()=>{
  if(confirm("Reset all saved progress, notes, and reflections on this browser? Export a backup first if you want to keep them.")){
    data={};saveData();renderDay();renderDashboard();renderCalendar();renderWeekly();
  }
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("installBtn").classList.remove("hidden");});
$("installBtn").addEventListener("click",async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("installBtn").classList.add("hidden");});
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
selectedIndex=currentTodayIndex();renderDay();renderDashboard();
