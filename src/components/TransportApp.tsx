 "use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  LayoutDashboard, MapPinned, BusFront, Users, UserRound, Route, ClipboardCheck,
  Bell, ChartNoAxesCombined, Settings, Search, Plus, ChevronDown, Menu, X,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Clock3, MapPin, Fuel, Wrench,
  CircleCheck, CircleAlert, CircleDot, CalendarDays, Download, Filter, SlidersHorizontal,
  Navigation, ShieldCheck, Activity, Gauge, Phone, Mail, ExternalLink, Check,
  CircleHelp, LogOut, Building2, CalendarClock, Radio, FileText, TrendingUp
} from "lucide-react";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Live Tracking", icon: MapPinned },
  { label: "Buses", icon: BusFront },
  { label: "Students", icon: Users },
  { label: "Drivers", icon: UserRound },
  { label: "Routes", icon: Route },
  { label: "Attendance", icon: ClipboardCheck },
  { label: "Notifications", icon: Bell, count: "3" },
  { label: "Reports", icon: ChartNoAxesCombined },
  { label: "Settings", icon: Settings }
];

const busData = [
  { id:"SEC-01", plate:"TN  Salem  01  AB  2486", route:"Salem Central", driver:"R. Kumar", status:"On route", students:42, fuel:"78%", km:"64 km", next:"Five Roads · 8 min" },
  { id:"SEC-04", plate:"TN  Salem  01  AB  3912", route:"Ammapet", driver:"S. Prakash", status:"On route", students:38, fuel:"62%", km:"51 km", next:"New Bus Stand · 5 min" },
  { id:"SEC-07", plate:"TN  Salem  01  AB  5703", route:"Omalur", driver:"M. Suresh", status:"On route", students:31, fuel:"91%", km:"72 km", next:"Omalur Junction · 12 min" },
  { id:"SEC-12", plate:"TN  Salem  01  AB  6821", route:"Attur Road", driver:"K. Anand", status:"At stop", students:36, fuel:"46%", km:"48 km", next:"College Gate · Arrived" },
  { id:"SEC-15", plate:"TN  Salem  01  AB  7734", route:"Mettur", driver:"P. Rajesh", status:"Maintenance", students:0, fuel:"35%", km:"—", next:"Service bay" },
  { id:"SEC-18", plate:"TN  Salem  01  AB  8890", route:"Hasthampatti", driver:"V. Mani", status:"On route", students:29, fuel:"84%", km:"39 km", next:"Hasthampatti · 7 min" }
];
const students = [
  ["STU-24018","Aarav S.","CSE · III Year","Salem Central","SEC-01","Boarded"],
  ["STU-24026","Diya R.","AI&DS · II Year","Ammapet","SEC-04","Boarded"],
  ["STU-24031","Kavin M.","ECE · IV Year","Omalur","SEC-07","Boarded"],
  ["STU-24042","Nila P.","CSE · I Year","Attur Road","SEC-12","Pending"],
  ["STU-24057","Arjun K.","IT · III Year","Mettur","SEC-15","Absent"],
  ["STU-24063","Meera S.","AI&DS · II Year","Hasthampatti","SEC-18","Boarded"]
];
const drivers = [
  ["R. Kumar","SEC-01","Salem Central","4.9","Active"],
  ["S. Prakash","SEC-04","Ammapet","4.8","Active"],
  ["M. Suresh","SEC-07","Omalur","4.7","Active"],
  ["K. Anand","SEC-12","Attur Road","4.9","Active"],
  ["P. Rajesh","SEC-15","Mettur","4.6","On leave"],
  ["V. Mani","SEC-18","Hasthampatti","4.8","Active"]
];
const routeData = [
  ["R-01","Salem Central","SEC-01","18 stops","42","28.4 km","06:45 AM"],
  ["R-02","Ammapet","SEC-04","14 stops","38","22.1 km","06:50 AM"],
  ["R-03","Omalur","SEC-07","12 stops","31","31.6 km","06:30 AM"],
  ["R-04","Attur Road","SEC-12","16 stops","36","25.8 km","06:40 AM"],
  ["R-05","Mettur","SEC-15","20 stops","0","42.3 km","06:20 AM"],
  ["R-06","Hasthampatti","SEC-18","11 stops","29","17.9 km","07:00 AM"]
];
const alerts = [
  { type:"warning", title:"Bus SEC-15 maintenance required", desc:"Scheduled service due in 2 days · Fleet", time:"8 min ago" },
  { type:"success", title:"SEC-12 reached College Gate", desc:"Attur Road route · Arrival recorded", time:"14 min ago" },
  { type:"info", title:"Parent notification delivered", desc:"Student STU-24026 · Bus SEC-04", time:"21 min ago" },
  { type:"warning", title:"Attendance pending review", desc:"3 students not marked · Route R-04", time:"32 min ago" }
];

