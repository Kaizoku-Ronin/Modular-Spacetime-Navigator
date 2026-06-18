// Simulator UI kit — interactive overlay HUD over a starfield.
// Composes the design-system primitives from window.MSNDesignSystem_6270fe.
// Two modes: FLIGHT (telemetry + chronometer + speed controls) and STARMAP
// (clickable 3D-ish star nodes + slide-in info panel + hyperjump).

const NS = window.MSNDesignSystem_6270fe;
const { Button, HudPanel, DataRow, Badge, ModePill, StatusLine, SpectralBadge, Slider } = NS;

// ── Curated real nearby stars (HYG lineage), projected to 2D for the map ──
const STARS = [
  { name: 'Sol',              type: 'G2V',  ly: 0.0,  x: 0,    y: 0,   mass: 1.000, notes: 'Home system. Real planets, live ephemeris.' },
  { name: 'Proxima Centauri', type: 'M5.5V',ly: 4.24, x: -120, y: 60,  mass: 0.122, notes: 'Closest star. Hosts Proxima b.' },
  { name: 'Alpha Centauri A', type: 'G2V',  ly: 4.37, x: -140, y: 78,  mass: 1.100, notes: 'Sun-like primary of the αCen triple.' },
  { name: 'Alpha Centauri B', type: 'K1V',  ly: 4.37, x: -128, y: 92,  mass: 0.907, notes: 'Orange companion to αCen A.' },
  { name: "Barnard's Star",   type: 'M4V',  ly: 5.96, x: 150,  y: -40, mass: 0.144, notes: 'Highest known proper motion.' },
  { name: 'Wolf 359',         type: 'M6V',  ly: 7.86, x: 96,   y: 150, mass: 0.090, notes: 'Faint, flaring red dwarf.' },
  { name: 'Lalande 21185',    type: 'M2V',  ly: 8.31, x: -60,  y: -160,mass: 0.390, notes: 'Bright nearby red dwarf.' },
  { name: 'Sirius A',         type: 'A1V',  ly: 8.60, x: 200,  y: 70,  mass: 2.063, notes: 'Brightest star in the night sky.' },
  { name: 'Sirius B',         type: 'DA2',  ly: 8.60, x: 214,  y: 84,  mass: 1.018, notes: 'White-dwarf companion to Sirius A.' },
  { name: 'Ross 154',         type: 'M3.5V',ly: 9.69, x: 40,   y: -200,mass: 0.170, notes: 'Flare star in Sagittarius.' },
  { name: 'Epsilon Eridani',  type: 'K2V',  ly: 10.48,x: 244,  y: -120,mass: 0.820, notes: 'Young K-dwarf with a debris disk.' },
  { name: 'Procyon A',        type: 'F5V',  ly: 11.46,x: 270,  y: 30,  mass: 1.499, notes: 'Bright F-type primary.' },
  { name: 'Tau Ceti',         type: 'G8V',  ly: 11.91,x: -250, y: -90, mass: 0.783, notes: 'Sun-like, multiple candidate planets.' },
  { name: '61 Cygni A',       type: 'K5V',  ly: 11.40,x: -210, y: 170, mass: 0.700, notes: 'First star with a measured parallax.' },
];
const LANES = [
  ['Sol','Proxima Centauri','planck'], ['Sol','Alpha Centauri A','planck'],
  ['Alpha Centauri A','Alpha Centauri B','planck'], ['Proxima Centauri','Alpha Centauri A','planck'],
  ['Sol',"Barnard's Star",'stellar'], ['Sol','Lalande 21185','stellar'],
  ['Sol','Wolf 359','stellar'], ["Barnard's Star",'Ross 154','stellar'],
  ['Sol','Sirius A','galactic'], ['Sirius A','Sirius B','planck'],
  ['Sol','Tau Ceti','galactic'], ['Sol','Procyon A','galactic'],
  ['Procyon A','Epsilon Eridani','stellar'], ['Sol','61 Cygni A','galactic'],
];
const CUSP = { planck:'#ff5f9e', stellar:'#b86bff', galactic:'#4db6e8' };
function specHex(t){const s=(t||'')[0];return ({O:'#5a7cff',B:'#5a7cff',A:'#8aa4ff',F:'#fff5e0',G:'#ffe88a',K:'#ffaa44',M:'#ff6622',D:'#c0d8ff'})[s]||'#cfe7e6';}

