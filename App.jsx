import { useState, useEffect, useRef, useCallback } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:        "#080810",
  bgCard:    "#0f0f1a",
  bgInput:   "#16162a",
  border:    "rgba(99,102,241,0.15)",
  accent:    "#6366f1",
  accentGlow:"rgba(99,102,241,0.4)",
  accentSoft:"rgba(99,102,241,0.12)",
  gold:      "#f59e0b",
  goldSoft:  "rgba(245,158,11,0.15)",
  green:     "#10b981",
  red:       "#ef4444",
  text:      "#f1f5f9",
  textMid:   "#94a3b8",
  textDim:   "#475569",
  radius:    "16px",
  radiusSm:  "10px",
};

// ─── OWNER / ADMIN ────────────────────────────────────────────────────────────
// بيانات حساب المالك — غيّر USERNAME/PASSWORD حسب رغبتك
const OWNER_CREDENTIALS = {
  email:    "admin@it-app.com",
  password: "ITowner2025",
};

const OWNER_PROFILE = {
  id:       "OWNER",
  name:     "I T",                          // اسم المالك
  email:    OWNER_CREDENTIALS.email,
  avatar:   null,
  color:    "#f59e0b",
  gender:   "male",
  xp:       10000,
  level:    100,
  isOwner:  true,
  isAdmin:  true,
  badges:   ["👑","💎","🔥","⚡","🌟","🎖️","🏆","🎤","💬","🛡️"],
  title:    "المالك والمؤسس",
  verified: true,
};

// ─── XP / LEVEL ──────────────────────────────────────────────────────────────
const calcLevel = (xp)  => Math.min(100, Math.floor(xp / 100));
const xpInLevel = (xp)  => xp % 100;

