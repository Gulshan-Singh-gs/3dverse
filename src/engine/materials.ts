import * as T from 'three';
import { MATS } from '../data/roomLayout';
import { seeded } from './util';

export type MatMap = Record<string, T.MeshStandardMaterial>;

function surface(k: string) {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d')!, r = seeded(k.length * 97 + k.charCodeAt(4));
  x.fillStyle = MATS.find(m => m.id === k)?.color ?? '#555';
  x.fillRect(0, 0, 512, 512);

  if (k.includes('MAHOGANY')) {
    for (let i = 0; i < 240; i++) {
      const y = r() * 512;
      x.strokeStyle = `rgba(${120+r()*60},${55+r()*35},${25+r()*20},${.08+r()*.22})`;
      x.lineWidth = .5 + r() * 2; x.beginPath(); x.moveTo(0, y);
      for (let p = 0; p <= 512; p += 16) x.lineTo(p, y + Math.sin(p*.025+i)*4 + Math.sin(p*.007)*6);
      x.stroke();
    }
  } else if (k.includes('CONCRETE')) {
    for (let i = 0; i < 15000; i++) {
      const g = 45 + r() * 70;
      x.fillStyle = `rgba(${g},${g+2},${g+3},${r()*.18})`;
      x.fillRect(r()*512, r()*512, r()*3+.4, r()*3+.4);
    }
    x.strokeStyle = 'rgba(10,12,14,.4)'; x.lineWidth = 2;
    for (let y = 0; y < 512; y += 128) { x.beginPath(); x.moveTo(0,y); x.lineTo(512,y); x.stroke(); }
  } else if (k.includes('METAL_TILE')) {
    x.strokeStyle = '#0a0c0e'; x.lineWidth = 5;
    for (let i = 0; i <= 512; i += 128) {
      x.beginPath(); x.moveTo(i,0); x.lineTo(i,512); x.moveTo(0,i); x.lineTo(512,i); x.stroke();
    }
    for (let p = 12; p < 512; p += 128) for (let q = 12; q < 512; q += 128)
      for (const [dx,dy] of [[0,0],[104,0],[0,104],[104,104]]) {
        x.fillStyle = '#5b6167'; x.beginPath(); x.arc(p+dx, q+dy, 2.6, 0, 7); x.fill();
      }
  } else if (k.includes('LEATHER')) {
    for (let i = 0; i < 14000; i++) {
      x.fillStyle = `rgba(150,110,80,${r()*.1})`; x.fillRect(r()*512, r()*512, 1.3, 1.3);
    }
    x.strokeStyle = 'rgba(8,5,4,.42)'; x.lineWidth = 2;
    for (let i = -512; i < 1024; i += 64) {
      x.beginPath(); x.moveTo(i,0); x.lineTo(i+512,512); x.moveTo(i,0); x.lineTo(i-512,512); x.stroke();
    }
    for (let p = 0; p <= 512; p += 64) for (let q = 0; q <= 512; q += 64) {
      x.fillStyle = '#0f0a07'; x.beginPath(); x.arc(p,q,3,0,7); x.fill();
    }
  } else if (k.includes('DAMASK')) {
    x.strokeStyle = 'rgba(200,180,110,.42)'; x.lineWidth = 2;
    for (let p = 32; p < 512; p += 64) for (let q = 32; q < 512; q += 64) {
      x.save(); x.translate(p,q);
      for (let j = 0; j < 6; j++) { x.rotate(Math.PI/3); x.beginPath(); x.ellipse(0,12,5,13,0,0,7); x.stroke(); }
      x.restore();
    }
  } else if (k.includes('BRICK')) {
    x.fillStyle = '#26201e'; x.fillRect(0,0,512,512);
    for (let q = 0; q < 512; q += 42) for (let p = -64; p < 512; p += 96) {
      x.fillStyle = `rgb(${72+r()*38},${40+r()*22},${28+r()*16})`;
      x.fillRect(p + (q/42%2 ? 48 : 0) + 3, q+3, 90, 36);
    }
  } else if (k.includes('PERSIAN')) {
    x.fillStyle = '#5e201e'; x.fillRect(0,0,512,512);
    x.fillStyle = '#172b3a'; x.fillRect(16,16,480,480);
    x.strokeStyle = '#b89a62'; x.lineWidth = 5; x.strokeRect(26,26,460,460);
    x.fillStyle = '#762b25'; x.fillRect(46,46,420,420);
    x.save(); x.translate(256,256);
    for (let j = 0; j < 16; j++) {
      x.rotate(Math.PI/8); x.strokeStyle = j%2 ? '#d0b27b' : '#172b3a'; x.lineWidth = 3;
      x.beginPath(); x.ellipse(0,78,17,54,0,0,7); x.stroke();
    }
    x.restore();
    x.fillStyle = '#172b3a'; x.beginPath();
    for (let j = 0; j < 16; j++) {
      const a = j*Math.PI/8, rr = j%2 ? 60 : 112;
      const px = 256+Math.cos(a)*rr, py = 256+Math.sin(a)*rr;
      j ? x.lineTo(px,py) : x.moveTo(px,py);
    }
    x.closePath(); x.fill(); x.strokeStyle = '#c6a66c'; x.lineWidth = 4; x.stroke();
  } else {
    for (let i = 0; i < 800; i++) {
      x.strokeStyle = `rgba(230,235,240,${r()*.07})`; x.lineWidth = .6;
      const y = r()*512; x.beginPath(); x.moveTo(0,y); x.lineTo(512, y+r()*2); x.stroke();
    }
  }
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4;
  return t;
}