const pad = (n) => String(n).padStart(2, '0');
function fmtClock(s){ s=Math.floor(s); return `${pad(Math.floor(s/3600))}:${pad(Math.floor(s/60)%60)}:${pad(s%60)}`; }

// ── Chronometer panel (twin-paradox clock) ──
function Chronometer({ universe, ship, gamma, flying, onReset }) {
  const drift = universe - ship;
  const frac = universe > 0 ? Math.max(0, Math.min(1, ship / universe)) : 1;
  const VIOLET = '#b86bff';
  return (
    <div style={{ position:'fixed', top:60, right:20, zIndex:20, minWidth:236,
      background:'rgba(6,12,18,0.72)', border:'1px solid rgba(70,224,210,0.18)',
      borderRadius:4, padding:'12px 14px', backdropFilter:'blur(4px)',
      fontFamily:"'JetBrains Mono', monospace", letterSpacing:'0.04em' }}>
      <div style={{ fontSize:9, letterSpacing:'0.14em', color:'#5f7e7d', marginBottom:9 }}>
        RELATIVISTIC CHRONOMETER<span style={{opacity:.6}}> · this journey</span>
      </div>
      <DataRow label="Standard galactic" value={fmtClock(universe)} divider={false} />
      <DataRow label="Ship chronometer" value={fmtClock(ship)} valueColor={VIOLET} divider={false} />
      <div style={{ margin:'9px 0 7px', height:6, borderRadius:3, background:'rgba(70,224,210,0.14)', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', insetBlock:0, left:0, width:`${frac*100}%`, background:VIOLET, transition:'width .15s linear' }} />
      </div>
      <div style={{ borderTop:'1px solid rgba(70,224,210,0.18)', paddingTop:7 }}>
        <DataRow label="Ship aged less by" value={`${drift.toFixed(1)} s`} valueColor={VIOLET} divider={false} />
        <DataRow label="Time dilation" value={flying ? `γ ${gamma.toFixed(2)} · ship ${(100/gamma).toFixed(0)}%` : 'at rest · synced'} valueColor={flying?VIOLET:'#5f7e7d'} divider={false} />
      </div>
      <button onClick={onReset} style={{ marginTop:9, width:'100%', border:'1px solid rgba(70,224,210,0.18)', background:'transparent', color:'#5f7e7d', fontFamily:'inherit', fontSize:9.5, letterSpacing:'0.06em', textTransform:'uppercase', padding:6, borderRadius:3, cursor:'pointer' }}>↻ Reset journey clock</button>
    </div>
  );
}

// ── Top nav ──
function Nav({ mode, onSettings }) {
  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, padding:'12px 20px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      background:'linear-gradient(to bottom, rgba(3,5,10,0.8), transparent)' }}>
      <div style={{ fontFamily:"'Space Grotesk', system-ui, sans-serif", fontSize:13, fontWeight:500, color:'#5f7e7d', letterSpacing:'0.1em', textTransform:'uppercase' }}>Modular Spacetime Navigator</div>
      <ModePill mode={mode} />
      <div style={{ display:'flex', gap:14, color:'#5f7e7d', fontSize:18 }}>
        <span style={{cursor:'pointer'}} title="Lore">ⓘ</span>
        <span style={{cursor:'pointer'}} title="Fullscreen">⤢</span>
        <span onClick={onSettings} style={{cursor:'pointer'}} title="Settings · paint">⚙</span>
      </div>
    </nav>
  );
}

// ── Mode switch dock ──
function ModeDock({ mode, setMode, canJump, onJump }) {
  const btn = (active, color) => ({
    fontFamily:"'JetBrains Mono', monospace", fontSize:12, fontWeight:500, textTransform:'uppercase',
    letterSpacing:'0.06em', padding:'8px 14px', borderRadius:8,
    border: active ? `1px solid ${color}30` : '1px solid transparent',
    background: active ? `${color}15` : 'transparent', color: active ? color : '#5f7e7d',
    cursor:'pointer', transition:'all .25s cubic-bezier(0.22,1,0.36,1)' });
  return (
    <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', zIndex:40,
      display:'flex', gap:8, background:'rgba(6,12,18,0.72)', border:'1px solid rgba(70,224,210,0.18)',
      borderRadius:12, padding:'8px 12px', backdropFilter:'blur(12px)' }}>
      <button style={btn(mode==='flight','#46e0d2')} onClick={()=>setMode('flight')}>Flight</button>
      <button style={btn(mode==='starmap','#9b59ff')} onClick={()=>setMode('starmap')}>Starmap</button>
      <button style={{ ...btn(false,'#9b59ff'), opacity: canJump?1:0.3, cursor: canJump?'pointer':'not-allowed' }} disabled={!canJump} onClick={onJump}>Jump</button>
    </div>
  );
}

