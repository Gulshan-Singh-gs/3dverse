import { useEffect, useRef, useState } from 'react';
import { RoomEngine, type State } from './engine/RoomEngine';
import { ITEMS, MATS, PRESETS, REFS, ROOM, NOTES } from './data/roomLayout';

const initial: State = { selected:null, mode:'orbit', preset:'cinematic', fps:0, quality:'high', style:'vector' };

export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<RoomEngine|null>(null);
  const [s,setS] = useState(initial);
  const [ready,setReady] = useState(false);
  const [err,setErr] = useState('');
  const [panel,setPanel] = useState(true);

  useEffect(() => {
    if (!host.current) return;
    try {
      engine.current = new RoomEngine(host.current,setS);
      setReady(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'WebGL initialisation failed');
    }
    return () => engine.current?.dispose();
  },[]);

  const sel = ITEMS.find(i => i.id === s.selected);
  const go = (id: string) => {
    engine.current?.focus(id); setPanel(true);
    document.getElementById('explore')?.scrollIntoView({ behavior:'smooth' });
  };
  const download = () => {
    const blob = new Blob([JSON.stringify({ room:ROOM, items:ITEMS, materials:MATS,
      cameras:PRESETS, references:REFS, assumptions:NOTES },null,2)],{ type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nocturne-study-reconstruction.json';
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="app">
      <header className="nav">
        <a className="brand" href="#top">NOCTURNE<span>SPATIAL ARCHIVE</span></a>
        <nav>
          <a href="#explore">Explore</a><a href="#details">Details</a>
          <a href="#method">Method</a><a href="#references">References</a>
        </nav>
        <span className="status"><i/>LIVE RECONSTRUCTION</span>
      </header>

      <main id="top">
        <section className="hero" id="explore">
          <div className="stage">
            <div ref={host} className="viewport"/>
            {!ready && !err && <div className="loading">Constructing spatial model…</div>}
            {err && <div className="fallback">
              <h2>3D rendering unavailable</h2><p>{err}</p>
              <p>The reconstruction data remains available below.</p>
            </div>}

            <div className="stage-top">
              <span className="eyebrow">ARCHITECTURAL STUDY / 001</span>
              <span className="meta">{s.fps} FPS · {s.quality.toUpperCase()} · {s.style.toUpperCase()} · EST. SCALE</span>
            </div>

            <div className="copy">
              <span className="eyebrow">A ROOM BETWEEN CENTURIES</span>
              <h1>The Nocturne<br/><em>Study</em></h1>
              <p>Carved mahogany, rain-darkened glass and a quiet network of machines.
                 One unified interior, reconstructed from the supplied spatial inventory.</p>
              <div className="actions">
                <button className="primary" onClick={() => engine.current?.setPreset('cinematic')}>
                  Explore room
                </button>
                <button className="ghost" onClick={() => engine.current?.setMode('walk')}>
                  Walk inside
                </button>
              </div>
            </div>

            <div className="controls">
              <div className="group">
                <button className={s.mode==='orbit'?'on':''} onClick={() => engine.current?.setMode('orbit')}>Orbit</button>
                <button className={s.mode==='walk'?'on':''} onClick={() => engine.current?.setMode('walk')}>Walk</button>
              </div>
              <div className="group presets">
                {PRESETS.map(p => (
                  <button key={p.id} className={s.preset===p.id?'on':''}
                          onClick={() => engine.current?.setPreset(p.id)}>{p.label}</button>
                ))}
              </div>
              <div className="group">
                <button className={s.style==='vector'?'on':''} onClick={() => engine.current?.setStyle('vector')}>Vector</button>
                <button className={s.style==='pixel'?'on':''} onClick={() => engine.current?.setStyle('pixel')}>Pixels</button>
              </div>
              <div className="group">
                <button onClick={() => engine.current?.zoom(-1)}>+</button>
                <button onClick={() => engine.current?.zoom(1)}>−</button>
                <button onClick={() => engine.current?.setQuality(s.quality==='high'?'low':'high')}>
                  {s.quality==='high'?'Hi':'Lo'}
                </button>
              </div>
            </div>

            <div className="hint">
              {s.mode==='orbit'
                ? 'Drag to orbit · Scroll or pinch to zoom · Click an object · 1–6 presets'
                : 'Drag to look · WASD / arrows to move · Shift to stride · F to exit'}
            </div>

            {sel && panel && (
              <aside className="inspector">
                <button className="close" onClick={() => { setPanel(false); engine.current?.select(null); }}>×</button>
                <span className="eyebrow">OBJECT INSPECTION</span>
                <h3>{sel.name}</h3>
                <p>{sel.details.join(' · ')}</p>
                <dl>
                  <div><dt>Estimated size</dt><dd>{sel.w} × {sel.h} × {sel.d} m</dd></div>
                  <div><dt>Position</dt><dd>{sel.x}, {sel.y}, {sel.z}</dd></div>
                  <div><dt>Material</dt><dd>{MATS.find(m=>m.id===sel.mat)?.name}</dd></div>
                  <div><dt>Confidence</dt><dd>{Math.round(sel.conf*100)}%</dd></div>
                  <div><dt>Evidence</dt><dd>{sel.views.join(', ')}</dd></div>
                </dl>
                {sel.note && <p className="note">{sel.note}</p>}
              </aside>
            )}
          </div>
          <div className="strip">
            <span>01 / IMMERSIVE RECONSTRUCTION</span>
            <span>9.0 × 8.0 × 4.2 M · ESTIMATED</span>
            <span>THREE.JS / WEBGL</span>
          </div>
        </section>

        <section className="section intro">
          <div>
            <span className="eyebrow">ONE SPACE, FOUR OBSERVATIONS</span>
            <h2>Traditional craft.<br/><em>Industrial memory.</em></h2>
          </div>
          <p>Every object occupies one fixed position in a single coordinate system.
             The four reference viewpoints are cameras, not separate rooms. Furniture is never
             duplicated per image, and wall decorations keep their surveyed positions.</p>
        </section>

        <section className="section" id="details">
          <div className="head">
            <span className="eyebrow">02 / MATERIAL & OBJECT INDEX</span>
            <h2>Read the room.</h2>
            <p>Select any object to fly the camera to it. All dimensions are estimates.</p>
          </div>
          <div className="grid2">
            <div className="list">
              {ITEMS.filter(i => i.geo !== 'cables').map(i => (
                <button key={i.id} onClick={() => go(i.id)}>
                  <span>{i.name}</span><small>{i.category}</small><em>→</em>
                </button>
              ))}
            </div>
            <div className="mats">
              {MATS.map(m => (
                <div className="mat" key={m.id}>
                  <span style={{ background:m.color }}/>
                  <div><strong>{m.name}</strong><small>{m.texture}</small></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section dark" id="method">
          <div className="head">
            <span className="eyebrow">03 / RECONSTRUCTION METHOD</span>
            <h2>Evidence before ornament.</h2>
          </div>
          <div className="metrics">
            <div><strong>{ROOM.area} m²</strong><span>Estimated floor area</span></div>
            <div><strong>{ROOM.vol} m³</strong><span>Estimated volume</span></div>
            <div><strong>{ITEMS.length}</strong><span>Inventory records</span></div>
            <div><strong>{Math.round(ROOM.conf*100)}%</strong><span>Overall confidence</span></div>
          </div>
          <div className="notes">
            <h3>Declared uncertainties</h3>
            {NOTES.map(n => (
              <div key={n.title}><strong>{n.title}</strong><p>{n.body}</p><span>{n.res}</span></div>
            ))}
          </div>
        </section>

        <section className="section" id="references">
          <div className="head">
            <span className="eyebrow">04 / REFERENCE VIEWPOINTS</span>
            <h2>Return to the evidence.</h2>
            <p>The original photographs were described in the supplied JSON but not attached.
               These camera positions reproduce the four documented viewpoints exactly.
               Drop the source files into <code>public/references/</code> to enable side-by-side comparison.</p>
          </div>
          <div className="refs">
            {REFS.map((r,i) => (
              <button key={r.id} onClick={() => {
                engine.current?.setReference(r.id);
                document.getElementById('explore')?.scrollIntoView({ behavior:'smooth' });
              }}>
                <span className="num">0{i+1}</span>
                <div className="thumb">
                  <img src={`/references/${r.id.toLowerCase()}.jpg`} alt={r.label}
                       onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }}/>
                  <div><strong>{r.label}</strong><small>{r.regions.join(' · ')}</small></div>
                </div>
                <strong>{r.id}</strong><small>{r.fov}° estimated FOV</small>
              </button>
            ))}
          </div>
        </section>

        <section className="section download">
          <div>
            <span className="eyebrow">05 / PROJECT RECORD</span>
            <h2>Take the reconstruction data.</h2>
            <p>Export the inventory, materials, cameras and assumptions as JSON.</p>
          </div>
          <button className="primary" onClick={download}>Download dataset</button>
        </section>
      </main>

      <footer>
        <span>NOCTURNE SPATIAL ARCHIVE</span>
        <span>Reconstructed from supplied JSON · Dimensions estimated · Not a surveyed model</span>
      </footer>
    </div>
  );
}