import * as T from 'three';
import { ITEMS, type Item } from '../data/roomLayout';
import type { MatMap } from './materials';
import { seeded } from './util';

type V = [number, number, number];

const box = (w:number,h:number,d:number,m:T.Material,x=0,y=0,z=0) => {
  const q = new T.Mesh(new T.BoxGeometry(w,h,d), m);
  q.position.set(x,y,z); q.castShadow = q.receiveShadow = true; return q;
};
const cyl = (rt:number,rb:number,h:number,m:T.Material,x=0,y=0,z=0,seg=16,open=false) => {
  const q = new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg,1,open), m);
  q.position.set(x,y,z); q.castShadow = true; return q;
};
const sph = (r:number,m:T.Material,x=0,y=0,z=0) => {
  const q = new T.Mesh(new T.SphereGeometry(r,14,10), m);
  q.position.set(x,y,z); q.castShadow = true; return q;
};
const tube = (p:V[],r:number,c:string) => new T.Mesh(
  new T.TubeGeometry(new T.CatmullRomCurve3(p.map(q => new T.Vector3(...q))), 28, r, 6, false),
  new T.MeshStandardMaterial({ color: c, roughness: .72 })
);
const glow = (c:string) => new T.MeshBasicMaterial({ color: c, toneMapped: false });

export type Anim = { pendulum?: T.Group; flame?: T.Group; leds: T.Mesh[] };

export function buildArchitecture(M: MatMap, root: T.Group) {
  const c = M.MAT_CONCRETE_PANEL, w = M.MAT_CARVED_MAHOGANY,
        s = M.MAT_BRUSHED_STEEL, brass = M.MAT_BRASS;
  const add = (q: T.Object3D) => root.add(q);

  add(box(9,.2,8, M.MAT_DARK_METAL_TILE, 4.5,-.1,4));

  // North wall — four segments around WIN_001 (6.4 × 2.9, sill 0.7)
  add(box(1.3,4.2,.35,c,.65,2.1,8)); add(box(1.3,4.2,.35,c,8.35,2.1,8));
  add(box(6.4,.7,.35,c,4.5,.35,8));  add(box(6.4,.6,.35,c,4.5,3.9,8));

  // East wall — three segments around DOOR_001 (1.15 × 2.5 at z=1.6)
  add(box(.3,4.2,1.025,c,9,2.1,.5125)); add(box(.3,4.2,5.825,c,9,2.1,5.0875));
  add(box(.3,1.7,1.15,c,9,3.35,1.6));

  add(box(9,4.2,.3,c,4.5,2.1,0)); add(box(.3,4.2,8,c,0,2.1,4));
  const ceiling = box(9,.3,8,c,4.5,4.35,4); ceiling.name = 'ceiling'; add(ceiling);

  // Wainscoting, rails, cornice
  add(box(8.7,.92,.08,w,4.5,.46,.17)); add(box(.08,.92,7.7,w,.17,.46,4));
  add(box(.08,.92,5.3,w,8.83,.46,5.2));
  add(box(8.7,.08,.13,w,4.5,.96,.2)); add(box(.13,.08,7.7,w,.2,.96,4));
  add(box(.13,.08,5.3,w,8.8,.96,5.2));
  add(box(8.8,.16,.16,w,4.5,4.02,.2)); add(box(.16,.16,7.8,w,.2,4.02,4));
  add(box(.16,.16,7.8,w,8.8,4.02,4));

  // Window casing, 3×2 mullions, rain glass, warm sill strip
  const win = new T.Group(); win.position.set(4.5,2.15,7.94);
  win.add(box(6.66,.16,.24,s,0,1.48,0), box(6.66,.16,.24,s,0,-1.48,0),
          box(.16,3,.24,s,-3.28,0,0),   box(.16,3,.24,s,3.28,0,0));
  for (const x of [-1.07,1.07]) win.add(box(.07,2.9,.12,s,x,0,-.02));
  win.add(box(6.4,.07,.12,s,0,0,-.02));
  const glass = new T.Mesh(new T.PlaneGeometry(6.4,2.9), M.RAIN_WINDOW);
  glass.renderOrder = 2; win.add(glass);
  const strip = box(6.7,.035,.08,glow('#ffcf91'),0,-1.58,-.06);
  strip.castShadow = false; win.add(strip); add(win);

  // Door leaf, frame, four raised panels, brass lever, biometric keypad
  const door = new T.Group(); door.position.set(8.96,1.25,1.6); door.rotation.y = -Math.PI/2;
  door.add(box(1.15,2.5,.08,w), box(.13,2.65,.2,w,-.66,.075,.02),
           box(.13,2.65,.2,w,.66,.075,.02), box(1.45,.14,.2,w,0,1.38,.02));
  for (const x of [-.28,.28])
    door.add(box(.4,.75,.035,w,x,.55,-.055), box(.4,.75,.035,w,x,-.55,-.055));
  door.add(box(.16,.035,.05,brass,-.43,-.2,-.12));
  door.add(box(.1,.16,.035, new T.MeshStandardMaterial({
    color:'#10251b', emissive:new T.Color('#22c55e'), emissiveIntensity:1.5 }), -.69,-.15,-.13));
  add(door);

  // Ceiling I-beams and HVAC vent
  const beams = new T.Group(); beams.name = 'beams';
  for (const x of [1.5,4.5,7.5]) beams.add(box(.18,.28,7.8,s,x,4.08,4));
  for (const z of [2,6]) beams.add(box(8.8,.18,.14,s,4.5,4.12,z));
  beams.add(box(.8,.08,.55,s,7.2,4.02,1.2));
  for (let i = 0; i < 7; i++) beams.add(box(.035,.02,.45,M.MAT_DARK_METAL_TILE,6.9+i*.1,3.97,1.2));
  add(beams);

  // Warm LED perimeter
  for (const q of [[4.5,3.93,.24,8.5,.025,.025],[.24,3.93,4,.025,.025,7.5],
                   [8.76,3.93,4,.025,.025,7.5]] as number[][]) {
    const l = box(q[3],q[4],q[5],glow('#ffd6a0'),q[0],q[1],q[2]);
    l.castShadow = false; add(l);
  }
  for (const x of [.32,.46,.6]) add(cyl(.025,.025,3.1,s,x,2.45,.22,8));

  return { ceiling, beams };
}