const SPEED = { cruise:{min:0.001,max:0.2,step:0.001}, flight:{min:0.25,max:0.99,step:0.01} };
const glass = { background:'rgba(6,12,18,0.72)', border:'1px solid rgba(70,224,210,0.18)', backdropFilter:'blur(8px)', fontFamily:"'JetBrains Mono', monospace" };

// ── Top-center cluster: CRUISE/FLIGHT speed-mode toggle + NORTH UP ──
function TopCluster({ speedMode, setSpeedMode, beta, setBeta, isSol, onNorthUp, planetsOpen, onPlanets }) {
  const modeBtn = (active,color,label,onClick)=>(
    <button onClick={onClick} style={{ border:'none', background: active?`${color}18`:'transparent', color: active?color:'#5f7e7d', fontFamily:'inherit', fontSize:10, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', padding:'6px 14px', borderRadius:4, cursor:'pointer' }}>{label}</button>
  );
  return (
    <div style={{ position:'fixed', top:54, left:'50%', transform:'translateX(-50%)', zIndex:40, display:'flex', gap:8, alignItems:'center' }}>
      <div style={{ ...glass, display:'flex', gap:4, alignItems:'center', borderRadius:6, padding:'4px 6px' }}>
        {modeBtn(speedMode==='cruise','#46e0d2','Cruise',()=>{setSpeedMode('cruise'); setBeta(Math.min(0.2,Math.max(0.001,beta)));})}
        <div style={{ width:1, height:16, background:'rgba(70,224,210,0.18)' }} />
        {modeBtn(speedMode==='flight','#ffb648','Flight',()=>{setSpeedMode('flight'); setBeta(Math.min(0.99,Math.max(0.25,beta)));})}
      </div>
      {isSol && (
        <button onClick={onNorthUp} title="Snap 'up' to ecliptic north" style={{ ...glass, fontSize:10, letterSpacing:'0.06em', color:'#cfe8e4', border:'1px solid rgba(70,224,210,0.3)', borderRadius:6, padding:'7px 13px', cursor:'pointer' }}>⊥ North up</button>
      )}
      {isSol && (
        <button onClick={onPlanets} title="Hypojump targets" style={{ ...glass, fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer', borderRadius:6, padding:'7px 13px',
          color: planetsOpen?'#46e0d2':'#cfe8e4', border:`1px solid ${planetsOpen?'rgba(70,224,210,0.5)':'rgba(70,224,210,0.18)'}`, background: planetsOpen?'rgba(70,224,210,0.1)':'rgba(6,12,18,0.72)' }}>◎ Planets</button>
      )}
    </div>
  );
}

// ── Hypojump target list — grouped Star / Planets / Dwarf planets ──
const BODIES = [
  { g:'Star',          name:'Sol',      au:0,   c:'#f3efe6' },
  { g:'Planets',       name:'Mercury',  au:0.4, c:'#9c958c' },
  { g:'Planets',       name:'Venus',    au:0.7, c:'#e3b95e' },
  { g:'Planets',       name:'Earth',    au:1.0, c:'#4d9fe0' },
  { g:'Planets',       name:'Mars',     au:1.4, c:'#e0573a' },
  { g:'Planets',       name:'Jupiter',  au:5.3, c:'#d6a06a' },
  { g:'Planets',       name:'Saturn',   au:9.5, c:'#e8c66a' },
  { g:'Planets',       name:'Uranus',   au:19,  c:'#8fd4d8' },
  { g:'Planets',       name:'Neptune',  au:30,  c:'#4a6cf0' },
  { g:'Dwarf planets', name:'Ceres',    au:2.5, c:'#b3a89a' },
  { g:'Dwarf planets', name:'Pluto',    au:36,  c:'#c9a98a' },
  { g:'Dwarf planets', name:'Haumea',   au:50,  c:'#a8aab0' },
  { g:'Dwarf planets', name:'Makemake', au:53,  c:'#c5825c' },
  { g:'Dwarf planets', name:'Eris',     au:95,  c:'#dadce4' },
  { g:'Dwarf planets', name:'Sedna',    au:81,  c:'#c0504a' },
];
function PlanetMenu({ open, target, onPick, onClose }) {
  if (!open) return null;
  let lastG = null;
  return (
    <div style={{ position:'fixed', left:20, top:60, bottom:20, width:248, zIndex:46,
      background:'rgba(6,12,18,0.92)', border:'1px solid rgba(70,224,210,0.18)', borderRadius:8,
      backdropFilter:'blur(16px)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px 10px', borderBottom:'1px solid rgba(70,224,210,0.12)' }}>
        <span style={{ fontFamily:"'Space Grotesk', system-ui, sans-serif", fontSize:12, fontWeight:500, color:'#46e0d2', letterSpacing:'0.06em', textTransform:'uppercase' }}>Hypojump · Sol</span>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#5f7e7d', cursor:'pointer', fontSize:15 }}>×</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'6px 0 10px' }}>
        {BODIES.map((b) => {
          const head = b.g !== lastG ? (lastG = b.g) : null;
          const sel = b.name === target;
          return (
            <React.Fragment key={b.name}>
              {head && (
                <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:9, letterSpacing:'0.16em', color:'#5f7e7d', textTransform:'uppercase', padding:'12px 16px 6px' }}>{b.g}</div>
              )}
              <button onClick={()=>onPick(b.name)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12,
                padding:'8px 18px 8px 16px', cursor:'pointer', textAlign:'left', border:'none', boxSizing:'border-box',
                borderLeft: sel ? '2px solid #46e0d2' : '2px solid transparent',
                background: sel ? 'rgba(70,224,210,0.10)' : 'transparent',
                transition:'background 0.15s' }}
                onMouseEnter={(e)=>{ if(!sel) e.currentTarget.style.background='rgba(70,224,210,0.04)'; }}
                onMouseLeave={(e)=>{ if(!sel) e.currentTarget.style.background='transparent'; }}>
                <span style={{ width:11, height:11, borderRadius:'50%', flexShrink:0, background:b.c, boxShadow:`0 0 6px ${b.c}66` }} />
                <span style={{ flex:1, fontFamily:"'Space Grotesk', system-ui, sans-serif", fontSize:14, fontWeight:500, color: sel ? '#46e0d2' : '#cfe7e6' }}>{b.name}</span>
                <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:12, color:'#5f7e7d', fontVariantNumeric:'tabular-nums' }}>{b.au}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ padding:'8px 16px', borderTop:'1px solid rgba(70,224,210,0.12)', fontFamily:"'JetBrains Mono', monospace", fontSize:9, letterSpacing:'0.06em', color:'#5f7e7d', textTransform:'uppercase' }}>AU from Sun</div>
    </div>
  );
}