const LEVEL_TITLES = {
  0:"مبتدئ", 5:"متحمس", 10:"نشيط", 20:"محترف", 30:"خبير",
  40:"نجم", 50:"أسطورة", 60:"ماسي", 70:"ملكي", 80:"إمبراطور",
  90:"خارق", 100:"المالك 👑",
};
const getLevelTitle = (lvl) => {
  const keys = Object.keys(LEVEL_TITLES).map(Number).sort((a,b)=>b-a);
  for(const k of keys) if(lvl >= k) return LEVEL_TITLES[k];
  return "مبتدئ";
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const OFFICIAL_ROOM = {
  id:"official", name:"الغرفة الرسمية", isOfficial:true,
  desc:"الغرفة العامة للجميع — تحدث بحرية",
  };

const INIT_MSGS = [];

const DEMO_MEMBERS = [];

const fmtTime = () => {
  const n = new Date();
  return `${n.getHours()}:${String(n.getMinutes()).padStart(2,"0")}`;
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#080810;font-family:'IBM Plex Sans Arabic',sans-serif;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:4px;}
  input,textarea,button{font-family:inherit;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(245,158,11,.4)}50%{box-shadow:0 0 28px rgba(245,158,11,.8),0 0 60px rgba(245,158,11,.3)}}
  @keyframes lvlUp{0%{transform:scale(.8) translateY(20px);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1) translateY(0);opacity:1}}
  @keyframes ownerPulse{0%,100%{text-shadow:0 0 10px rgba(245,158,11,.6)}50%{text-shadow:0 0 30px rgba(245,158,11,1),0 0 60px rgba(245,158,11,.4)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════
const AvatarCircle = ({ name="?", color, size=38, img=null, isOwner=false, style={} }) => (
  <div style={{
    width:size, height:size, borderRadius:"50%",
    background: img?"transparent":(color||T.accent),
    display:"flex", alignItems:"center", justifyContent:"center",
    color:"#fff", fontWeight:800, fontSize:size*0.36,
    border: isOwner ? `2.5px solid #f59e0b` : `2px solid ${(color||T.accent)}55`,
    flexShrink:0, overflow:"hidden",
    animation: isOwner ? "glow 2.5s infinite" : "none",
    ...style,
  }}>
    {img ? <img src={img} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (name||"?")[0]}
  </div>
);

const LevelBadge = ({ level, isOwner=false }) => (
  <span style={{
    background: isOwner
      ? "linear-gradient(90deg,#f59e0b,#ef4444,#f59e0b)"
      : T.accentSoft,
    backgroundSize: isOwner ? "200% auto" : undefined,
    animation: isOwner ? "shimmer 2s linear infinite" : undefined,
    WebkitBackgroundClip: isOwner ? undefined : undefined,
    color: isOwner ? "#fff" : T.accent,
    fontSize: isOwner ? 11 : 9,
    fontWeight: 800,
    padding: isOwner ? "3px 10px" : "2px 7px",
    borderRadius: 8,
    border: isOwner ? `1px solid rgba(245,158,11,0.5)` : `1px solid ${T.accent}33`,
    letterSpacing: 0.5,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    boxShadow: isOwner ? "0 0 12px rgba(245,158,11,0.4)" : "none",
  }}>
    {isOwner ? "👑 المستوى 100 — MAX" : `Lv.${level}`}
  </span>
);

const OwnerCrown = () => (
  <div style={{
    fontSize:11,fontWeight:800,
    background:"linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)",
    backgroundSize:"200% auto",
    animation:"shimmer 2s linear infinite",
    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
    letterSpacing:0.5,
  }}>👑 المالك</div>
);

const Input = ({placeholder,value,onChange,type="text",multiline=false}) => {
  const s = {
    width:"100%",padding:"13px 16px",borderRadius:T.radius,
    border:`1px solid ${T.border}`,background:T.bgInput,
    color:T.text,fontSize:14,outline:"none",direction:"rtl",resize:"none",
  };
  return multiline
    ? <textarea style={{...s,minHeight:60}} placeholder={placeholder} value={value} onChange={onChange}/>
    : <input style={s} type={type} placeholder={placeholder} value={value} onChange={onChange}/>;
};

const Btn = ({children,primary,danger,ghost,onClick,small=false,style={}}) => (
  <button onClick={onClick} style={{
    width:small?undefined:"100%",
    padding:small?"7px 14px":"13px 20px",
    borderRadius:small?20:T.radius,
    border: danger?`1px solid ${T.red}44`:primary?"none":`1px solid ${T.border}`,
    background: danger?"rgba(239,68,68,.1)":primary?`linear-gradient(135deg,${T.accent},#8b5cf6)`:ghost?"transparent":T.bgCard,
    color: danger?T.red:primary?"#fff":ghost?T.textMid:T.text,
    fontWeight:700,fontSize:small?12:14,cursor:"pointer",
    display:"flex",alignItems:"center",justifyContent:"center",gap:8,
    transition:"opacity .15s,transform .1s",
    ...style,
  }} onMouseDown={e=>e.currentTarget.style.transform="scale(.97)"}
     onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
    {children}
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [mode,   setMode]   = useState("main");
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [pass,   setPass]   = useState("");
  const [gender, setGender] = useState("unset");
  const [err,    setErr]    = useState("");

  // ── مركزي: تحقق من المالك أولاً دائماً ──
  const checkOwner = (e, p) =>
    e.trim().toLowerCase() === OWNER_CREDENTIALS.email.toLowerCase() &&
    p === OWNER_CREDENTIALS.password;

  const handleSubmit = () => {
    setErr("");
    // المالك أولاً — بغض النظر عن الاسم
    if(checkOwner(email, pass)) return onLogin(OWNER_PROFILE);
    if(!name.trim())  return setErr("أدخل الاسم");
    if(!email.trim()) return setErr("أدخل البريد الإلكتروني");
    if(!pass.trim())  return setErr("أدخل كلمة المرور");
    onLogin({
      id:"u_"+Date.now(), name:name.trim(), email:email.trim(),
      avatar:null, color:T.accent, gender, xp:0, level:0,
      isOwner:false, isAdmin:false, badges:[], title:"عضو",
    });
  };

  const handleSignin = () => {
    setErr("");
    // المالك أولاً
    if(checkOwner(email, pass)) return onLogin(OWNER_PROFILE);
    if(!email.trim() || !pass.trim()) return setErr("أدخل بيانات الدخول");
    onLogin({
      id:"u_"+Date.now(),
      name: name.trim() || email.split("@")[0],
      email: email.trim(),
      avatar:null, color:T.accent, gender:"unset", xp:0, level:0,
      isOwner:false, isAdmin:false, badges:[], title:"عضو",
    });
  };

  return (
    <div style={{
      minHeight:"100vh",background:T.bg,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"32px 24px",direction:"rtl",
      fontFamily:"'IBM Plex Sans Arabic',sans-serif",
      position:"relative",overflow:"hidden",
    }}>
      {/* Glow orbs */}
      <div style={{position:"absolute",top:-100,right:-80,width:320,height:320,borderRadius:"50%",background:"rgba(99,102,241,0.07)",filter:"blur(80px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-80,left:-60,width:240,height:240,borderRadius:"50%",background:"rgba(245,158,11,0.05)",filter:"blur(60px)",pointerEvents:"none"}}/>

      <div style={{width:"100%",maxWidth:420,display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .5s ease",zIndex:2}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{
            fontSize:72,fontWeight:900,letterSpacing:10,lineHeight:1,
            background:"linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            animation:"float 3s ease-in-out infinite",display:"inline-block",
          }}>IT</div>
          <div style={{color:T.textDim,fontSize:13,marginTop:10,letterSpacing:0.5}}>
            Chat & Voice — تحدث، تواصل، استمتع
          </div>
        </div>

        {mode==="main" && <>
          <Btn primary onClick={()=>setMode("signup")}>إنشاء حساب جديد</Btn>
          <Btn onClick={()=>setMode("signin")}>تسجيل الدخول</Btn>
          <div style={{display:"flex",alignItems:"center",gap:10,color:T.textDim,fontSize:12}}>
            <div style={{flex:1,height:1,background:T.border}}/>أو<div style={{flex:1,height:1,background:T.border}}/>
          </div>
          <Btn ghost onClick={()=>onLogin({id:"guest_"+Date.now(),name:"زائر",email:"",avatar:null,color:T.textMid,gender:"unset",xp:0,level:0,isOwner:false,isAdmin:false,badges:[],title:"زائر",isGuest:true})}>
            👤 دخول كزائر
          </Btn>
        </>}

        {mode==="signup" && <>
          <div style={{color:T.text,fontWeight:700,textAlign:"center",marginBottom:4}}>إنشاء حساب جديد</div>
          <Input placeholder="الاسم (Username)" value={name} onChange={e=>{setName(e.target.value);setErr("")}}/>
          <Input placeholder="البريد الإلكتروني" type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr("")}}/>
          <Input placeholder="كلمة المرور" type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr("")}}/>
          <div style={{display:"flex",gap:8}}>
            {[["male","♂ ذكر"],["female","♀ أنثى"],["unset","🌐"]].map(([v,l])=>(
              <button key={v} onClick={()=>setGender(v)} style={{flex:1,padding:"10px 4px",borderRadius:T.radiusSm,border:`1px solid ${gender===v?T.accent:T.border}`,background:gender===v?T.accentSoft:"transparent",color:gender===v?T.accent:T.textMid,fontSize:13,fontWeight:600,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          {err&&<div style={{color:T.red,fontSize:12,textAlign:"center"}}>{err}</div>}
          <Btn primary onClick={handleSubmit}>إنشاء الحساب ✓</Btn>
          <button onClick={()=>setMode("main")} style={{background:"none",border:"none",color:T.textDim,fontSize:13,cursor:"pointer",textAlign:"center"}}>← رجوع</button>
        </>}

        {mode==="signin" && <>
          <div style={{color:T.text,fontWeight:700,textAlign:"center",marginBottom:4}}>تسجيل الدخول</div>
          <Input placeholder="الاسم (اختياري)" value={name} onChange={e=>{setName(e.target.value);setErr("")}}/>
          <Input placeholder="البريد الإلكتروني" type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr("")}}/>
          <Input placeholder="كلمة المرور" type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr("")}}/>
          {err&&<div style={{color:T.red,fontSize:12,textAlign:"center",padding:"6px 10px",background:"rgba(239,68,68,0.1)",borderRadius:8,border:`1px solid ${T.red}33`}}>{err}</div>}
          <Btn primary onClick={handleSignin}>دخول →</Btn>
          <button onClick={()=>{setMode("main");setErr("");}} style={{background:"none",border:"none",color:T.textDim,fontSize:13,cursor:"pointer",textAlign:"center"}}>← رجوع</button>
        </>}

        <p style={{color:T.textDim,fontSize:10,textAlign:"center",marginTop:4}}>
          بالمتابعة، أنت توافق على سياسة الخصوصية وشروط الخدمة
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL (only for owner)
// ═══════════════════════════════════════════════════════════════════════════════
function AdminPanel({ members, setMembers, myRooms, setMyRooms, onClose }) {
  const [tab, setTab] = useState("users");
  const [announce, setAnnounce] = useState("");
  const [sentMsg, setSentMsg] = useState(false);
  const [banList, setBanList] = useState([]);

  const toggleMute = (id) => setMembers(m=>m.map(u=>u.id===id?{...u,isMuted:!u.isMuted}:u));
  const toggleAdmin = (id) => setMembers(m=>m.map(u=>u.id===id?{...u,isAdmin:!u.isAdmin}:u));
  const banUser = (id) => {
    setBanList(b=>[...b,id]);
    setMembers(m=>m.filter(u=>u.id!==id));
  };
  const deleteRoom = (id) => setMyRooms(r=>r.filter(x=>x.id!==id));

  const statCards = [
    {label:"إجمالي الأعضاء", val:members.length+1, icon:"👥", color:T.accent},
    {label:"متصلون الآن",     val:members.filter(m=>m.status!=="offline").length, icon:"🟢", color:T.green},
    {label:"غرف نشطة",        val:myRooms.length+1, icon:"🏠", color:T.gold},
    {label:"محظورون",          val:banList.length,   icon:"🔴", color:T.red},
  ];

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:200,direction:"rtl",fontFamily:"'IBM Plex Sans Arabic',sans-serif",display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,rgba(245,158,11,0.15),rgba(239,68,68,0.08))",borderBottom:`1px solid ${T.gold}44`,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:T.gold,fontSize:22,cursor:"pointer"}}>‹</button>
        <div style={{fontSize:20,fontWeight:900,background:"linear-gradient(90deg,#f59e0b,#fbbf24)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          🛡️ لوحة التحكم
        </div>
        <span style={{marginRight:"auto",background:"rgba(245,158,11,.15)",color:T.gold,fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:8,border:`1px solid ${T.gold}44`}}>OWNER ONLY</span>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,background:T.bgCard,flexShrink:0}}>
        {[["users","👥 الأعضاء"],["rooms","🏠 الغرف"],["announce","📢 إعلان"],["stats","📊 إحصاء"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            flex:1,padding:"12px 4px",border:"none",
            background:"transparent",cursor:"pointer",
            color:tab===k?T.gold:T.textDim,
            fontWeight:tab===k?700:400,fontSize:11,
            borderBottom:tab===k?`2px solid ${T.gold}`:"2px solid transparent",
          }}>{l}</button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px"}}>

        {/* USERS */}
        {tab==="users" && members.map(m=>(
          <div key={m.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
            <div style={{position:"relative"}}>
              <AvatarCircle name={m.name} color={m.color} size={42}/>
              {m.isAdmin&&<span style={{position:"absolute",bottom:-3,right:-3,fontSize:12}}>🛡️</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{color:T.text,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                {m.name}
                {m.isAdmin&&<span style={{background:"rgba(99,102,241,.15)",color:T.accent,fontSize:9,padding:"1px 5px",borderRadius:5}}>أدمن</span>}
                {m.isMuted&&<span style={{background:"rgba(239,68,68,.15)",color:T.red,fontSize:9,padding:"1px 5px",borderRadius:5}}>مكتوم</span>}
              </div>
              <div style={{color:T.textDim,fontSize:11,marginTop:2}}>Lv.{m.level} · {m.status==="online"?"متصل":m.status==="in-room"?"في غرفة":"غير متصل"}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>toggleMute(m.id)} style={{padding:"5px 9px",borderRadius:8,border:`1px solid ${m.isMuted?T.green:T.red}44`,background:m.isMuted?"rgba(16,185,129,.1)":"rgba(239,68,68,.1)",color:m.isMuted?T.green:T.red,fontSize:11,cursor:"pointer",fontWeight:600}}>
                {m.isMuted?"فك":"كتم"}
              </button>
              <button onClick={()=>toggleAdmin(m.id)} style={{padding:"5px 9px",borderRadius:8,border:`1px solid ${T.accent}44`,background:T.accentSoft,color:T.accent,fontSize:11,cursor:"pointer",fontWeight:600}}>
                {m.isAdmin?"نزع":"ترقية"}
              </button>
              <button onClick={()=>banUser(m.id)} style={{padding:"5px 9px",borderRadius:8,border:`1px solid ${T.red}44`,background:"rgba(239,68,68,.1)",color:T.red,fontSize:11,cursor:"pointer",fontWeight:600}}>
                حظر
              </button>
            </div>
          </div>
        ))}

        {/* ROOMS */}
        {tab==="rooms" && (
          <>
            <div style={{background:T.bgCard,border:`1px solid ${T.gold}33`,borderRadius:T.radius,padding:"12px 14px",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:24}}>👑</span>
                <div>
                  <div style={{color:T.gold,fontWeight:700}}>الغرفة الرسمية</div>
                  <div style={{color:T.textDim,fontSize:11}}>1 عضو · 1 متصل · لا يمكن حذفها</div>
                </div>
              </div>
            </div>
            {myRooms.length===0 && <div style={{color:T.textDim,fontSize:13,textAlign:"center",padding:20}}>لا توجد غرف خاصة</div>}
            {myRooms.map(r=>(
              <div key={r.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:26}}>{r.icon||"🏠"}</span>
                <div style={{flex:1}}>
                  <div style={{color:T.text,fontWeight:700}}>{r.name}</div>
                  <div style={{color:T.textDim,fontSize:11}}>{r.desc}</div>
                </div>
                <button onClick={()=>deleteRoom(r.id)} style={{padding:"6px 12px",borderRadius:10,border:`1px solid ${T.red}44`,background:"rgba(239,68,68,.1)",color:T.red,fontSize:12,cursor:"pointer",fontWeight:600}}>
                  🗑️ حذف
                </button>
              </div>
            ))}
          </>
        )}

        {/* ANNOUNCE */}
        {tab==="announce" && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{color:T.textMid,fontSize:13}}>إرسال إعلان للجميع داخل التطبيق</div>
            <textarea
              style={{width:"100%",minHeight:120,padding:"13px 16px",borderRadius:T.radius,border:`1px solid ${T.gold}44`,background:T.bgInput,color:T.text,fontSize:14,outline:"none",direction:"rtl",resize:"none",boxSizing:"border-box"}}
              placeholder="اكتب نص الإعلان هنا..."
              value={announce} onChange={e=>setAnnounce(e.target.value)}
            />
            {sentMsg && <div style={{background:"rgba(16,185,129,.1)",border:`1px solid ${T.green}44`,borderRadius:T.radiusSm,padding:"10px 14px",color:T.green,fontSize:13,fontWeight:600}}>✓ تم إرسال الإعلان بنجاح!</div>}
            <Btn primary onClick={()=>{if(announce.trim()){setSentMsg(true);setAnnounce("");setTimeout(()=>setSentMsg(false),3000);}}}>
              📢 إرسال الإعلان
            </Btn>
          </div>
        )}

        {/* STATS */}
        {tab==="stats" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {statCards.map(s=>(
                <div key={s.label} style={{background:T.bgCard,border:`1px solid ${s.color}22`,borderRadius:T.radius,padding:"16px 14px",textAlign:"center"}}>
                  <div style={{fontSize:28,marginBottom:6}}>{s.icon}</div>
                  <div style={{color:s.color,fontSize:28,fontWeight:900}}>{s.val}</div>
                  <div style={{color:T.textDim,fontSize:11,marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"16px"}}>
              <div style={{color:T.text,fontWeight:700,marginBottom:12}}>إحصاء الأعضاء</div>
              {[["متصل الآن",members.filter(m=>m.status!=="offline").length,T.green],["في غرفة",members.filter(m=>m.status==="in-room").length,T.gold],["أدمنز",members.filter(m=>m.isAdmin).length,T.accent],["مكتومون",members.filter(m=>m.isMuted).length,T.red]].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <span style={{color:T.textMid,fontSize:13}}>{l}</span>
                  <span style={{color:c,fontWeight:700,fontSize:15}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT ROOM
// ═══════════════════════════════════════════════════════════════════════════════
function ChatRoom({ room, user, onBack, onXP, members }) {
  const [msgs, setMsgs] = useState([
    {id:1,uid:"bot",name:"IT Bot",color:T.accent,
     text:room.isOfficial
       ? `مرحباً ${user.name}! أهلاً بك في الغرفة الرسمية 🎉`
       : `مرحباً بك في "${room.name}" 🎉`,
     time:fmtTime(),isBot:true},
  ]);
  const [input,  setInput]  = useState("");
  const [onMic,  setOnMic]  = useState(false);
  const [muted,  setMuted]  = useState(false);
  const [seats,  setSeats]  = useState([
    {id:1,user:null,muted:false},
    {id:2,user:null,muted:false},
    {id:3,user:null,muted:false},
    {id:4,user:null,muted:false},
    {id:5,user:null,muted:false},
  ]);
  const [roomMembers, setRoomMembers] = useState(members||DEMO_MEMBERS);
  const bottomRef = useRef(null);
  const msgXPRef  = useRef(0);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);
  useEffect(()=>{
    if(!onMic) return;
    const t=setInterval(()=>onXP(2),60000);
    return()=>clearInterval(t);
  },[onMic]);

  const send = () => {
    if(!input.trim()) return;
    setMsgs(p=>[...p,{
      id:Date.now(),uid:user.id,name:user.name,color:user.color,
      text:input.trim(),time:fmtTime(),isMe:true,
      isOwner:user.isOwner,isAdmin:user.isAdmin,
    }]);
    setInput("");
    if(msgXPRef.current<20){ onXP(1); msgXPRef.current++; }
  };

  const takeMic = () => {
    const empty = seats.findIndex(s=>!s.user);
    if(empty===-1) return;
    setSeats(p=>{const n=[...p];n[empty]={...n[empty],user:{name:user.name,color:user.color,isMe:true,isOwner:user.isOwner}};return n;});
    setOnMic(true);
  };
  const leaveMic = () => {
    setSeats(p=>p.map(s=>s.user?.isMe?{...s,user:null}:s));
    setOnMic(false);
  };

  const adminMute = (seatId) => {
    if(!user.isOwner&&!user.isAdmin) return;
    setSeats(p=>p.map(s=>s.id===seatId?{...s,muted:!s.muted}:s));
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg,direction:"rtl",fontFamily:"'IBM Plex Sans Arabic',sans-serif",maxWidth:480,margin:"0 auto"}}>
      {/* Header */}
      <div style={{
        background:T.bgCard,
        borderBottom:`1px solid ${user.isOwner?T.gold+"55":T.border}`,
        padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0,
      }}>
        <button onClick={onBack} style={{background:"none",border:"none",color:user.isOwner?T.gold:T.accent,fontSize:22,cursor:"pointer",lineHeight:1}}>‹</button>
        <div style={{width:40,height:40,borderRadius:12,background:T.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`1px solid ${T.border}`}}>
          {room.isOfficial?"👑":"🏠"}
        </div>
        <div style={{flex:1}}>
          <div style={{color:T.text,fontWeight:700,fontSize:15}}>{room.name}</div>
          <div style={{color:T.textDim,fontSize:11,display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:T.green,display:"inline-block"}}/>
            1 متصل
          </div>
        </div>
        {room.isOfficial&&<span style={{background:T.accentSoft,color:T.accent,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:8,border:`1px solid ${T.accent}33`}}>رسمية</span>}
      </div>

      {/* Mic seats */}
      <div style={{background:T.bgCard,borderBottom:`1px solid ${T.border}`,padding:"14px 16px",display:"flex",gap:10,justifyContent:"center",flexShrink:0}}>
        {seats.map((seat,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <div
              onClick={()=>{ if(!seat.user&&!onMic) takeMic(); else if(seat.user?.isMe&&!user.isOwner) leaveMic(); else if(seat.user&&(user.isOwner||user.isAdmin)&&!seat.user?.isMe) adminMute(seat.id); }}
              style={{
                width:54,height:54,borderRadius:"50%",
                background:seat.user?`${seat.user.color}22`:T.bgInput,
                border:seat.user?.isOwner?`2.5px solid ${T.gold}`:seat.user?.isMe?`2px solid ${T.accent}`:seat.user?`2px solid ${seat.user.color}55`:`1.5px dashed ${T.border}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:seat.user?20:22,cursor:"pointer",
                animation:seat.user?.isOwner?"glow 2s infinite":"none",
                color:seat.user?"#fff":T.textDim,fontWeight:800,
                transition:"all .2s",position:"relative",
              }}>
              {seat.user ? seat.user.name[0] : "🎤"}
              {seat.user?.isOwner&&<span style={{position:"absolute",top:-8,right:-8,fontSize:14}}>👑</span>}
              {seat.muted&&seat.user&&<span style={{position:"absolute",bottom:-4,right:-4,fontSize:11,background:T.bg,borderRadius:"50%"}}>🔇</span>}
            </div>
            <span style={{color:seat.user?.isOwner?T.gold:seat.user?.color||T.textDim,fontSize:9,maxWidth:50,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {seat.user?seat.user.name.split(" ")[0]:`${i+1}`}
            </span>
          </div>
        ))}
      </div>

      {/* Mic controls */}
      {onMic&&(
        <div style={{background:"rgba(99,102,241,0.06)",borderBottom:`1px solid ${T.border}`,padding:"10px 16px",display:"flex",gap:8,justifyContent:"center",flexShrink:0}}>
          <button onClick={()=>setMuted(m=>!m)} style={{padding:"8px 18px",borderRadius:20,border:`1px solid ${muted?T.red:T.green}`,background:muted?"rgba(239,68,68,.1)":"rgba(16,185,129,.1)",color:muted?T.red:T.green,fontWeight:700,fontSize:13,cursor:"pointer"}}>
            {muted?"🔇 مكتوم":"🎤 مفعّل"}
          </button>
          <button onClick={leaveMic} style={{padding:"8px 14px",borderRadius:20,border:`1px solid ${T.red}44`,background:"rgba(239,68,68,.1)",color:T.red,fontWeight:700,fontSize:13,cursor:"pointer"}}>نزول من المايك ↓</button>
        </div>
      )}

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map(msg=>(
          <div key={msg.id} style={{maxWidth:"80%",alignSelf:msg.isMe?"flex-start":"flex-end",display:"flex",flexDirection:"column",gap:4,animation:"fadeUp .2s ease"}}>
            {!msg.isMe&&(
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <AvatarCircle name={msg.name} color={msg.color} size={22} isOwner={msg.isOwner}/>
                <span style={{color:msg.isOwner?T.gold:msg.color,fontSize:11,fontWeight:700}}>{msg.name}</span>
                {msg.isOwner&&<span style={{fontSize:9,background:"rgba(245,158,11,.15)",color:T.gold,padding:"1px 5px",borderRadius:5,fontWeight:800}}>👑 المالك</span>}
                {msg.isAdmin&&!msg.isOwner&&<span style={{fontSize:9,background:T.accentSoft,color:T.accent,padding:"1px 5px",borderRadius:5}}>🛡️ أدمن</span>}
                {msg.isBot&&<span style={{fontSize:9,background:T.accentSoft,color:T.accent,padding:"1px 5px",borderRadius:5}}>BOT</span>}
              </div>
            )}
            <div style={{
              background: msg.isMe
                ? user.isOwner
                  ? "linear-gradient(135deg,#f59e0b,#ef4444)"
                  : `linear-gradient(135deg,${T.accent},#8b5cf6)`
                : msg.isOwner
                  ? "linear-gradient(135deg,rgba(245,158,11,.15),rgba(239,68,68,.08))"
                  : "rgba(255,255,255,0.05)",
              color:msg.isMe?"#fff":msg.isOwner?T.gold:T.text,
              borderRadius:msg.isMe?"16px 4px 16px 16px":"4px 16px 16px 16px",
              padding:"10px 14px",fontSize:14,lineHeight:1.55,
              border:msg.isMe?"none":msg.isOwner?`1px solid ${T.gold}33`:`1px solid ${T.border}`,
              boxShadow:msg.isOwner&&!msg.isMe?`0 0 12px rgba(245,158,11,.1)`:undefined,
            }}>{msg.text}</div>
            <span style={{color:T.textDim,fontSize:10,alignSelf:msg.isMe?"flex-start":"flex-end"}}>{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{background:T.bgCard,borderTop:`1px solid ${user.isOwner?T.gold+"33":T.border}`,padding:"10px 14px",display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
        <span style={{fontSize:22,cursor:"pointer"}}>😊</span>
        <input
          style={{flex:1,background:T.bgInput,border:`1px solid ${T.border}`,borderRadius:24,padding:"10px 16px",color:T.text,fontSize:14,outline:"none",direction:"rtl"}}
          placeholder={user.isOwner?"رسالة المالك 👑...":"اكتب رسالة..."}
          value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&send()}
        />
        <button onClick={send} style={{
          width:44,height:44,borderRadius:"50%",border:"none",
          background:user.isOwner?"linear-gradient(135deg,#f59e0b,#ef4444)":`linear-gradient(135deg,${T.accent},#8b5cf6)`,
          color:"#fff",fontSize:18,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",
          animation:user.isOwner?"glow 2s infinite":"none",
        }}>➤</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════════
function CreateRoomModal({ onClose, onCreate }) {
  const [name,setName]=useState(""); const [desc,setDesc]=useState(""); const [icon,setIcon]=useState("🏠");
  const icons=["🏠","🎵","💻","📚","🎮","✈️","🌍","🎨","🔥","⚡","🌙","🎤","🏋️","🍔","🎬","🌺"];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100,backdropFilter:"blur(8px)"}}>
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:"22px 22px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:480,display:"flex",flexDirection:"column",gap:14,direction:"rtl",fontFamily:"'IBM Plex Sans Arabic',sans-serif",animation:"fadeUp .3s ease"}}>
        <div style={{color:T.text,fontSize:18,fontWeight:800,textAlign:"center"}}>✨ إنشاء غرفة جديدة</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {icons.map(ic=>(
            <button key={ic} onClick={()=>setIcon(ic)} style={{width:42,height:42,borderRadius:12,fontSize:20,cursor:"pointer",border:`1px solid ${icon===ic?T.accent:T.border}`,background:icon===ic?T.accentSoft:T.bgInput}}>{ic}</button>
          ))}
        </div>
        <Input placeholder="اسم الغرفة *" value={name} onChange={e=>setName(e.target.value)}/>
        <Input placeholder="وصف الغرفة (اختياري)" value={desc} onChange={e=>setDesc(e.target.value)} multiline/>
        <Btn primary onClick={()=>{if(!name.trim())return;onCreate({id:Date.now(),name:name.trim(),desc:desc.trim()||"غرفة خاصة",icon,isOfficial:false,members:1,online:1});onClose();}}>إنشاء الغرفة 🚀</Btn>
        <Btn ghost onClick={onClose}>إلغاء</Btn>
      </div>
    </div>
  );
}

function EditProfileModal({ user, onClose, onSave }) {
  const [name,setName]=useState(user.name);
  const [gender,setGender]=useState(user.gender||"unset");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100,backdropFilter:"blur(8px)"}}>
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:"22px 22px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:480,display:"flex",flexDirection:"column",gap:14,direction:"rtl",fontFamily:"'IBM Plex Sans Arabic',sans-serif",animation:"fadeUp .3s ease"}}>
        <div style={{color:T.text,fontSize:18,fontWeight:800,textAlign:"center"}}>✏️ تعديل الملف الشخصي</div>
        <Input placeholder="الاسم" value={name} onChange={e=>setName(e.target.value)}/>
        {!user.isOwner && (
          <div style={{display:"flex",gap:8}}>
            {[["male","♂ ذكر"],["female","♀ أنثى"],["unset","🌐 غير محدد"]].map(([v,l])=>(
              <button key={v} onClick={()=>setGender(v)} style={{flex:1,padding:"10px 4px",borderRadius:T.radiusSm,border:`1px solid ${gender===v?T.accent:T.border}`,background:gender===v?T.accentSoft:"transparent",color:gender===v?T.accent:T.textMid,fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
        )}
        <Btn primary onClick={()=>{onSave({name:name.trim()||user.name,gender});onClose();}}>حفظ</Btn>
        <Btn ghost onClick={onClose}>إلغاء</Btn>
      </div>
    </div>
  );
}

function LevelUpToast({ level, onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,3500);return()=>clearTimeout(t);},[]);
  return (
    <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg,${T.accent},#8b5cf6)`,color:"#fff",padding:"14px 28px",borderRadius:20,fontWeight:800,fontSize:16,zIndex:300,boxShadow:`0 8px 32px rgba(99,102,241,.5)`,animation:"lvlUp .5s ease",display:"flex",alignItems:"center",gap:10,fontFamily:"'IBM Plex Sans Arabic',sans-serif",whiteSpace:"nowrap"}}>
      ⬆️ مبروك! وصلت للمستوى {level}!
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  useEffect(()=>{
    if(document.getElementById("it-css")) return;
    const s=document.createElement("style");
    s.id="it-css"; s.textContent=GLOBAL_CSS;
    document.head.appendChild(s);
  },[]);

  const [user,        setUser]      = useState(null);
  const [currentRoom, setRoom]      = useState(null);
  const [showCreate,  setCreate]    = useState(false);
  const [showEdit,    setEdit]      = useState(false);
  const [showAdmin,   setAdmin]     = useState(false);
  const [myRooms,     setMyRooms]   = useState([]);
  const [members,     setMembers]   = useState(DEMO_MEMBERS);
  const [tab,         setTab]       = useState("home");
  const [lvlUpShow,   setLvlUp]     = useState(null);

  const addXP = useCallback((amount)=>{
    setUser(u=>{
      if(!u||u.isOwner) return u; // owner stays at max
      const newXP=u.xp+amount;
      const newLevel=calcLevel(newXP);
      if(newLevel>u.level) setLvlUp(newLevel);
      return {...u,xp:newXP,level:newLevel};
    });
  },[]);

  useEffect(()=>{ if(user&&!user.isOwner) addXP(10); },[!!user]);
  useEffect(()=>{
    if(!user||user.isOwner) return;
    const t=setInterval(()=>addXP(1),5*60*1000);
    return()=>clearInterval(t);
  },[!!user]);

  if(!user) return <LoginPage onLogin={setUser}/>;

  if(showAdmin&&user.isOwner) return (
    <AdminPanel members={members} setMembers={setMembers} myRooms={myRooms} setMyRooms={setMyRooms} onClose={()=>setAdmin(false)}/>
  );

  if(currentRoom) return (
    <>
      <ChatRoom room={currentRoom} user={user} onBack={()=>setRoom(null)} onXP={addXP} members={members}/>
      {lvlUpShow&&<LevelUpToast level={lvlUpShow} onDone={()=>setLvlUp(null)}/>}
    </>
  );

  const level  = user.isOwner ? 100 : calcLevel(user.xp);
  const xpPct  = user.isOwner ? 100 : xpInLevel(user.xp);
  const lvlTitle = getLevelTitle(level);

  const tabs = [
    {key:"home",   icon:"🏠",label:"الغرف"},
    {key:"friends",icon:"👥",label:"الأصدقاء"},
    {key:"profile",icon:"👤",label:"حسابي"},
  ];

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",background:T.bg,direction:"rtl",fontFamily:"'IBM Plex Sans Arabic',sans-serif",position:"relative"}}>

      {/* ── HEADER ── */}
      <div style={{
        background:T.bgCard,
        borderBottom:`1px solid ${user.isOwner?T.gold+"44":T.border}`,
        padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",
        flexShrink:0,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            fontSize:26,fontWeight:900,letterSpacing:4,
            background:user.isOwner?"linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)":"linear-gradient(90deg,#6366f1,#8b5cf6)",
            backgroundSize:user.isOwner?"200% auto":undefined,
            animation:user.isOwner?"shimmer 2s linear infinite":undefined,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          }}>IT</div>
          {user.isOwner&&<span style={{fontSize:11,color:T.gold,fontWeight:700,background:"rgba(245,158,11,.1)",padding:"2px 8px",borderRadius:6,border:`1px solid ${T.gold}33`,animation:"ownerPulse 2s infinite"}}>👑 OWNER</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {user.isOwner&&(
            <button onClick={()=>setAdmin(true)} style={{padding:"6px 12px",borderRadius:10,border:`1px solid ${T.gold}44`,background:"rgba(245,158,11,.1)",color:T.gold,fontWeight:700,fontSize:12,cursor:"pointer"}}>
              🛡️ لوحة التحكم
            </button>
          )}
          <div style={{textAlign:"center",cursor:"pointer"}}>
            <div style={{
              background: user.isOwner ? "linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)" : undefined,
              backgroundSize: user.isOwner ? "200% auto" : undefined,
              animation: user.isOwner ? "shimmer 2s linear infinite" : undefined,
              WebkitBackgroundClip: user.isOwner ? "text" : undefined,
              WebkitTextFillColor: user.isOwner ? "transparent" : undefined,
              color: user.isOwner ? undefined : T.accent,
              fontSize:11,fontWeight:800,
            }}>
              {user.isOwner ? "👑 Lv.100 MAX" : user.xp+" XP"}
            </div>
            <div style={{width:56,height:3,borderRadius:2,background:"rgba(255,255,255,0.07)",marginTop:2}}>
              <div style={{
                width:"100%",height:"100%",borderRadius:2,
                background:user.isOwner
                  ? "linear-gradient(90deg,#f59e0b,#ef4444,#f59e0b)"
                  : `linear-gradient(90deg,${T.accent},#8b5cf6)`,
                backgroundSize: user.isOwner ? "200% auto" : undefined,
                animation: user.isOwner ? "shimmer 1.5s linear infinite" : undefined,
                transition:"width .5s",
              }}/>
            </div>
          </div>
          <div style={{position:"relative"}} onClick={()=>setTab("profile")}>
            <AvatarCircle name={user.name} color={user.color} size={38} isOwner={user.isOwner} style={{cursor:"pointer"}}/>
            <div style={{
              position:"absolute",bottom:-5,right:-8,
              background:user.isOwner?"linear-gradient(90deg,#f59e0b,#ef4444,#f59e0b)":"linear-gradient(135deg,#6366f1,#8b5cf6)",
              backgroundSize:user.isOwner?"200% auto":undefined,
              animation:user.isOwner?"shimmer 1.8s linear infinite":undefined,
              color:"#fff",fontSize:user.isOwner?9:8,fontWeight:800,
              padding:user.isOwner?"2px 7px":"1px 5px",
              borderRadius:8,border:`1.5px solid ${T.bg}`,whiteSpace:"nowrap",
              boxShadow:user.isOwner?"0 0 10px rgba(245,158,11,0.6)":"none",
            }}>
              {user.isOwner ? "👑 MAX 100" : `Lv.${level}`}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:12}}>

        {/* HOME */}
        {tab==="home" && <>
          {/* Official room */}
          <div style={{color:T.textDim,fontSize:11,fontWeight:700,letterSpacing:1}}>الغرفة الرسمية</div>
          <div onClick={()=>setRoom(OFFICIAL_ROOM)} style={{background:`linear-gradient(135deg,${T.accentSoft},rgba(139,92,246,0.08))`,border:`1.5px solid ${T.accent}44`,borderRadius:T.radius,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",boxShadow:`0 4px 24px ${T.accentGlow}`}}>
            <div style={{width:54,height:54,borderRadius:14,background:T.accentSoft,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>👑</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <span style={{color:T.text,fontWeight:800,fontSize:16}}>الغرفة الرسمية</span>
                <span style={{background:T.accentSoft,color:T.accent,fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:6,border:`1px solid ${T.accent}33`}}>رسمية ✓</span>
              </div>
              <div style={{color:T.textDim,fontSize:12}}>الغرفة العامة للجميع — تحدث بحرية</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:T.green,display:"inline-block"}}/>
                <span style={{color:T.green,fontSize:11}}>1 متصل</span>
                <span style={{color:T.textDim,fontSize:11}}>· 1 عضو</span>
              </div>
            </div>
            <span style={{color:T.accent,fontSize:20}}>‹</span>
          </div>

          {/* My rooms */}
          <div style={{color:T.textDim,fontSize:11,fontWeight:700,letterSpacing:1,marginTop:4}}>غرفي الخاصة</div>
          <button onClick={()=>setCreate(true)} style={{background:"rgba(255,255,255,0.02)",border:`1.5px dashed ${T.border}`,borderRadius:T.radius,padding:"16px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,cursor:"pointer",color:T.textDim,fontWeight:700,fontSize:14}}>
            <span style={{fontSize:24,fontWeight:300,lineHeight:1}}>＋</span> أنشئ غرفتك الخاصة
          </button>
          {myRooms.length===0&&<div style={{color:T.textDim,fontSize:12,textAlign:"center",padding:"6px 0"}}>لا توجد غرف خاصة بعد</div>}
          {myRooms.map(r=>(
            <div key={r.id} onClick={()=>setRoom(r)} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
              <div style={{width:48,height:48,borderRadius:12,background:T.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{r.icon||"🏠"}</div>
              <div style={{flex:1}}>
                <div style={{color:T.text,fontWeight:700,fontSize:15}}>{r.name}</div>
                <div style={{color:T.textDim,fontSize:12}}>{r.desc}</div>
              </div>
              <span style={{color:T.textMid,fontSize:18}}>‹</span>
            </div>
          ))}
        </>}

        {/* FRIENDS */}
        {tab==="friends" && <>
          <div style={{color:T.textDim,fontSize:11,fontWeight:700,letterSpacing:1}}>{members.length}/200 صديق</div>
          {members.map(f=>{
            const sc={online:T.green,"in-room":T.gold,offline:T.textDim}[f.status];
            const sl={online:"متصل","in-room":"في غرفة",offline:"غير متصل"}[f.status];
            return (
              <div key={f.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{position:"relative"}}>
                  <AvatarCircle name={f.name} color={f.color} size={46}/>
                  {f.isAdmin&&<span style={{position:"absolute",bottom:-2,right:-2,fontSize:12}}>🛡️</span>}
                  <div style={{position:"absolute",bottom:0,left:0,width:11,height:11,borderRadius:"50%",background:sc,border:`2px solid ${T.bg}`}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{color:T.text,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:6}}>
                    {f.name}
                    {f.isAdmin&&<span style={{background:T.accentSoft,color:T.accent,fontSize:9,padding:"1px 5px",borderRadius:5}}>أدمن</span>}
                    {f.isMuted&&<span style={{background:"rgba(239,68,68,.15)",color:T.red,fontSize:9,padding:"1px 5px",borderRadius:5}}>مكتوم</span>}
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginTop:2}}>
                    <span style={{color:sc,fontSize:11}}>{sl}</span>
                    <span style={{color:T.textDim,fontSize:11}}>·</span>
                    <LevelBadge level={f.level}/>
                  </div>
                </div>
                <button style={{padding:"7px 12px",borderRadius:16,border:`1px solid ${T.border}`,background:T.bgInput,color:T.textMid,fontSize:12,cursor:"pointer"}}>💬</button>
              </div>
            );
          })}
          <Btn primary onClick={()=>{}}>+ إضافة أصدقاء</Btn>
        </>}

        {/* PROFILE */}
        {tab==="profile" && <>
          {/* Owner special card */}
          {user.isOwner ? (
            <div style={{background:"linear-gradient(135deg,rgba(245,158,11,.12),rgba(239,68,68,.08))",border:`1.5px solid ${T.gold}44`,borderRadius:20,padding:20,position:"relative",overflow:"hidden",boxShadow:`0 8px 40px rgba(245,158,11,.15)`}}>
              <div style={{position:"absolute",top:-30,right:-30,width:150,height:150,borderRadius:"50%",background:"rgba(245,158,11,.05)",filter:"blur(30px)"}}/>
              <div style={{display:"flex",alignItems:"center",gap:16,position:"relative"}}>
                <AvatarCircle name={user.name} color={user.color} size={80} isOwner style={{fontSize:32}}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{color:T.gold,fontWeight:900,fontSize:22,animation:"ownerPulse 2s infinite"}}>{user.name}</span>
                    <span style={{fontSize:18}}>👑</span>
                  </div>
                  <div style={{background:"linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)",backgroundSize:"200% auto",animation:"shimmer 2s linear infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontWeight:800,fontSize:13}}>{user.title}</div>
                  {/* Level 100 MAX — prominent display */}
                  <div style={{
                    marginTop:8,
                    padding:"8px 14px",
                    borderRadius:10,
                    background:"linear-gradient(90deg,rgba(245,158,11,0.18),rgba(239,68,68,0.12))",
                    border:`1px solid rgba(245,158,11,0.5)`,
                    display:"inline-flex",alignItems:"center",gap:8,
                    boxShadow:"0 0 16px rgba(245,158,11,0.25)",
                  }}>
                    <span style={{fontSize:18}}>👑</span>
                    <div>
                      <div style={{
                        background:"linear-gradient(90deg,#f59e0b,#fbbf24,#ef4444)",
                        backgroundSize:"200% auto",animation:"shimmer 1.8s linear infinite",
                        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                        fontWeight:900,fontSize:15,lineHeight:1,
                      }}>المستوى 100 — الحد الأقصى</div>
                      <div style={{color:"rgba(245,158,11,0.6)",fontSize:10,marginTop:2}}>أعلى مستوى في التطبيق</div>
                    </div>
                  </div>

                  <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                    <span style={{background:"rgba(245,158,11,.15)",color:T.gold,fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:6,border:`1px solid ${T.gold}44`}}>✓ موثّق</span>
                    <span style={{background:"rgba(239,68,68,.12)",color:T.red,fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:6,border:`1px solid ${T.red}33`}}>🛡️ أدمن</span>
                    <span style={{background:"rgba(99,102,241,.12)",color:T.accent,fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:6,border:`1px solid ${T.accent}33`}}>🏆 المؤسس</span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div style={{marginTop:16}}>
                <div style={{color:T.gold,fontSize:12,fontWeight:700,marginBottom:8}}>شاراتي ({user.badges.length})</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {user.badges.map((b,i)=>(
                    <div key={i} style={{width:40,height:40,borderRadius:10,background:"rgba(245,158,11,.1)",border:`1px solid ${T.gold}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              {/* XP bar */}
              <div style={{marginTop:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{
                    background:"linear-gradient(90deg,#f59e0b,#fbbf24)",
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                    fontSize:13,fontWeight:800,
                  }}>👑 المستوى الأقصى — 100 / 100</span>
                  <span style={{color:T.gold,fontSize:12,fontWeight:700}}>10,000 XP</span>
                </div>
                <div style={{width:"100%",height:10,borderRadius:6,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                  <div style={{
                    width:"100%",height:"100%",borderRadius:6,
                    background:"linear-gradient(90deg,#f59e0b,#fbbf24,#ef4444,#f59e0b)",
                    backgroundSize:"200% auto",animation:"shimmer 1.5s linear infinite",
                    boxShadow:"0 0 12px rgba(245,158,11,0.6)",
                  }}/>
                </div>
                <div style={{color:"rgba(245,158,11,0.5)",fontSize:10,marginTop:4,textAlign:"center"}}>
                  🏆 وصلت للمستوى الأقصى في التطبيق
                </div>
              </div>
            </div>
          ) : (
            <div style={{background:`linear-gradient(135deg,${T.accentSoft},rgba(139,92,246,0.08))`,border:`1px solid ${T.accent}33`,borderRadius:20,padding:20,display:"flex",alignItems:"center",gap:16}}>
              <AvatarCircle name={user.name} color={user.color} size={70} style={{fontSize:28}}/>
              <div style={{flex:1}}>
                <div style={{color:T.text,fontWeight:800,fontSize:20}}>{user.name}</div>
                <div style={{color:T.textDim,fontSize:12,marginTop:2}}>{user.gender==="male"?"♂ ذكر":user.gender==="female"?"♀ أنثى":"🌐 غير محدد"}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                  <LevelBadge level={level}/>
                  <span style={{color:T.textDim,fontSize:11}}>{user.xp} XP · {lvlTitle}</span>
                </div>
                <div style={{width:"100%",height:4,borderRadius:2,background:"rgba(255,255,255,0.07)",marginTop:8}}>
                  <div style={{width:`${xpPct}%`,height:"100%",borderRadius:2,background:`linear-gradient(90deg,${T.accent},#8b5cf6)`,transition:"width .5s"}}/>
                </div>
                <div style={{color:T.textDim,fontSize:10,marginTop:3}}>{xpPct}/100 XP للمستوى التالي</div>
              </div>
            </div>
          )}

          {/* XP system info (regular users) */}
          {!user.isOwner&&(
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"14px 16px"}}>
              <div style={{color:T.text,fontWeight:700,fontSize:13,marginBottom:10}}>كيف تكسب XP؟</div>
              {[["🌅","تسجيل الدخول اليومي","+10 XP"],["⏱️","البقاء في التطبيق","+1 كل 5 دقائق"],["🎤","الجلوس على المايك","+2 كل دقيقة"],["💬","إرسال رسائل","+1 لكل رسالة"]].map(([ic,lb,v])=>(
                <div key={lb} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:16}}>{ic}</span><span style={{color:T.textMid,fontSize:13}}>{lb}</span></div>
                  <span style={{color:T.accent,fontWeight:700,fontSize:13}}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <Btn onClick={()=>setEdit(true)}>✏️ تعديل الملف الشخصي</Btn>
          <Btn danger onClick={()=>setUser(null)}>تسجيل الخروج</Btn>
        </>}
      </div>

      {/* ── TAB BAR ── */}
      <div style={{background:T.bgCard,borderTop:`1px solid ${user.isOwner?T.gold+"33":T.border}`,display:"flex",flexShrink:0,paddingBottom:14}}>
        {tabs.map(t=>(
          <div key={t.key} onClick={()=>setTab(t.key)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 4px",cursor:"pointer",position:"relative",color:tab===t.key?(user.isOwner?T.gold:T.accent):T.textDim,fontSize:10,fontWeight:tab===t.key?700:400,transition:"color .2s"}}>
            {tab===t.key&&<div style={{position:"absolute",top:0,width:28,height:2.5,borderRadius:2,background:user.isOwner?T.gold:T.accent}}/>}
            <span style={{fontSize:22}}>{t.icon}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </div>

      {showCreate&&<CreateRoomModal onClose={()=>setCreate(false)} onCreate={r=>{setMyRooms(p=>[r,...p]);setCreate(false);}}/>}
      {showEdit&&<EditProfileModal user={user} onClose={()=>setEdit(false)} onSave={d=>setUser(u=>({...u,...d}))}/>}
      {lvlUpShow&&<LevelUpToast level={lvlUpShow} onDone={()=>setLvlUp(null)}/>}
    </div>
  );
}