function screenTex(amber = false, map = false) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 320;
  const x = c.getContext('2d')!;
  x.fillStyle = amber ? '#170d02' : '#031016'; x.fillRect(0,0,512,320);
  const col = amber ? '#f5ad32' : '#48d9ff';
  x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 1; x.globalAlpha = .22;
  for (let i = 0; i < 512; i += 32) { x.beginPath(); x.moveTo(i,0); x.lineTo(i,320); x.stroke(); }
  for (let i = 0; i < 320; i += 32) { x.beginPath(); x.moveTo(0,i); x.lineTo(512,i); x.stroke(); }
  x.globalAlpha = 1; x.font = '14px monospace';
  x.fillText(amber ? 'NOCTURNE // SPATIAL TELEMETRY' : 'NODE 07 // SYSTEM NOMINAL', 18, 26);
  if (map) {
    x.globalAlpha = .75;
    for (let i = 0; i < 11; i++) { x.beginPath(); x.ellipse(58+i*39, 155+Math.sin(i)*46, 27, 54, .2, 0, 7); x.stroke(); }
    x.globalAlpha = 1;
    for (let i = 0; i < 26; i++) {
      const px = 28+(i*83)%456, py = 62+(i*47)%215;
      x.beginPath(); x.arc(px,py,3,0,7); x.fill();
    }
  } else {
    for (let i = 0; i < 12; i++) {
      x.globalAlpha = .45 + (i%3)*.2;
      x.fillText(`${String(i+1).padStart(2,'0')}  ${amber?'MESH.SOLVE':'SYS.CHECK '}  ${(98.4-i*.17).toFixed(2)}  [ OK ]`, 18, 58+i*19);
    }
    x.globalAlpha = 1; x.strokeRect(342,64,146,146);
    for (let i = 0; i < 5; i++) x.strokeRect(352+i*10, 74+i*10, 126-i*20, 126-i*20);
  }
  for (let y = 0; y < 320; y += 4) { x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(0,y,512,1); }
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}

function artTex(i: number) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 384;
  const x = c.getContext('2d')!, r = seeded(90+i);
  const g = x.createLinearGradient(0,0,0,384);
  g.addColorStop(0,'#7a7660'); g.addColorStop(.5,'#b29a68'); g.addColorStop(1,'#283525');
  x.fillStyle = g; x.fillRect(0,0,512,384);
  if (i % 3 === 0) {
    x.fillStyle = '#2a211b'; x.beginPath(); x.ellipse(258,225,96,146,0,0,7); x.fill();
    x.fillStyle = '#9c7654'; x.beginPath(); x.ellipse(258,132,47,61,0,0,7); x.fill();
    x.fillStyle = '#171719'; x.fillRect(168,248,180,136);
  } else {
    for (let l = 0; l < 4; l++) {
      x.fillStyle = ['#6b7360','#57624c','#3f4c36','#273623'][l];
      x.beginPath(); x.moveTo(0,384);
      for (let p = 0; p <= 512; p += 24) x.lineTo(p, 168+l*46+Math.sin(p*.012+l)*34+r()*20);
      x.lineTo(512,384); x.fill();
    }
    x.fillStyle = '#202b1c';
    for (let j = 0; j < 8; j++) {
      const px = r()*512, py = 195+r()*130;
      x.fillRect(px,py,5,66); x.beginPath(); x.ellipse(px,py,21,52,0,0,7); x.fill();
    }
  }
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}

function rainTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d')!, r = seeded(44);
  x.fillStyle = '#ffffff'; x.fillRect(0,0,512,512);
  for (let i = 0; i < 260; i++) {
    const px = r()*512, py = r()*512, l = 5+r()*58;
    x.strokeStyle = `rgba(0,0,0,${.25+r()*.55})`; x.lineWidth = .6+r()*1.6;
    x.beginPath(); x.moveTo(px,py); x.lineTo(px-2,py+l); x.stroke();
  }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
}

export function buildMaterials(): MatMap {
  const m: MatMap = {};
  const textured = ['MAT_CONCRETE_PANEL','MAT_DARK_METAL_TILE','MAT_CARVED_MAHOGANY',
    'MAT_TUFTED_LEATHER','MAT_DAMASK_FABRIC','MAT_PERSIAN_WOOL','MAT_BRASS',
    'MAT_BRUSHED_STEEL','MAT_AGED_BRICK'];

  for (const d of MATS) {
    const tx = textured.includes(d.id) ? surface(d.id) : null;
    if (tx) {
      const s = d.id.includes('METAL_TILE') ? 4 : d.id.includes('DAMASK') ? 3 : 2;
      tx.repeat.set(s, s);
    }
    const mat = new T.MeshStandardMaterial({
      color: tx ? '#ffffff' : d.color,
      roughness: d.rough, metalness: d.metal, map: tx,
      transparent: d.trans > 0,
      opacity: d.trans > 0 ? Math.max(.12, 1 - d.trans) : 1,
      side: d.cat === 'glass' || d.id === 'MAT_AMBER_HOLO' ? T.DoubleSide : T.FrontSide,
      depthWrite: d.cat !== 'glass' && d.id !== 'MAT_AMBER_HOLO'
    });
    if (d.cat === 'emissive') {
      mat.emissive = new T.Color(d.color); mat.emissiveIntensity = 1.7; mat.toneMapped = false;
    }
    if (d.id === 'MAT_PARCHMENT_SHADE') { mat.emissive = new T.Color('#ffb86b'); mat.emissiveIntensity = .5; }
    if (d.id === 'MAT_EMERALD_GLASS')   { mat.emissive = new T.Color('#0f7a35'); mat.emissiveIntensity = .6; }
    m[d.id] = mat;
  }

  m.SCREEN_CYAN = m.MAT_CYAN_EMISSIVE.clone();
  m.SCREEN_CYAN.map = screenTex(); m.SCREEN_CYAN.emissiveMap = m.SCREEN_CYAN.map;
  m.SCREEN_CYAN.opacity = 1; m.SCREEN_CYAN.transparent = false;

  m.SCREEN_MAP = m.SCREEN_CYAN.clone();
  m.SCREEN_MAP.map = screenTex(false, true); m.SCREEN_MAP.emissiveMap = m.SCREEN_MAP.map;

  m.SCREEN_AMBER = m.MAT_AMBER_HOLO.clone();
  m.SCREEN_AMBER.map = screenTex(true); m.SCREEN_AMBER.emissiveMap = m.SCREEN_AMBER.map;
  m.SCREEN_AMBER.opacity = .74;

  for (let i = 0; i < 5; i++) m['ART_'+i] = new T.MeshStandardMaterial({ map: artTex(i), roughness: .88 });

  m.RAIN_WINDOW = m.MAT_RAIN_GLASS.clone();
  m.RAIN_WINDOW.alphaMap = rainTex(); m.RAIN_WINDOW.opacity = .3;
  m.RAIN_WINDOW.transparent = true; m.RAIN_WINDOW.depthWrite = false;
  return m;
}

export function disposeMaterials(m: MatMap) {
  Object.values(m).forEach(q => {
    q.map?.dispose(); q.emissiveMap?.dispose(); q.alphaMap?.dispose(); q.dispose();
  });
}