// ── Left rail: vertical TIME COMP slider (lives at the foot of the left column) ──
function TimeCompRail({ timeScale, setTimeScale }) {
  return (
    <div style={{ ...glass, borderRadius:8, padding:'10px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:7, alignSelf:'flex-start' }}>
      <span style={{ fontSize:8.5, letterSpacing:'0.1em', color:'#5f7e7d', textTransform:'uppercase' }}>T·comp</span>
      <input type="range" min={1} max={500} step={1} value={timeScale} onChange={(e)=>setTimeScale(parseInt(e.target.value))}
        className="msn-slider teal" aria-label="Time compression"
        style={{ writingMode:'vertical-lr', direction:'rtl', height:96, width:4 }} />
      <span style={{ fontSize:11, color:'#9fd0cb', fontVariantNumeric:'tabular-nums' }}>{timeScale<=1?'1:1':'×'+timeScale}</span>
    </div>
  );
}

// ── Right rail: 1st / 3rd person VIEW toggle ──
function ViewToggle({ view, setView }) {
  const third = view === 'third';
  return (
    <div style={{ position:'fixed', right:20, top:'50%', transform:'translateY(-50%)', zIndex:40,
      ...glass, borderRadius:8, padding:'10px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <span style={{ fontSize:9, letterSpacing:'0.12em', color:'#5f7e7d', textTransform:'uppercase' }}>View</span>
      <button onClick={()=>setView(third?'first':'third')} aria-label="Toggle camera view"
        style={{ fontFamily:'inherit', fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer',
          color: third?'#ffb648':'#46e0d2', background: third?'rgba(255,182,72,0.12)':'rgba(70,224,210,0.12)',
          border:`1px solid ${third?'rgba(255,182,72,0.5)':'rgba(70,224,210,0.4)'}`, borderRadius:6, padding:'8px 10px', width:78, lineHeight:1.4 }}>
        {third ? '3rd · ship' : '1st · cockpit'}
      </button>
    </div>
  );
}

// ── Bottom: play/pause + speed slider (sits just above the mode dock) ──
function SpeedDock({ beta, setBeta, speedMode, paused, setPaused }) {
  const cfg = SPEED[speedMode];
  return (
    <div style={{ position:'fixed', bottom:78, left:'50%', transform:'translateX(-50%)', zIndex:40,
      ...glass, display:'flex', alignItems:'center', gap:12, borderRadius:6, padding:'8px 12px' }}>
      <button onClick={()=>setPaused(!paused)} aria-label={paused?'Play':'Pause'} style={{ width:46, height:40, border:`1.5px solid ${paused?'#46e0d2':'#ffb648'}`, background: paused?'rgba(70,224,210,0.12)':'rgba(255,182,72,0.12)', color: paused?'#46e0d2':'#ffb648', borderRadius:4, fontSize:15, cursor:'pointer' }}>{paused?'▶':'⏸'}</button>
      <Slider label={speedMode} min={cfg.min} max={cfg.max} step={cfg.step} value={beta} onChange={setBeta} tone={speedMode==='cruise'?'teal':'warn'} displayValue={`${beta<0.01?beta.toFixed(3):beta.toFixed(2)} c`} />
    </div>
  );
}

// ── Settings / paint bay (gear in nav opens this; embeds the color customizer) ──
function SettingsPanel({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed', top:80, bottom:20, right:0, width:380, zIndex:45,
      background:'rgba(6,12,18,0.92)', borderLeft:'1px solid rgba(70,224,210,0.18)', backdropFilter:'blur(16px)',
      display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid rgba(70,224,210,0.12)' }}>
        <span style={{ fontFamily:"'Space Grotesk', system-ui, sans-serif", fontSize:13, fontWeight:500, color:'#46e0d2', letterSpacing:'0.06em', textTransform:'uppercase' }}>⚙ Paint &amp; boost bay</span>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#5f7e7d', cursor:'pointer', fontSize:16 }}>×</button>
      </div>
      <iframe src="paint-bay.html" title="Paint bay" style={{ flex:1, width:'100%', border:'none', background:'#070b11' }} />
    </div>
  );
}

// ── Starmap (SVG nodes + lanes) ──
function Starmap({ selected, setSelected }) {
  const byName = Object.fromEntries(STARS.map(s=>[s.name,s]));
  const VB = 640, cx = VB/2, cy = VB/2;
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
      <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width:'min(86vh,86vw)', height:'min(86vh,86vw)' }}>
        {LANES.map(([a,b,c],i)=>{const A=byName[a],B=byName[b];return (
          <line key={i} x1={cx+A.x} y1={cy+A.y} x2={cx+B.x} y2={cy+B.y} stroke={CUSP[c]} strokeWidth={1} opacity={0.32} />
        );})}
        {STARS.map((s)=>{const sel=selected===s.name; const col=specHex(s.type);return (
          <g key={s.name} style={{cursor:'pointer'}} onClick={()=>setSelected(s.name)}>
            {sel && <circle cx={cx+s.x} cy={cy+s.y} r={14} fill="none" stroke="#9b59ff" strokeWidth={1.5} opacity={0.8} />}
            <circle cx={cx+s.x} cy={cy+s.y} r={s.name==='Sol'?6:4} fill={col} style={{ filter:`drop-shadow(0 0 6px ${col})` }} />
            <text x={cx+s.x+10} y={cy+s.y+4} fill={sel?'#cfe7e6':'#5f7e7d'} fontSize={11} fontFamily="'JetBrains Mono', monospace">{s.name}</text>
          </g>
        );})}
      </svg>
    </div>
  );
}

// ── Star info side panel ──
function StarPanel({ star, onClose, onJump }) {
  if (!star) return null;
  const col = specHex(star.type);
  const lanes = LANES.filter(([a,b])=>a===star.name||b===star.name).map(([a,b,c])=>({to:a===star.name?b:a,c}));
  return (
    <div style={{ position:'fixed', top:80, bottom:80, right:0, width:320, zIndex:30,
      background:'rgba(6,12,18,0.82)', borderLeft:'1px solid rgba(70,224,210,0.18)', backdropFilter:'blur(16px)',
      padding:24, display:'flex', flexDirection:'column', animation:'msn-slide-in-right .4s cubic-bezier(0.22,1,0.36,1)' }}>
      <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'none', border:'none', color:'#5f7e7d', cursor:'pointer', fontSize:16 }}>×</button>
      <h2 style={{ fontFamily:"'Space Grotesk', system-ui, sans-serif", fontSize:20, fontWeight:700, color:'#cfe7e6', margin:'0 0 8px' }}>{star.name}</h2>
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:16 }}>
        <SpectralBadge type={star.type} />
        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:12, color:'#5f7e7d' }}>{star.ly.toFixed(2)} ly</span>
      </div>
      <DataRow label="Mass" value={`${star.mass.toFixed(3)} M☉`} />
      <DataRow label="Class" value={star.type} />
      <DataRow label="Distance" value={`${star.ly.toFixed(2)} ly`} divider={false} />
      <p style={{ fontFamily:'Inter, sans-serif', fontSize:12, fontStyle:'italic', color:'#5f7e7d', lineHeight:1.5, margin:'14px 0' }}>{star.notes}</p>
      {lanes.length>0 && <>
        <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:'#5f7e7d', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8, paddingBottom:6, borderBottom:'1px solid rgba(70,224,210,0.1)' }}>Connected lanes</div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {lanes.map((l,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 4px' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:CUSP[l.c] }} />
              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:12, color:'#cfe7e6' }}>{l.to}</span>
            </div>
          ))}
        </div>
      </>}
      <div style={{ display:'flex', gap:10, marginTop:'auto' }}>
        <Button tone="teal" style={{ flex:1 }}>Align</Button>
        <Button tone="violet" pulse style={{ flex:1 }} onClick={onJump}>Hyperjump</Button>
      </div>
    </div>
  );
}