export function buildCity(root: T.Group) {
  const r = seeded(71), g = new T.Group(); g.name = 'city';
  for (let i = 0; i < 40; i++) {
    const x = -13+(i%13)*2.15, z = 11+Math.floor(i/13)*5+r()*2.5;
    const h = 3+r()*14, w = .8+r()*1.3, d = .8+r()*1.4;
    const b = new T.Group(); b.position.set(x,h/2-1,z);
    b.add(box(w,h,d,new T.MeshStandardMaterial({ color:'#101927', roughness:.8 })));
    const col = i%4===0 ? '#38bdf8' : i%5===0 ? '#f472b6' : '#f59e0b';
    for (let j = 0; j < Math.floor(h/1.15); j++) {
      const q = new T.Mesh(new T.PlaneGeometry(w*.72,.075), glow(col));
      q.position.set(0,-h/2+.7+j*1.15,-d/2-.012); b.add(q);
    }
    g.add(b);
  }
  const sky = new T.Mesh(new T.PlaneGeometry(60,30), new T.MeshBasicMaterial({ color:'#0e1a2b' }));
  sky.position.set(0,6,26); g.add(sky);

  const drone = new T.Group(); drone.name = 'drone'; drone.position.set(3,6.2,12);
  drone.add(box(.5,.12,.24,new T.MeshStandardMaterial({ color:'#20262e', metalness:.8, roughness:.4 })));
  const l1 = new T.Mesh(new T.SphereGeometry(.05,8,6), glow('#f87171')); l1.position.set(-.28,0,0);
  const l2 = new T.Mesh(new T.SphereGeometry(.05,8,6), glow('#38bdf8')); l2.position.set(.28,0,0);
  drone.add(l1,l2); g.add(drone);
  root.add(g); return drone;
}