function Status({ value }: { value: string }) {
  const cls = value === "On route" || value === "Boarded" || value === "Active" || value === "Completed" ? "green" :
    value === "At stop" || value === "Pending" ? "amber" :
    value === "Maintenance" || value === "Absent" || value === "On leave" ? "red" : "blue";
  return <span className={`status ${cls}`}><span className="status-dot"/>{value}</span>;
}
function Metric({ title, value, change, icon: Icon, color, note }: any) {
  return <div className="metric-card"><div className="metric-top"><span>{title}</span><span className={`metric-icon ${color}`}><Icon size={18}/></span></div><div className="metric-value">{value}</div><div className="metric-bottom"><span className="trend"><ArrowUpRight size={14}/>{change}</span><span>{note}</span></div></div>;
}
function PageTitle({ title, subtitle, action }: any) {
  return <div className="page-title"><div><div className="eyebrow">TRANSPORT OPERATIONS / {title.toUpperCase()}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}
function Table({ headers, rows }: any) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((h:string)=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row:any[],i)=><tr key={i}>{row.map((cell:any,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export default function TransportApp() {
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState("");
  const [filter, setFilter] = useState("All");
  const [notifRead, setNotifRead] = useState(false);

  const notify = (message:string) => { setToast(message); setTimeout(()=>setToast(""), 2800); };
  const addAction = (label:string) => { setModal(label); };
  const actionButton = (label: string, icon: any = Plus) => {
    const Icon = icon;
    return (
      <button className="primary-btn" onClick={() => addAction(label)}>
        <Icon size={16} />
        {label}
      </button>
    );
  };

  const renderDashboard = () => <>
    <PageTitle title="Dashboard" subtitle="Here's what's happening across your fleet today." action={<button className="secondary-btn" onClick={()=>notify("Report export started")}><Download size={16}/> Export report</button>}/>
    <div className="welcome-banner"><div><div className="welcome-tag"><span className="live-dot"/> LIVE OVERVIEW</div><h2>Good morning, Transport Admin <span>✦</span></h2><p>Your fleet is moving smoothly. Here's your operations snapshot for today.</p><div className="welcome-meta"><span><CalendarDays size={14}/> Friday, 06 November 2026</span><span><Clock3 size={14}/> Last updated just now</span></div></div><div className="banner-art"><div className="orbit orbit1"/><div className="orbit orbit2"/><div className="bus-illustration"><BusFront size={72}/></div><span className="floating-pin"><MapPin size={18}/></span><span className="floating-check"><CircleCheck size={18}/></span></div></div>
    <div className="metrics-grid"><Metric title="Total fleet" value="24" change="+2 this month" icon={BusFront} color="purple" note="registered buses"/><Metric title="Buses on route" value="18" change="75% active" icon={Navigation} color="blue" note="of total fleet"/><Metric title="Students onboard" value="684" change="+6.4%" icon={Users} color="green" note="across all routes"/><Metric title="On-time rate" value="96.8%" change="+2.1%" icon={Gauge} color="orange" note="vs. last week"/></div>
    <div className="content-grid dashboard-grid"><section className="panel map-panel"><div className="panel-head"><div><h3>Live fleet overview</h3><p>Real-time bus locations across Salem</p></div><button className="icon-btn" onClick={()=>setActive("Live Tracking")}><ExternalLink size={16}/></button></div><MapView/><div className="map-legend"><span><i className="legend-bus"/> Moving <b>18</b></span><span><i className="legend-stop"/> Stops <b>42</b></span><span><i className="legend-offline"/> Offline <b>2</b></span></div></section>
    <section className="panel"><div className="panel-head"><div><h3>Fleet status</h3><p>Current operational breakdown</p></div><button className="text-btn" onClick={()=>setActive("Buses")}>View fleet <ArrowUpRight size={14}/></button></div><div className="fleet-donut-wrap"><div className="donut"><div><strong>24</strong><span>Total buses</span></div></div><div className="fleet-legend"><div><i className="dot green-dot"/> <span>On route</span><b>18</b></div><div><i className="dot purple-dot"/> <span>At stop</span><b>4</b></div><div><i className="dot gray-dot"/> <span>Maintenance</span><b>2</b></div></div></div><div className="fleet-footer"><span><CircleCheck size={14}/> Fleet health</span><strong>92.4%</strong></div></section></div>
    <div className="content-grid lower-grid"><section className="panel"><div className="panel-head"><div><h3>Active buses</h3><p>Latest fleet activity</p></div><button className="text-btn" onClick={()=>setActive("Buses")}>View all <ArrowUpRight size={14}/></button></div><Table headers={["BUS","ROUTE","DRIVER","STATUS",""]} rows={busData.slice(0,4).map(b=>[<div className="bus-cell"><span className="bus-mini"><BusFront size={16}/></span><div><b>{b.id}</b><small>{b.plate}</small></div></div>,b.route,b.driver,<Status value={b.status}/>,<button className="icon-btn" onClick={()=>setActive("Live Tracking")}><MoreHorizontal size={16}/></button>])}/></section><section className="panel"><div className="panel-head"><div><h3>Recent activity</h3><p>Latest transport updates</p></div><button className="icon-btn" onClick={()=>setActive("Notifications")}><MoreHorizontal size={16}/></button></div><div className="activity-list">{alerts.slice(0,4).map((a,i)=><div className="activity-item" key={i}><div className={`activity-icon ${a.type}`}>{a.type==="warning"?<CircleAlert size={16}/>:a.type==="success"?<CircleCheck size={16}/>:<Bell size={16}/>}</div><div className="activity-copy"><b>{a.title}</b><span>{a.desc}</span><small>{a.time}</small></div></div>)}</div></section></div>
  </>;

  const renderTracking = () => <><PageTitle title="Live Tracking" subtitle="Monitor your fleet in real time across Salem and surrounding routes." action={<><button className="secondary-btn" onClick={()=>notify("Map view refreshed")}><Radio size={16}/> Refresh locations</button><button className="primary-btn" onClick={()=>notify("Live tracking link copied")}><Navigation size={16}/> Share live view</button></>}/><div className="tracking-stats"><div><span className="live-dot"/> GPS SIGNAL <b>98.6%</b></div><div><span className="tiny-green"/> 18 buses moving</div><div><span className="tiny-amber"/> 4 buses at stops</div><div><span className="tiny-gray"/> 2 offline</div></div><div className="tracking-layout"><div className="panel tracking-map-panel"><div className="panel-head"><div><h3>Fleet map</h3><p>Salem, Tamil Nadu · Live location simulation</p></div><button className="secondary-btn small" onClick={()=>notify("Map centered on fleet")}> <MapPin size={14}/> Recenter</button></div><MapView full/><div className="map-legend"><span><i className="legend-bus"/> Bus location</span><span><i className="legend-stop"/> Route stop</span><span><i className="legend-line"/> Route path</span></div></div><div className="panel tracking-list"><div className="panel-head"><div><h3>Vehicles</h3><p>18 active GPS devices</p></div><button className="icon-btn"><SlidersHorizontal size={16}/></button></div>{busData.slice(0,5).map(b=><button className="vehicle-row" key={b.id} onClick={()=>notify(`${b.id} selected on map`)}><span className="vehicle-icon"><BusFront size={17}/></span><span className="vehicle-info"><b>{b.id} <Status value={b.status}/></b><small>{b.route} · {b.driver}</small><small><MapPin size={12}/> {b.next}</small></span><span className="vehicle-speed">{b.status==="At stop"?"0":b.id==="SEC-07"?"41":"34"}<small>km/h</small></span></button>)}</div></div></>;

  const renderBuses = () => <><PageTitle title="Buses" subtitle="Manage your fleet, vehicle health, and maintenance schedules." action={<>{actionButton("Add bus")}<button className="secondary-btn" onClick={()=>notify("Fleet CSV export prepared")}><Download size={16}/> Export</button></>}/><div className="metrics-grid compact"><Metric title="Total vehicles" value="24" change="Fleet registered" icon={BusFront} color="purple" note="all buses"/><Metric title="Operational" value="22" change="91.7% availability" icon={CircleCheck} color="green" note="ready for service"/><Metric title="In maintenance" value="2" change="1 scheduled" icon={Wrench} color="orange" note="service status"/><Metric title="Fleet utilization" value="87%" change="+4.2%" icon={TrendingUp} color="blue" note="this month"/></div><section className="panel"><div className="toolbar"><div className="search-box"><Search size={16}/><input placeholder="Search buses, registration, route..." value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="secondary-btn small" onClick={()=>setFilter(filter==="All"?"On route":"All")}><Filter size={15}/> {filter==="All"?"All status":"On route"}</button></div><Table headers={["BUS / REGISTRATION","ASSIGNED ROUTE","DRIVER","STUDENTS","FUEL","STATUS","ACTIONS"]} rows={busData.filter(b=>(b.id+b.plate+b.route).toLowerCase().includes(search.toLowerCase())&&(filter==="All"||b.status===filter)).map(b=>[<div className="bus-cell"><span className="bus-mini"><BusFront size={16}/></span><div><b>{b.id}</b><small>{b.plate}</small></div></div>,b.route,b.driver,b.students,b.fuel,<Status value={b.status}/>,<button className="icon-btn" onClick={()=>notify(`Opening ${b.id} details`)}><MoreHorizontal size={16}/></button>])}/></section></>;

  const renderStudents = () => <><PageTitle title="Students" subtitle="Student transport profiles, route assignments, and boarding status." action={<>{actionButton("Add student")}<button className="secondary-btn" onClick={()=>notify("Student list exported")}><Download size={16}/> Export</button></>}/><div className="metrics-grid compact"><Metric title="Transport enrolled" value="1,248" change="+32 this term" icon={Users} color="purple" note="students"/><Metric title="Boarded today" value="684" change="54.8% boarded" icon={ClipboardCheck} color="green" note="morning shift"/><Metric title="Pending boarding" value="41" change="Across 6 routes" icon={Clock3} color="orange" note="awaiting check-in"/><Metric title="Transport routes" value="18" change="6 active today" icon={Route} color="blue" note="assigned routes"/></div><section className="panel"><div className="toolbar"><div className="search-box"><Search size={16}/><input placeholder="Search student name, ID, route..." value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="secondary-btn small" onClick={()=>setFilter(filter==="All"?"Boarded":"All")}><Filter size={15}/>{filter==="All"?"All attendance":"Boarded"}</button></div><Table headers={["STUDENT","DEPARTMENT","ROUTE","BUS","TODAY",""]} rows={students.filter(s=>(s.join(" ").toLowerCase().includes(search.toLowerCase()))&&(filter==="All"||s[5]===filter)).map(s=>[<div className="person-cell"><span className="avatar">{s[1].split(" ").map(x=>x[0]).join("")}</span><div><b>{s[1]}</b><small>{s[0]}</small></div></div>,s[2],s[3],s[4],<Status value={s[5]}/>,<button className="icon-btn" onClick={()=>notify(`Viewing ${s[1]}`)}><MoreHorizontal size={16}/></button>])}/></section></>;

  const renderDrivers = () => <><PageTitle title="Drivers" subtitle="Driver profiles, assigned vehicles, and operational availability." action={actionButton("Add driver")}/><div className="driver-grid">{drivers.map((d,i)=><div className="panel driver-card" key={d[0]}><div className="driver-card-top"><div className="avatar large">{d[0].split(" ").map(x=>x[0]).join("")}</div><button className="icon-btn" onClick={()=>notify(`${d[0]} profile opened`)}><MoreHorizontal size={16}/></button></div><h3>{d[0]}</h3><p className="driver-id">Driver ID · DRV-{String(102+i).padStart(3,"0")}</p><Status value={d[4]}/><div className="driver-details"><span><BusFront size={14}/> {d[1]}</span><span><Route size={14}/> {d[2]}</span><span><CircleCheck size={14}/> {d[3]} rating</span></div><div className="driver-card-footer"><button className="secondary-btn small" onClick={()=>notify(`Calling ${d[0]} (demo)`)}><Phone size={14}/> Contact</button><button className="text-btn" onClick={()=>notify(`Viewing ${d[0]} details`)}>View profile <ArrowUpRight size={14}/></button></div></div>)}</div></>;

  const renderRoutes = () => <><PageTitle title="Routes" subtitle="Plan, assign, and optimize college bus routes and pickup stops." action={actionButton("Create route",Route)}/><div className="metrics-grid compact"><Metric title="Active routes" value="18" change="+2 new routes" icon={Route} color="purple" note="daily routes"/><Metric title="Total stops" value="142" change="Across Salem" icon={MapPin} color="blue" note="pickup points"/><Metric title="Avg. route time" value="48 min" change="-6 min" icon={Clock3} color="green" note="vs. last month"/><Metric title="Route coverage" value="94%" change="+3.5%" icon={Navigation} color="orange" note="student coverage"/></div><div className="route-layout"><section className="panel"><div className="panel-head"><div><h3>Route directory</h3><p>Assigned routes and schedules</p></div></div><Table headers={["ROUTE","BUS","STOPS","STUDENTS","DISTANCE","DEPARTURE",""]} rows={routeData.map(r=>[<div><b>{r[0]} · {r[1]}</b><small className="subline">Morning pickup</small></div>,r[2],r[3],r[4],r[5],r[6],<button className="icon-btn" onClick={()=>notify(`${r[1]} route selected`)}><MoreHorizontal size={16}/></button>])}/></section><section className="panel"><div className="panel-head"><div><h3>Route preview</h3><p>Salem Central · R-01</p></div><Status value="On route"/></div><MapView/><div className="route-stops"><div className="stop-line"><span className="stop-number">1</span><div><b>Salem Central Bus Stand</b><small>06:45 AM · Pickup point</small></div></div><div className="stop-line"><span className="stop-number">2</span><div><b>Five Roads Junction</b><small>06:58 AM · 8 students</small></div></div><div className="stop-line"><span className="stop-number">3</span><div><b>SEC College Gate</b><small>07:25 AM · Final stop</small></div></div></div></section></div></>;

  const renderAttendance = () => <><PageTitle title="Attendance" subtitle="Track student boarding and arrival records across all routes." action={<>{actionButton("Manual check-in",Check)}<button className="secondary-btn" onClick={()=>notify("Attendance report exported")}><Download size={16}/> Export</button></>}/><div className="metrics-grid compact"><Metric title="Expected today" value="1,248" change="All routes" icon={Users} color="purple" note="students"/><Metric title="Boarded" value="684" change="54.8% complete" icon={CircleCheck} color="green" note="morning pickup"/><Metric title="Not boarded" value="41" change="Needs follow-up" icon={CircleAlert} color="orange" note="pending"/><Metric title="Absent" value="12" change="1.0% of students" icon={CircleDot} color="red" note="marked absent"/></div><section className="panel"><div className="toolbar"><div className="search-box"><Search size={16}/><input placeholder="Search student or route..." value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="secondary-btn small" onClick={()=>setFilter(filter==="All"?"Pending":"All")}><CalendarDays size={15}/> Today · {filter}</button></div><Table headers={["STUDENT","ROUTE","BUS","BOARDING TIME","STATUS","ACTION"]} rows={students.filter(s=>s.join(" ").toLowerCase().includes(search.toLowerCase())&&(filter==="All"||s[5]===filter)).map((s,i)=>[<div className="person-cell"><span className="avatar">{s[1].split(" ").map(x=>x[0]).join("")}</span><div><b>{s[1]}</b><small>{s[0]}</small></div></div>,s[3],s[4],s[5]==="Boarded"?`07:${String(12+i*4).padStart(2,"0")} AM`:"—",<Status value={s[5]}/>,<button className="secondary-btn small" onClick={()=>notify(`${s[1]} attendance updated`)}>Mark present</button>])}/></section></>;

  const renderNotifications = () => <><PageTitle title="Notifications" subtitle="Parent alerts, transport updates, and delivery activity." action={<button className="secondary-btn" onClick={()=>{setNotifRead(true);notify("All notifications marked as read")}}><Check size={16}/> Mark all read</button>}/><div className="metrics-grid compact"><Metric title="Sent today" value="1,482" change="+12.4%" icon={Bell} color="purple" note="notifications"/><Metric title="Delivered" value="98.7%" change="1,463 delivered" icon={CircleCheck} color="green" note="delivery rate"/><Metric title="Pending" value="14" change="Retry queued" icon={Clock3} color="orange" note="in delivery queue"/><Metric title="Failed" value="5" change="Needs attention" icon={CircleAlert} color="red" note="failed messages"/></div><div className="notification-layout"><section className="panel"><div className="panel-head"><div><h3>Notification activity</h3><p>Recent messages and alerts</p></div><button className="secondary-btn small" onClick={()=>addAction("Send notification")}><Plus size={14}/> Compose</button></div>{alerts.map((a,i)=><div className={`notification-row ${notifRead?"read":""}`} key={i}><div className={`activity-icon ${a.type}`}>{a.type==="warning"?<CircleAlert size={16}/>:a.type==="success"?<CircleCheck size={16}/>:<Bell size={16}/>}</div><div className="notification-copy"><b>{a.title}</b><p>{a.desc}</p><small>{a.time} · SMS / App push</small></div><Status value={i===2?"Completed":i===0?"Pending":"Completed"}/></div>)}</section><section className="panel"><div className="panel-head"><div><h3>Quick compose</h3><p>Send a transport update</p></div></div><label className="field-label">Audience</label><select className="form-control"><option>All parents</option><option>Route R-01 · Salem Central</option><option>Route R-02 · Ammapet</option><option>All drivers</option></select><label className="field-label">Message type</label><select className="form-control"><option>Bus arrival update</option><option>Route delay</option><option>Emergency alert</option></select><label className="field-label">Message</label><textarea className="form-control textarea" defaultValue="SEC Transport update: Your bus is approaching the next stop. Please be ready for boarding."/><button className="primary-btn full-btn" onClick={()=>notify("Notification queued for delivery (demo)")}>Send notification <ArrowUpRight size={15}/></button></section></div></>;

  const renderReports = () => <><PageTitle title="Reports & Analytics" subtitle="Insights into fleet utilization, attendance, and transport performance." action={<button className="primary-btn" onClick={()=>notify("Report export generated (demo)")}><Download size={16}/> Export report</button>}/><div className="metrics-grid compact"><Metric title="Fleet utilization" value="87.2%" change="+4.2%" icon={BusFront} color="purple" note="month over month"/><Metric title="On-time arrivals" value="96.8%" change="+2.1%" icon={Clock3} color="green" note="target 95%"/><Metric title="Student attendance" value="94.3%" change="+1.8%" icon={ClipboardCheck} color="blue" note="daily average"/><Metric title="Fuel efficiency" value="8.4 km/L" change="+0.6 km/L" icon={Fuel} color="orange" note="fleet average"/></div><div className="content-grid reports-grid"><section className="panel"><div className="panel-head"><div><h3>Transport performance</h3><p>Weekly on-time rate · sample operational data</p></div><select className="select-small"><option>Last 7 days</option><option>Last 30 days</option></select></div><div className="chart-area"><div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-main"><div className="chart-gridlines"><i/><i/><i/><i/><i/></div><svg viewBox="0 0 600 220" preserveAspectRatio="none" className="chart-svg"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity=".28"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs><path d="M0 60 C45 45 55 72 100 55 S160 65 200 42 S260 50 300 38 S360 55 400 28 S460 44 500 24 S560 32 600 18 L600 220 L0 220Z" fill="url(#chartFill)"/><path d="M0 60 C45 45 55 72 100 55 S160 65 200 42 S260 50 300 38 S360 55 400 28 S460 44 500 24 S560 32 600 18" fill="none" stroke="#9b8afb" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg><div className="chart-x"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div><div className="chart-foot"><span><i className="legend-line"/> On-time arrival</span><b>96.8% <small>weekly avg.</small></b></div></section><section className="panel"><div className="panel-head"><div><h3>Route performance</h3><p>Top routes by punctuality</p></div></div>{routeData.slice(0,5).map((r,i)=><div className="route-performance" key={r[0]}><div><b>{r[1]}</b><small>{r[2]} · {r[4]} students</small></div><strong>{[98,96,94,91,88][i]}%</strong><div className="progress-track"><div style={{width:`${[98,96,94,91,88][i]}%`}}/></div></div>)}</section></div><section className="panel report-table"><div className="panel-head"><div><h3>Monthly fleet summary</h3><p>November 2026 · operational snapshot</p></div></div><Table headers={["METRIC","CURRENT","PREVIOUS","CHANGE","TREND"]} rows={[["Total trips","2,184","2,096","+4.2%",<Status value="Improved"/>],["Student trips","18,642","17,930","+4.0%",<Status value="Improved"/>],["Fuel consumed","4,860 L","5,020 L","−3.2%",<Status value="Improved"/>],["Maintenance cost","₹82,400","₹76,100","+8.3%",<Status value="Pending"/>]]}/></section></>;

  const renderSettings = () => <><PageTitle title="Settings" subtitle="Manage institution preferences, access controls, and system configuration." action={<button className="primary-btn" onClick={()=>notify("Settings saved successfully (demo)")}><Check size={16}/> Save changes</button>}/><div className="settings-layout"><aside className="settings-nav">{["General","Transport preferences","Notifications","User roles & permissions","Integrations","Security","System status"].map((s,i)=><button key={s} className={i===0?"selected":""} onClick={()=>notify(`${s} settings selected`)}>{[Building2,BusFront,Bell,ShieldCheck,Radio,ShieldCheck,Activity][i] && (()=>{const I=[Building2,BusFront,Bell,ShieldCheck,Radio,ShieldCheck,Activity][i];return <I size={16}/>})()}{s}</button>)}</aside><section className="panel settings-content"><div className="settings-section"><h3>Institution profile</h3><p>Configure your college transport identity.</p><div className="form-grid"><div><label className="field-label">Institution name</label><input className="form-control" defaultValue="Shreenivasa Engineering College"/></div><div><label className="field-label">Short name</label><input className="form-control" defaultValue="SEC"/></div><div><label className="field-label">Contact email</label><input className="form-control" defaultValue="transport@sec.edu.in"/></div><div><label className="field-label">Contact phone</label><input className="form-control" defaultValue="+91 427 000 0000"/></div><div className="wide"><label className="field-label">Campus address</label><input className="form-control" defaultValue="Shreenivasa Engineering College, Salem, Tamil Nadu, India"/></div></div></div><div className="settings-section"><h3>Transport preferences</h3><p>Default operational preferences.</p>{[["Live GPS tracking","Enable live vehicle location updates"],["Parent arrival notifications","Notify parents when buses approach"],["Automatic attendance","Record boarding events from RFID"],["Maintenance reminders","Alert when service is due"]].map((s,i)=><div className="toggle-row" key={s[0]}><div><b>{s[0]}</b><small>{s[1]}</small></div><label className="switch"><input type="checkbox" defaultChecked={i!==3}/><span/></label></div>)}</div><div className="settings-section"><h3>System status</h3><div className="system-status"><span><CircleCheck size={16}/> GPS tracking service</span><Status value="Active"/></div><div className="system-status"><span><CircleCheck size={16}/> Notification service</span><Status value="Active"/></div><div className="system-status"><span><CircleCheck size={16}/> Database connection</span><Status value="Active"/></div></div></section></div></>;

  const content = () => {
    switch(active) {
      case "Dashboard": return renderDashboard();
      case "Live Tracking": return renderTracking();
      case "Buses": return renderBuses();
      case "Students": return renderStudents();
      case "Drivers": return renderDrivers();
      case "Routes": return renderRoutes();
      case "Attendance": return renderAttendance();
      case "Notifications": return renderNotifications();
      case "Reports": return renderReports();
      case "Settings": return renderSettings();
      default: return renderDashboard();
    }
  };

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen?"sidebar-open":""}`}>
      <div className="brand"><div className="brand-mark"><BusFront size={23}/></div><div><strong>SEC <span>TRANSPORT</span></strong><small>TRANSPORT OPERATIONS</small></div><button className="close-sidebar" onClick={()=>setSidebarOpen(false)}><X size={18}/></button></div>
      <div className="workspace"><div className="workspace-logo"><Building2 size={18}/></div><div><b>Shreenivasa Engineering</b><small>College · Salem</small></div><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav-list">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`nav-item ${active === item.label ? "active" : ""}`}
              onClick={() => {
                setActive(item.label);
                setSidebarOpen(false);
                setSearch("");
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.count && <span className="nav-count">{item.count}</span>}
              {active === item.label && <span className="nav-active-indicator" />}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-bottom"><div className="system-pill"><span className="live-dot"/><div><b>All systems operational</b><small>Updated just now</small></div></div><div className="sidebar-help"><div className="help-icon"><CircleHelp size={17}/></div><div><b>Need help?</b><small>Visit support center</small></div><ArrowUpRight size={14}/></div><div className="profile"><div className="profile-avatar">TA</div><div className="profile-info"><b>Transport Admin</b><small>Administrator</small></div><button className="icon-btn" onClick={()=>notify("Profile menu opened")}><MoreHorizontal size={17}/></button></div></div>
    </aside>
    {sidebarOpen&&<div className="sidebar-backdrop" onClick={()=>setSidebarOpen(false)}/>}
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="menu-btn" onClick={()=>setSidebarOpen(true)}><Menu size={20}/></button><div className="breadcrumb"><span>SEC Transport</span><span className="crumb-slash">/</span><b>{active}</b></div></div><div className="topbar-right"><div className="global-search"><Search size={15}/><input placeholder="Search anything..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></div><button className="top-icon" onClick={()=>setActive("Notifications")}><Bell size={18}/><i/></button><div className="top-divider"/><div className="top-profile"><div className="profile-avatar">TA</div><div><b>Transport Admin</b><small>SEC · Admin</small></div><ChevronDown size={14}/></div></div></header><div className="page-container">{content()}<footer className="page-footer"><span>© 2026 SEC TRANSPORT <span className="footer-dot">·</span> Transportation Operations</span><span><span className="live-dot"/> All systems operational <span className="footer-dot">·</span> v1.0.0</span></footer></div></main>
    {toast&&<div className="toast"><CircleCheck size={17}/>{toast}</div>}
    {modal&&<div className="modal-backdrop" onClick={()=>setModal("")}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h3>{modal}</h3><p>Enter the details below to continue.</p></div><button className="icon-btn" onClick={()=>setModal("")}><X size={18}/></button></div><label className="field-label">Name / Title</label><input className="form-control" placeholder="Enter name or title"/><label className="field-label">Description</label><textarea className="form-control textarea" placeholder="Add relevant details..."/><div className="modal-actions"><button className="secondary-btn" onClick={()=>setModal("")}>Cancel</button><button className="primary-btn" onClick={()=>{setModal("");notify(`${modal} created (demo)`);}}>Create <Check size={15}/></button></div></div></div>}
  </div>;
}