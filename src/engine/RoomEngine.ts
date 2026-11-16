
import * as T from 'three';
import { ITEMS, PRESETS, REFS, LIGHTS } from '../data/roomLayout';
import { buildMaterials, disposeMaterials, type MatMap } from './materials';
import { buildArchitecture, buildCity, buildRain, buildItems, type Anim } from './geometry';

export type Mode = 'orbit' | 'walk';
export type Quality = 'high' | 'low';
export type VisualStyle = 'vector' | 'pixel';
export type State = { selected: string|null; mode: Mode; preset: string; fps: number; quality: Quality; style: VisualStyle };
type CB = (s: State) => void;
const clamp = (v:number,a:number,z:number) => Math.max(a, Math.min(z,v));

export class RoomEngine {
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(55,1,.08,120);
  renderer: T.WebGLRenderer;
  root = new T.Group();
  mats: MatMap;
  state: State = { selected:null, mode:'orbit', preset:'cinematic', fps:0, quality:'high', style:'vector' };
  cb: CB; raf = 0; clock = new T.Clock();
  target = new T.Vector3(4.3,1.25,5.1);
  dPos = new T.Vector3(7.6,3.1,1.4);
  dTgt = this.target.clone();
  theta = .65; phi = 1.12; radius = 7.5;
  keys = new Set<string>();
  down = false; moved = 0; px = 0; py = 0; yaw = Math.PI; pitch = 0;
  disposed = false; frames = 0; last = 0;
  sel: T.LineSegments|null = null;
  anim: Anim; groups: Map<string,T.Group>;
  ceiling: T.Object3D; beams: T.Object3D; rain: T.Points; drone: T.Group; fireLight: T.PointLight;
  pinch = 0; touches = new Map<number,{x:number;y:number}>();
  lowFpsStreak = 0; manualQuality = false;

  // Reusable scratch vectors to avoid frame-loop allocations / garbage collection
  private _stepDir = new T.Vector3();
  private _stepRight = new T.Vector3();
  private _stepVector = new T.Vector3();
  private _nextPos = new T.Vector3();

  // Pixel style offscreen render target and quad
  private pixelTarget: T.WebGLRenderTarget | null = null;
  private pixelScene: T.Scene | null = null;
  private pixelCamera: T.OrthographicCamera | null = null;
  private pixelQuad: T.Mesh | null = null;

  constructor(public host: HTMLElement, cb: CB) {
    this.cb = cb;
    this.renderer = new T.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
    this.renderer.setClearColor('#0a0c0f');
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    host.appendChild(this.renderer.domElement);
    this.scene.add(this.root);
    this.scene.fog = new T.FogExp2('#0a0e14',.012);

    this.mats = buildMaterials();
    const arch = buildArchitecture(this.mats,this.root);
    this.ceiling = arch.ceiling; this.beams = arch.beams;
    this.drone = buildCity(this.root);
    this.rain = buildRain(this.root);
    const built = buildItems(this.mats,this.root);
    this.anim = built.anim; this.groups = built.groups;
    this.fireLight = this.lights();

    this.camera.position.copy(this.dPos);
    this.camera.lookAt(this.target);
    this.bind(); this.resize();
    this.applyQuality(window.innerWidth < 768 ? 'low' : 'high');
    this.loop(); this.emit();
  }