export function buildRain(root: T.Group) {
  const r = seeded(12), n = 700, a = new Float32Array(n*3);
  for (let i = 0; i < n; i++) { a[i*3] = .8+r()*7.4; a[i*3+1] = r()*7; a[i*3+2] = 8.3+r()*4; }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(a,3));
  const p = new T.Points(g, new T.PointsMaterial({
    color:'#a9c9e8', size:.028, transparent:true, opacity:.45 }));
  p.name = 'rain'; root.add(p); return p;
}

function panel(g:T.Group,x:number,y:number,z:number,w:number,h:number,m:T.Material) {
  g.add(box(w,h,.035,m,x,y,z));
  for (const [a,b,c,d] of [[0,h/2-.03,w,.04],[0,-h/2+.03,w,.04],
                           [-w/2+.03,0,.04,h],[w/2-.03,0,.04,h]] as number[][])
    g.add(box(c,d,.045,m,x+a,y+b,z-.012));
  const ring = new T.Mesh(new T.TorusGeometry(Math.min(w,h)*.23,.016,6,20), m);
  ring.rotation.x = Math.PI/2; ring.position.set(x,y,z-.035); g.add(ring);
}

function legs(g:T.Group,w:number,d:number,h:number,m:T.Material,carved=true) {
  for (const x of [-1,1]) for (const z of [-1,1]) {
    const px = x*(w/2-.09), pz = z*(d/2-.09);
    g.add(cyl(.045,.026,.36,m,px,-h/2+.18,pz,10));
    if (carved) g.add(sph(.062,m,px,-h/2+.25,pz));
  }
}

function seat(i:Item,M:MatMap,chair=false,wing=false) {
  const g = new T.Group(), m = M[i.mat], a = M[i.accent ?? 'MAT_CARVED_MAHOGANY'];
  const w = i.w, h = i.h, d = i.d;
  legs(g,w,d,h,a);
  g.add(box(w*.92,h*.25,d*.88,m,0,-h*.18,0));
  const backH = chair ? h*.66 : h*.62;
  g.add(box(w*.92,backH,d*.2,m,0,h*.18,d*.32));
  for (let j = 0; j < 15; j++)
    g.add(sph(.017,a,(j%5-2)*w*.18, h*.18+(Math.floor(j/5)-1)*backH*.31, d*.22-.015));
  for (const x of [-1,1]) {
    const arm = cyl(d*.17,d*.17,h*.5,m,x*w*.43,-h*.02,0,14);
    arm.rotation.x = Math.PI/2; g.add(arm);
    g.add(sph(d*.17,m,x*w*.43,h*.2,-d*.24));
  }
  if (chair) g.add(box(w*.66,h*.16,d*.62,m,0,-h*.02,-d*.08));
  else for (const x of [-1,0,1]) g.add(box(w*.25,h*.16,d*.62,m,x*w*.27,-h*.02,-d*.1));
  if (wing) for (const x of [-1,1]) {
    const wg = box(w*.13,h*.5,d*.34,m,x*w*.38,h*.22,d*.16); wg.rotation.y = x*.2; g.add(wg);
  }
  if (!chair && i.accent === 'MAT_BRASS')
    for (let j = 0; j < 18; j++) g.add(sph(.008,a,(j-8.5)*w*.05,-h*.3,-d*.44));
  return g;
}