// ── Hyperjump flash overlay ──
function JumpOverlay({ to }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(circle, rgba(170,221,255,0.9), rgba(26,51,170,0.6) 40%, #03050a 80%)',
      animation:'msn-fade-in .25s ease' }}>
      <div style={{ textAlign:'center', fontFamily:"'JetBrains Mono', monospace" }}>
        <div style={{ fontSize:12, letterSpacing:'0.3em', color:'#03050a', fontWeight:700 }}>HYPERJUMP</div>
        <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:28, fontWeight:700, color:'#03050a', marginTop:8 }}>{to}</div>
      </div>
    </div>
  );
}

function App() {
  const [mode, setMode] = React.useState('flight');
  const [speedMode, setSpeedMode] = React.useState('cruise');
  const [beta, setBeta] = React.useState(0.2);
  const [paused, setPaused] = React.useState(false);
  const [timeScale, setTimeScale] = React.useState(120);
  const [view, setView] = React.useState('first');
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [planetsOpen, setPlanetsOpen] = React.useState(false);
  const [hypoTarget, setHypoTarget] = React.useState('Earth');
  const [selected, setSelected] = React.useState(null);
  const [jumpTo, setJumpTo] = React.useState(null);
  const [clock, setClock] = React.useState({ universe: 74, ship: 72 });
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef({});
  const gamma = 1 / Math.sqrt(1 - Math.min(beta, 0.9999) ** 2);
  const flying = mode === 'flight' && !paused && beta > 0.001;

  stateRef.current = { beta, paused, mode };

  React.useEffect(() => {
    if (!canvasRef.current) return;
    return window.MSNStarfield.mount(canvasRef.current, () => stateRef.current);
  }, []);

  // journey clock
  React.useEffect(() => {
    const id = setInterval(() => {
      if (mode === 'flight' && !paused) {
        setClock((c) => ({ universe: c.universe + 0.1, ship: c.ship + 0.1 / gamma }));
      }
    }, 100);
    return () => clearInterval(id);
  }, [mode, paused, gamma]);

  const doJump = () => {
    const target = selected || 'Proxima Centauri';
    setJumpTo(target);
    setTimeout(() => {
      setJumpTo(null); setMode('flight'); setSelected(null);
      setClock((c) => ({ universe: c.universe + 6, ship: c.ship + 6 / gamma }));
    }, 1100);
  };

  const status = paused ? 'paused' : (beta > 0.6 ? 'near-horizon' : 'cruising');
  const sel = STARS.find((s) => s.name === selected);

  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden', background:'#03050a' }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
      {mode === 'starmap' && <Starmap selected={selected} setSelected={setSelected} />}
      <Nav mode={jumpTo ? 'jump' : mode} onSettings={()=>setSettingsOpen((o)=>!o)} />

      {mode === 'flight' && <>
        <div style={{ position:'fixed', top:60, left:20, bottom:96, zIndex:20, width:222, display:'flex', flexDirection:'column', justifyContent:'space-between', gap:16, pointerEvents:'none' }}>
          <div style={{ pointerEvents:'auto' }}>
            <HudPanel title={(speedMode==='flight'?'PROXIMA':'SOL')+' SYSTEM'} dot tag={speedMode==='cruise'?'CRUISE':'FLIGHT'} tagTone={speedMode==='cruise'?'teal':'warn'}>
              <DataRow label="Distance" value={`${(0.605/(beta+0.05)).toFixed(3)} AU`} />
              <DataRow label="Velocity" value={`${beta.toFixed(3)} c`} />
              <DataRow label="Time comp" value={`×${timeScale}`} valueColor="#9fd0cb" />
              <DataRow label="Lorentz γ" value={gamma.toFixed(3)} />
              <DataRow label="Aboard" value={fmtClock(clock.ship)} />
              <DataRow label="Outside" value={fmtClock(clock.universe)} divider={false} />
              <div style={{ marginTop:10, paddingTop:8, borderTop:'1px solid rgba(70,224,210,0.12)' }}>
                <StatusLine status={status} />
              </div>
            </HudPanel>
          </div>
          <div style={{ pointerEvents:'auto' }}>
            <TimeCompRail timeScale={timeScale} setTimeScale={setTimeScale} />
          </div>
        </div>
        <Chronometer universe={clock.universe} ship={clock.ship} gamma={gamma} flying={flying} onReset={()=>setClock({universe:0,ship:0})} />
        <TopCluster speedMode={speedMode} setSpeedMode={setSpeedMode} beta={beta} setBeta={setBeta} isSol={speedMode==='cruise'} onNorthUp={()=>{}} planetsOpen={planetsOpen} onPlanets={()=>setPlanetsOpen((o)=>!o)} />
        <ViewToggle view={view} setView={setView} />
        <SpeedDock beta={beta} setBeta={setBeta} speedMode={speedMode} paused={paused} setPaused={setPaused} />
        <PlanetMenu open={planetsOpen} target={hypoTarget} onPick={(n)=>{ setHypoTarget(n); setPlanetsOpen(false); }} onClose={()=>setPlanetsOpen(false)} />
      </>}

      {mode === 'starmap' && <StarPanel star={sel} onClose={()=>setSelected(null)} onJump={doJump} />}

      <ModeDock mode={mode} setMode={(m)=>{setMode(m); if(m==='flight')setSelected(null);}} canJump={mode==='starmap'&&!!selected} onJump={doJump} />
      <SettingsPanel open={settingsOpen} onClose={()=>setSettingsOpen(false)} />
      {jumpTo && <JumpOverlay to={jumpTo} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