  lights() {
    this.scene.add(new T.HemisphereLight(LIGHTS.sky.color, LIGHTS.ambient.color, .55));
    const sky = new T.DirectionalLight(LIGHTS.sky.color, 2.4);
    sky.position.set(4.5,5.5,9); sky.target.position.set(4.5,.5,3); sky.castShadow = true;
    sky.shadow.mapSize.set(1024,1024);
    sky.shadow.camera.left = -9; sky.shadow.camera.right = 9;
    sky.shadow.camera.top = 9; sky.shadow.camera.bottom = -9;
    sky.shadow.camera.far = 30; sky.shadow.bias = -.0004;
    this.scene.add(sky, sky.target);

    const mk = (x:number,y:number,z:number,c:string,i:number,dist:number) => {
      const l = new T.PointLight(c,i,dist,2); l.position.set(x,y,z); this.scene.add(l); return l;
    };
    mk(6.1,1.12,5.1,LIGHTS.banker.color,2.2,4.5);
    mk(.65,1.5,7.25,LIGHTS.warm.color,2.0,5.5);
    mk(.55,1.18,3.55,LIGHTS.warm.color,1.7,4.5);
    const fire = mk(8.4,.5,3.4,LIGHTS.fire.color,2.6,6);
    mk(5.2,1.5,2.8,LIGHTS.screens.color,1.4,5.5);
    mk(4.8,2.35,.6,LIGHTS.screens.color,1.1,4.5);
    mk(4.5,3.85,4,LIGHTS.led.color,1.6,10);
    mk(2,3.85,7,LIGHTS.led.color,.9,6);
    mk(7,3.85,1.5,LIGHTS.led.color,.9,6);
    return fire;
  }

  bind() {
    const el = this.renderer.domElement;
    el.style.touchAction = 'none'; el.style.display = 'block';
    el.addEventListener('pointerdown',this.onDown);
    el.addEventListener('pointermove',this.onMove);
    el.addEventListener('pointerup',this.onUp);
    el.addEventListener('pointercancel',this.onUp);
    el.addEventListener('wheel',this.onWheel,{ passive:false });
    el.addEventListener('contextmenu',e => e.preventDefault());
    window.addEventListener('keydown',this.onKeyDown);
    window.addEventListener('keyup',this.onKeyUp);
    window.addEventListener('resize',this.resize);
  }

  onDown = (e: PointerEvent) => {
    this.down = true; this.moved = 0; this.px = e.clientX; this.py = e.clientY;
    this.touches.set(e.pointerId,{ x:e.clientX, y:e.clientY });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    if (this.touches.size === 2) {
      const [a,b] = [...this.touches.values()];
      this.pinch = Math.hypot(a.x-b.x, a.y-b.y);
    }
  };

  onMove = (e: PointerEvent) => {
    if (!this.down) return;
    const dx = e.clientX-this.px, dy = e.clientY-this.py;
    this.px = e.clientX; this.py = e.clientY;
    this.moved += Math.abs(dx)+Math.abs(dy);
    if (this.touches.has(e.pointerId)) this.touches.set(e.pointerId,{ x:e.clientX, y:e.clientY });
    if (this.touches.size === 2) {
      const [a,b] = [...this.touches.values()];
      const d = Math.hypot(a.x-b.x, a.y-b.y);
      if (this.pinch > 0 && this.state.mode === 'orbit') {
        this.radius = clamp(this.radius*(this.pinch/d),1.6,15); this.updateOrbit();
      }
      this.pinch = d; return;
    }
    if (this.state.mode === 'orbit') {
      this.theta -= dx*.0055;
      this.phi = clamp(this.phi+dy*.0055,.12,1.52);
      this.updateOrbit();
    } else {
      this.yaw -= dx*.0042;
      this.pitch = clamp(this.pitch-dy*.0042,-.85,.85);
    }
  };

  onUp = (e: PointerEvent) => {
    this.touches.delete(e.pointerId);
    if (this.touches.size < 2) this.pinch = 0;
    if (!this.down) return;
    this.down = false;
    if (this.moved < 6) this.pick(e.clientX,e.clientY);
  };

  onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (this.state.mode === 'orbit') {
      this.radius = clamp(this.radius+e.deltaY*.0075,1.6,15); this.updateOrbit();
    }
  };

  onKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
    this.keys.add(e.code);
    if (e.code === 'Escape') this.select(null);
    if (e.code === 'KeyF') this.setMode(this.state.mode === 'orbit' ? 'walk' : 'orbit');
    const n = ['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6'].indexOf(e.code);
    if (n >= 0) this.setPreset(PRESETS[n].id);
  };
  onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);

  resize = () => {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setSize(w,h,false);
    this.camera.aspect = w/h; this.camera.updateProjectionMatrix();
    this.applyDpr();
    this.setupPixelPipeline(w, h);
  };

  private setupPixelPipeline(w: number, h: number) {
    if (this.state.style !== 'pixel') {
      if (this.pixelTarget) {
        this.pixelTarget.dispose();
        this.pixelTarget = null;
      }
      return;
    }
    // Pixel resolution - retro 320p-scale
    const pixelScale = 3.5;
    const pw = Math.max(160, Math.floor(w / pixelScale));
    const ph = Math.max(120, Math.floor(h / pixelScale));

    if (!this.pixelTarget || this.pixelTarget.width !== pw || this.pixelTarget.height !== ph) {
      if (this.pixelTarget) this.pixelTarget.dispose();
      this.pixelTarget = new T.WebGLRenderTarget(pw, ph, {
        minFilter: T.NearestFilter,
        magFilter: T.NearestFilter,
        format: T.RGBAFormat,
      });
    }

    if (!this.pixelScene) {
      this.pixelScene = new T.Scene();
      this.pixelCamera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geo = new T.PlaneGeometry(2, 2);
      const mat = new T.MeshBasicMaterial({
        map: this.pixelTarget.texture,
        depthTest: false,
        depthWrite: false,
      });
      this.pixelQuad = new T.Mesh(geo, mat);
      this.pixelScene.add(this.pixelQuad);
    } else if (this.pixelQuad) {
      (this.pixelQuad.material as T.MeshBasicMaterial).map = this.pixelTarget.texture;
    }
  }

  setStyle(style: VisualStyle) {
    this.state.style = style;
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.setupPixelPipeline(w, h);
    this.emit();
  }

  applyDpr() {
    const cap = this.state.quality === 'low' ? 1.0 : 1.5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
  }
  applyQuality(q: Quality) {
    this.state.quality = q;
    this.renderer.shadowMap.enabled = q === 'high';
    this.rain.visible = q === 'high';
    this.applyDpr(); this.emit();
  }
  setQuality(q: Quality) { this.manualQuality = true; this.applyQuality(q); }

  updateOrbit() {
    const t = this.target;
    this.dPos.set(
      t.x + this.radius*Math.sin(this.phi)*Math.sin(this.theta),
      Math.max(.35, t.y + this.radius*Math.cos(this.phi)),
      t.z + this.radius*Math.sin(this.phi)*Math.cos(this.theta)
    );
    this.dTgt.copy(t);
  }

  private aim(p: [number,number,number], t: [number,number,number], fov: number) {
    this.dPos.set(...p); this.dTgt.set(...t); this.target.copy(this.dTgt);
    this.camera.fov = fov; this.camera.updateProjectionMatrix();
    const off = this.dPos.clone().sub(this.target);
    this.radius = off.length();
    this.phi = Math.acos(clamp(off.y/this.radius,-1,1));
    this.theta = Math.atan2(off.x,off.z);
  }

  setPreset(id: string) {
    const p = PRESETS.find(x => x.id === id) ?? PRESETS[0];
    this.state.preset = id; this.state.mode = 'orbit';
    this.aim(p.p,p.t,55);
    const plan = id === 'top';
    this.ceiling.visible = !plan; this.beams.visible = !plan;
    this.emit();
  }

  setReference(id: string) {
    const p = REFS.find(x => x.id === id); if (!p) return;
    this.state.preset = id; this.state.mode = 'orbit';
    this.aim(p.p,p.t,p.fov);
    this.ceiling.visible = true; this.beams.visible = true;
    this.emit();
  }

  setMode(mode: Mode) {
    this.state.mode = mode;
    if (mode === 'walk') {
      this.camera.position.set(4.5,1.6,2.4);
      this.yaw = Math.PI; this.pitch = 0;
      this.ceiling.visible = true; this.beams.visible = true;
      this.state.preset = 'walk';
    } else this.setPreset('cinematic');
    this.emit();
  }

  zoom(dir: 1|-1) {
    if (this.state.mode !== 'orbit') return;
    this.radius = clamp(this.radius+dir*.9,1.6,15); this.updateOrbit();
  }
  pan(dx: number, dz: number) {
    if (this.state.mode !== 'orbit') return;
    this.target.x = clamp(this.target.x+dx,.5,8.5);
    this.target.z = clamp(this.target.z+dz,.5,7.5);
    this.updateOrbit();
  }

  select(id: string|null) {
    this.state.selected = id;
    if (this.sel) {
      this.scene.remove(this.sel);
      this.sel.geometry.dispose();
      (this.sel.material as T.Material).dispose();
      this.sel = null;
    }
    if (id) {
      const i = ITEMS.find(x => x.id === id);
      if (i) {
        const geo = new T.EdgesGeometry(new T.BoxGeometry(i.w+.07,i.h+.07,i.d+.07));
        this.sel = new T.LineSegments(geo, new T.LineBasicMaterial({
          color:'#d6b36a', transparent:true, opacity:.9, depthTest:false }));
        this.sel.position.set(i.x,i.y,i.z);
        this.sel.rotation.order = 'XYZ';
        this.sel.rotation.set(T.MathUtils.degToRad(i.rx ?? 0), T.MathUtils.degToRad(i.ry), 0);
        this.sel.renderOrder = 10;
        this.scene.add(this.sel);
      }
    }
    this.emit();
  }

  focus(id: string) {
    const i = ITEMS.find(x => x.id === id); if (!i) return;
    this.select(id); this.state.mode = 'orbit';
    this.target.set(i.x,i.y,i.z);
    this.radius = Math.max(i.w,i.h,i.d)*2.2+1.1;
    this.phi = 1.15;
    this.theta = Math.atan2(4.5-i.x, 4-i.z)+Math.PI;
    this.updateOrbit();
    this.state.preset = 'inspect'; this.emit();
  }

  pick(cx: number, cy: number) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const p = new T.Vector2((cx-r.left)/r.width*2-1, -((cy-r.top)/r.height)*2+1);
    const ray = new T.Raycaster(); ray.setFromCamera(p,this.camera);
    const hits = ray.intersectObjects(this.root.children,true);
    const hit = hits.find(h => h.object.userData.itemId &&
                               h.object.userData.itemId !== 'CABLES_OVERHEAD_001');
    this.select(hit ? String(hit.object.userData.itemId) : null);
  }

  emit() { this.cb({ ...this.state }); }

  // Oriented-box collision against furniture footprints
  collide(next: T.Vector3) {
    const R = .28;
    const skip = ['rug','cables','gallery','art','wallmonitors','holo','monitor','phone','banker','tablelamp'];
    for (const i of ITEMS) {
      if (skip.includes(i.geo)) continue;
      if (i.y + i.h/2 < .35) continue;
      const a = T.MathUtils.degToRad(i.ry), cos = Math.cos(-a), sin = Math.sin(-a);
      const lx = (next.x-i.x)*cos - (next.z-i.z)*sin;
      const lz = (next.x-i.x)*sin + (next.z-i.z)*cos;
      if (Math.abs(lx) < i.w/2+R && Math.abs(lz) < i.d/2+R) return true;
    }
    return false;
  }

  loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(),.05), t = this.clock.elapsedTime;

    if (this.state.mode === 'orbit') {
      const k = 1-Math.exp(-dt*5.5);
      this.camera.position.lerp(this.dPos,k);
      this.target.lerp(this.dTgt,k);
      this.camera.lookAt(this.target);
    } else {
      const sp = (this.keys.has('ShiftLeft')||this.keys.has('ShiftRight') ? 3.4 : 1.9)*dt;
      let f = 0, s = 0;
      if (this.keys.has('KeyW')||this.keys.has('ArrowUp')) f += 1;
      if (this.keys.has('KeyS')||this.keys.has('ArrowDown')) f -= 1;
      if (this.keys.has('KeyA')||this.keys.has('ArrowLeft')) s -= 1;
      if (this.keys.has('KeyD')||this.keys.has('ArrowRight')) s += 1;
      if (f || s) {
        this._stepDir.set(Math.sin(this.yaw),0,Math.cos(this.yaw));
        this._stepRight.set(this._stepDir.z,0,-this._stepDir.x);
        this._stepVector.copy(this._stepDir).multiplyScalar(f*sp).addScaledVector(this._stepRight, s*sp);
        
        this._nextPos.copy(this.camera.position);
        this._nextPos.x = clamp(this._nextPos.x + this._stepVector.x, .4, 8.6);
        if (!this.collide(this._nextPos)) this.camera.position.x = this._nextPos.x;
        
        this._nextPos.copy(this.camera.position);
        this._nextPos.z = clamp(this._nextPos.z + this._stepVector.z, .4, 7.6);
        if (!this.collide(this._nextPos)) this.camera.position.z = this._nextPos.z;
      }
      this.camera.position.y = 1.6;
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.set(this.pitch,this.yaw,0);
    }

    if (this.anim.pendulum) this.anim.pendulum.rotation.z = Math.sin(t*1.8)*.12;
    if (this.anim.flame) {
      this.anim.flame.scale.y = .85+Math.sin(t*9)*.12+Math.sin(t*15.3)*.06;
      this.fireLight.intensity = 2.3+Math.sin(t*8.7)*.35+Math.sin(t*13.1)*.2;
    }
    for (let j = 0; j < this.anim.leds.length; j++)
      this.anim.leds[j].visible = Math.sin(t*2.2+j*1.7) > -.55;

    if (this.rain.visible) {
      const a = this.rain.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < a.length; i += 3) { a[i] -= dt*4.2; if (a[i] < 0) a[i] = 7; }
      this.rain.geometry.attributes.position.needsUpdate = true;
    }
    this.drone.position.x = 3+Math.sin(t*.14)*4;
    this.drone.position.y = 6.2+Math.sin(t*.5)*.25;

    if (this.state.style === 'pixel' && this.pixelTarget && this.pixelScene && this.pixelCamera) {
      this.renderer.setRenderTarget(this.pixelTarget);
      this.renderer.render(this.scene, this.camera);
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.pixelScene, this.pixelCamera);
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    this.frames++;
    if (t-this.last > 1) {
      const fps = Math.round(this.frames/(t-this.last));
      this.state.fps = fps; this.frames = 0; this.last = t;
      if (!this.manualQuality) {
        if (fps < 26) {
          this.lowFpsStreak++;
          if (this.lowFpsStreak >= 3 && this.state.quality === 'high') this.applyQuality('low');
        } else this.lowFpsStreak = 0;
      }
      this.emit();
    }
  };

  dispose() {
    this.disposed = true; cancelAnimationFrame(this.raf);
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown',this.onDown);
    el.removeEventListener('pointermove',this.onMove);
    el.removeEventListener('pointerup',this.onUp);
    el.removeEventListener('pointercancel',this.onUp);
    el.removeEventListener('wheel',this.onWheel);
    window.removeEventListener('keydown',this.onKeyDown);
    window.removeEventListener('keyup',this.onKeyUp);
    window.removeEventListener('resize',this.resize);
    this.scene.traverse(o => {
      if (o instanceof T.Mesh || o instanceof T.Points || o instanceof T.LineSegments) {
        o.geometry.dispose();
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach(m => m.dispose());
      }
    });
    disposeMaterials(this.mats);
    if (this.pixelTarget) this.pixelTarget.dispose();
    if (this.pixelQuad) {
      this.pixelQuad.geometry.dispose();
      (this.pixelQuad.material as T.Material).dispose();
    }
    this.renderer.dispose(); el.remove();
  }
}