export function buildItem(i: Item, M: MatMap, anim: Anim): T.Group {
  const g = new T.Group(), m = M[i.mat], a = M[i.accent ?? i.mat];
  const w = i.w, h = i.h, d = i.d;

  switch (i.geo) {
    case 'desk': {
      g.add(box(w,.11,d,m,0,h/2-.055,0), box(w*.97,.035,d*.97,a,0,h/2-.115,0));
      for (const x of [-1,1]) {
        const px = x*w*.34;
        g.add(box(w*.25,h*.78,d*.86,m,px,-.04,0), box(w*.28,.08,d*.9,m,px,-h*.39,0));
        for (const y of [-.22,0,.22]) panel(g,px,y,-d*.44,w*.2,.17,m);
      }
      g.add(box(w*.45,h*.5,.08,m,0,-.1,d*.32));
      g.add(tube([[-.8,h/2+.02,.2],[-.3,h/2+.03,.1],[.2,h/2+.025,.25],[.7,h/2+.02,.1]],.012,'#2563eb'));
      g.add(tube([[-.7,h/2+.02,-.2],[-.2,h/2+.03,-.1],[.4,h/2+.02,-.25]],.012,'#b91c1c'));
      break;
    }
    case 'sofa': return seat(i,M);
    case 'chair': return seat(i,M,true);
    case 'wing': return seat(i,M,true,true);

    case 'bookcase': {
      g.add(box(w,h,.06,m,0,0,d*.35), box(.1,h,d,m,-w/2+.05,0,0), box(.1,h,d,m,w/2-.05,0,0),
            box(w+.12,.12,d+.08,m,0,h/2-.06,0), box(w+.1,.16,d+.06,m,0,-h/2+.08,0));
      for (const y of [-.62,0,.62,1.2]) g.add(box(w,.06,d,m,0,y,0));
      const r = seeded(31), cols = ['#4b241b','#263a32','#5a4630','#252d3a','#6b3b25'];
      for (let j = 0; j < 54; j++) {
        const bh = .28+r()*.18, row = Math.floor(j/18);
        if (row === 1 && j%18 > 11) continue;   // gap for the router
        g.add(box(.065,bh,.28,new T.MeshStandardMaterial({ color:cols[j%5], roughness:.75 }),
              (j%18-8.5)*.09, row*.62-.72+bh/2, -.04));
      }
      g.add(box(.55,.22,.28,M.MAT_BRUSHED_STEEL,.4,.11,-.16));
      for (let j = 0; j < 4; j++) {
        const led = box(.03,.02,.01,glow('#38bdf8'),.24+j*.09,.11,-.305);
        led.castShadow = false; anim.leds.push(led); g.add(led);
      }
      break;
    }
    case 'clock': {
      g.add(box(.52,1.75,.36,m,0,-.25,0), box(.62,.18,.4,m,0,-1.08,0), box(.62,.65,.38,m,0,.82,0));
      const dial = cyl(.23,.23,.025,a,0,.82,-.205,32); dial.rotation.x = Math.PI/2; g.add(dial);
      const face = new T.Mesh(new T.CircleGeometry(.205,32),
        new T.MeshStandardMaterial({ color:'#d8c9a5', roughness:.7 }));
      face.position.set(0,.82,-.222); face.rotation.y = Math.PI; g.add(face);
      for (let j = 0; j < 12; j++) {
        const q = j*Math.PI/6;
        const tick = box(.012,.035,.008,M.MAT_BLACK_BAKELITE,Math.sin(q)*.17,.82+Math.cos(q)*.17,-.232);
        tick.rotation.z = -q; g.add(tick);
      }
      const hr = box(.012,.12,.008,a,0,.87,-.238); hr.rotation.z = .5; g.add(hr);
      g.add(box(.1,.012,.008,a,.04,.82,-.239));
      g.add(box(.34,1.25,.02,M.MAT_RAIN_GLASS,0,-.25,-.19));
      const pend = new T.Group(); pend.position.set(0,.25,-.2);
      pend.add(box(.018,.8,.018,a,0,-.42,0));
      const bob = cyl(.1,.1,.025,a,0,-.82,0,20); bob.rotation.x = Math.PI/2; pend.add(bob);
      g.add(pend); anim.pendulum = pend;
      g.add(tube([[-.28,1.12,0],[-.18,1.29,0],[0,1.19,0],[.18,1.29,0],[.28,1.12,0]],.045,'#3d2214'));
      break;
    }
    case 'fireplace': {
      const brick = M.MAT_AGED_BRICK;
      g.add(box(1.65,.25,.65,brick,0,-.55,0), box(.25,1.2,.5,m,-.65,0,0), box(.25,1.2,.5,m,.65,0,0),
            box(1.8,.18,.65,m,0,.62,0), box(1.1,1,.12,brick,0,.1,.2),
            box(1.05,.55,.12,M.MAT_BLACK_BAKELITE,0,-.25,-.1));
      for (const x of [-.65,.65]) panel(g,x,.05,-.26,.2,.9,m);
      const fl = new T.Group(); fl.position.set(0,-.3,-.18);
      for (const x of [-.3,0,.3]) {
        const q = new T.Mesh(new T.ConeGeometry(.12,.45,8), new T.MeshBasicMaterial({
          color: x===0 ? '#ffd166' : '#fb7c28', transparent:true, opacity:.88, toneMapped:false }));
        q.position.set(x,.14,0); fl.add(q);
      }
      g.add(fl); anim.flame = fl;
      const log = cyl(.07,.07,.8,M.MAT_BLACK_BAKELITE,0,-.45,-.18,10);
      log.rotation.z = Math.PI/2; g.add(log);
      g.add(tube([[-.7,.72,-.2],[-.2,.68,-.25],[.3,.7,-.22],[.7,.55,-.2]],.018,'#1d4ed8'));
      break;
    }
    case 'hutch': {
      const gl = M.MAT_RAIN_GLASS;
      g.add(box(1.9,1.1,.6,m,0,-.65,0), box(1.95,.1,.65,m,0,-.05,0), box(1.8,1.2,.08,m,0,.65,.2),
            box(.1,1.2,.6,m,-.85,.65,0), box(.1,1.2,.6,m,.85,.65,0), box(1.95,.12,.65,m,0,1.25,0));
      for (const x of [-.4,0,.4]) panel(g,x,-.65,-.31,.5,.8,m);
      for (const y of [.25,.75]) g.add(box(1.7,.04,.5,gl,0,y,0));
      for (const x of [-.6,-.3,0,.3,.6]) {
        g.add(cyl(.055,.07,.25,gl,x,.42,-.05,12));
        g.add(cyl(.022,.022,.09,M.MAT_BRASS,x,.58,-.05,8));
      }
      for (const x of [-.45,.45])
        g.add(cyl(.09,.09,.28,new T.MeshStandardMaterial({
          color:'#123a55', emissive:new T.Color('#38bdf8'), emissiveIntensity:1.3 }),x,1.45,0,16));
      break;
    }
    case 'roundtable':
      g.add(cyl(w/2,w/2,.08,m,0,h/2-.04,0,32), cyl(.07,.11,h-.14,m,0,0,0,14),
            cyl(.24,.28,.1,m,0,-h/2+.06,0,24));
      break;

    case 'worktable': {
      g.add(box(w,.1,d,m,0,h/2-.05,0), box(w*.8,.06,d*.8,m,0,-h*.2,0));
      legs(g,w,d,h,m,false);
      g.add(box(.45,.25,.35,M.MAT_BRUSHED_STEEL,0,-h*.28,0));
      for (const x of [-.3,.3]) {
        g.add(box(.42,.36,.32,M.MAT_BRUSHED_STEEL,x,h/2+.23,0));
        const sc = box(.34,.27,.01,M.SCREEN_CYAN,x,h/2+.23,-.17); sc.castShadow = false; g.add(sc);
      }
      break;
    }
    case 'sideboard': {
      g.add(box(1.5,.9,.55,m), box(1.56,.06,.6,m,0,.47,0));
      for (const x of [-.45,0,.45]) panel(g,x,0,-.285,.4,.65,m);
      g.add(box(.2,.12,.18,M.MAT_BLACK_BAKELITE,-.4,.55,0));
      for (let j = 0; j < 3; j++)
        g.add(box(.24,.035,.18,new T.MeshStandardMaterial({
          color:['#4b241b','#263a32','#5a4630'][j], roughness:.8 }),.35,.5+j*.037,0));
      break;
    }
    case 'banker': {
      g.add(cyl(.13,.16,.06,a,0,-h/2+.03,0,20), cyl(.022,.035,h*.6,a,0,-h*.12,0,10));
      const shade = new T.Mesh(new T.CylinderGeometry(.11,.11,.28,20,1,true,0,Math.PI), M.MAT_EMERALD_GLASS);
      shade.rotation.z = Math.PI/2; shade.rotation.y = Math.PI; shade.position.set(0,h*.33,0); g.add(shade);
      g.add(box(.28,.02,.16,M.MAT_EMERALD_GLASS,0,h*.26,0));
      break;
    }
    case 'floorlamp': case 'tablelamp': {
      g.add(cyl(.13,.16,.06,a,0,-h/2+.03,0,20), cyl(.022,.04,h*.62,a,0,-h*.12,0,10));
      if (i.geo === 'tablelamp') g.add(sph(.09,a,0,-h*.18,0));
      g.add(cyl(.12,.2,h*.32,M.MAT_PARCHMENT_SHADE,0,h*.3,0,24,true));
      g.add(cyl(.2,.2,.012,a,0,h*.14,0,24));
      break;
    }
    case 'holo': {
      const pl = box(w,h,.012,M.SCREEN_AMBER); pl.castShadow = false; g.add(pl);
      g.add(box(w*.7,.035,.12,M.MAT_BRUSHED_STEEL,0,-h/2-.05,.02));
      break;
    }
    case 'monitor': {
      g.add(box(w,h,.16,M.MAT_BRUSHED_STEEL));
      const sc = box(w*.88,h*.8,.01,M.SCREEN_CYAN,0,0,-.086); sc.castShadow = false; g.add(sc);
      g.add(box(.08,.16,.08,M.MAT_BRUSHED_STEEL,0,-h/2-.08,0),
            box(w*.6,.03,.2,M.MAT_BRUSHED_STEEL,0,-h/2-.16,0));
      break;
    }
    case 'wallmonitors': {
      const st = M.MAT_BRUSHED_STEEL;
      g.add(box(w,h*.45,.14,st,0,h*.25,0), box(w,h*.45,.14,st,0,-h*.25,0));
      const s1 = box(w*.9,h*.36,.01,M.SCREEN_CYAN,0,h*.25,-.076);
      const s2 = box(w*.9,h*.36,.01,M.SCREEN_MAP,0,-h*.25,-.076);
      s1.castShadow = s2.castShadow = false; g.add(s1,s2);
      break;
    }
    case 'server': {
      const st = M.MAT_BRUSHED_STEEL;
      for (const x of [-1,1]) for (const z of [-1,1]) g.add(box(.045,h,.045,st,x*w/2,0,z*d/2));
      for (let j = 0; j < 10; j++) {
        const y = -h/2+.15+j*.2;
        g.add(box(w*.9,.16,d*.9,st,0,y,0), box(.22,.06,.01,M.MAT_DARK_METAL_TILE,.15,y,-d*.46));
        for (let k = 0; k < 3; k++) {
          const led = box(.025,.025,.01,glow(k===2?'#22c55e':'#38bdf8'),-.2+k*.08,y,-d*.46);
          led.castShadow = false; anim.leds.push(led); g.add(led);
        }
      }
      break;
    }
    case 'console': {
      const st = M.MAT_BRUSHED_STEEL;
      g.add(box(.9,.7,.65,st,0,-.35,0));
      const top = box(.9,.7,.18,st,0,.25,.08); top.rotation.x = -.25; g.add(top);
      const sc = box(.72,.42,.015,M.SCREEN_CYAN,0,.3,-.02); sc.rotation.x = -.25; sc.castShadow = false; g.add(sc);
      const kb = box(.85,.08,.35,st,0,-.02,-.25); kb.rotation.x = .15; g.add(kb);
      for (let j = 0; j < 24; j++)
        g.add(box(.06,.025,.05,M.MAT_DARK_METAL_TILE,(j%8-3.5)*.09,.03,-.34+Math.floor(j/8)*.08));
      break;
    }
    case 'crate': {
      const st = M.MAT_BRUSHED_STEEL;
      g.add(box(w,h,d,st));
      for (const x of [-.25,-.1,.05,.2]) g.add(box(.025,h*.85,.025,st,x,0,-d/2-.012));
      const bar = box(.3,.04,.015,M.SCREEN_CYAN,0,h*.15,-d/2-.026); bar.castShadow = false; g.add(bar);
      g.add(box(.25,.05,.08,M.MAT_BLACK_BAKELITE,0,h/2+.025,0));
      if (i.id === 'CRATE_002')
        for (let j = 0; j < 4; j++)
          g.add(box(.3,.012,.22,new T.MeshStandardMaterial({ color:'#cfc7b2', roughness:.9 }),
                .05,h/2+.06+j*.014,.02));
      break;
    }
    case 'rug': {
      g.add(box(w,.02,d,m));
      for (const side of [-1,1]) for (let j = 0; j < 36; j++)
        g.add(box(.018,.008,.09,M.MAT_PARCHMENT_SHADE,(j-17.5)*w/36,0,side*(d/2+.045)));
      break;
    }
    case 'gallery': case 'art': {
      const fr = M.MAT_GILT_FRAME;
      const fs = i.geo === 'gallery'
        ? [[-.75,.3,.65,.55],[0,.35,.65,.65],[.75,.25,.6,.5],[-.45,-.4,.75,.5],[.45,-.4,.75,.5]]
        : [[0,0,w,h]];
      fs.forEach(([x,y,ww,hh],j) => {
        g.add(box(ww,hh,.08,fr,x,y,0));
        const cv = box(ww-.1,hh-.1,.012,M['ART_'+j],x,y,-.046); cv.castShadow = false; g.add(cv);
      });
      break;
    }
    case 'phone': {
      const bk = M.MAT_BLACK_BAKELITE;
      g.add(box(.24,.09,.2,bk), box(.22,.045,.055,bk,0,.1,0),
            sph(.045,bk,-.1,.08,0), sph(.045,bk,.1,.08,0));
      const dial = new T.Mesh(new T.TorusGeometry(.055,.012,8,24), M.MAT_BRASS);
      dial.rotation.x = Math.PI/2; dial.position.set(0,.05,-.04); g.add(dial);
      g.add(tube([[.1,.08,0],[.16,-.02,.08],[.12,-.06,.14],[.05,-.06,.1]],.008,'#111214'));
      break;
    }
    case 'cables': {
      g.add(tube([[.4,3.95,.4],[2,3.35,2],[4.5,3.25,4],[7,3.4,6],[8.7,3.9,7.5]],.045,'#151719'));
      g.add(tube([[8.7,3.95,.5],[7,3.3,2],[5,3.15,4],[3,3.35,6],[.4,3.95,7.5]],.028,'#7f1d1d'));
      g.add(tube([[.4,3.9,2],[2.5,3.45,3],[5,3.3,4],[7.5,3.5,5],[8.7,3.9,6]],.025,'#1e3a8a'));
      g.add(tube([[6.2,3.95,.55],[6.1,3.2,.6],[6.2,2.2,.55]],.05,'#151719'));
      g.add(tube([[8.65,3.95,5.5],[8.5,3.2,5.5],[8.65,2.65,5.5]],.04,'#151719'));
      break;
    }
    default: g.add(box(w,h,d,m));
  }
  return g;
}

export function buildItems(M: MatMap, root: T.Group) {
  const anim: Anim = { leds: [] }, groups = new Map<string, T.Group>();
  for (const i of ITEMS) {
    const g = buildItem(i,M,anim);
    g.position.set(i.x,i.y,i.z);
    g.rotation.order = 'XYZ';
    g.rotation.set(T.MathUtils.degToRad(i.rx ?? 0), T.MathUtils.degToRad(i.ry), 0);
    g.traverse(o => { o.userData.itemId = i.id; });
    groups.set(i.id,g); root.add(g);
  }
  return { anim, groups };
}