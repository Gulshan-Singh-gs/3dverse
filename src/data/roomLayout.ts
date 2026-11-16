
// Source of truth: user-supplied Cyberpunk_Traditional_Study_3D JSON.
// Metres, degrees XYZ, origin = south-west interior floor corner.
export type Item = {
  id: string; name: string; category: string;
  w: number; h: number; d: number;
  x: number; y: number; z: number;
  ry: number; rx?: number;
  mat: string; accent?: string; geo: string;
  details: string[]; conf: number; views: string[]; note?: string;
};
export type Mat = {
  id: string; name: string; cat: string; color: string;
  rough: number; metal: number; trans: number; texture: string; conf: number;
};

export const ROOM = {
  w: 9, h: 4.2, d: 8, area: 72, vol: 302.4, conf: .84,
  origin: 'South-west interior floor corner',
  type: 'Executive Study / Cyber-Antique Office'
};

const M = (id:string,name:string,cat:string,color:string,rough:number,
           metal:number,trans:number,texture:string,conf:number):Mat =>
  ({id,name,cat,color,rough,metal,trans,texture,conf});

export const MATS: Mat[] = [
M('MAT_CONCRETE_PANEL','Board-formed concrete','concrete','#4a4d50',.82,.08,0,'Cast seams, pitting, damp staining',.95),
M('MAT_DARK_METAL_TILE','Bolted steel decking','metal','#1e2124',.45,.85,0,'Beveled plates, corner rivets',.92),
M('MAT_CARVED_MAHOGANY','Carved mahogany','wood','#3d2214',.38,.05,0,'Red-brown grain, scroll relief, satin varnish',.96),
M('MAT_TUFTED_LEATHER','Espresso Chesterfield leather','leather','#2c1d16',.42,.04,0,'Diamond tufting, pebble grain',.94),
M('MAT_DAMASK_FABRIC','Olive-gold floral brocade','fabric','#6b674c',.85,.02,0,'Faded botanical tapestry weave',.89),
M('MAT_PERSIAN_WOOL','Crimson & indigo Persian wool','fabric','#6e2420',.9,0,0,'Medallion, borders, knotted pile',.95),
M('MAT_BRASS','Tarnished antique brass','metal','#b59449',.32,.9,0,'Radial brushing, micro-scratches',.91),
M('MAT_EMERALD_GLASS','Emerald cased glass','glass','#16a34a',.12,0,.45,'Green transmission, warm glow',.95),
M('MAT_BRUSHED_STEEL','Gunmetal chassis steel','metal','#383e45',.38,.88,0,'Brushed grain, perforations',.92),
M('MAT_CYAN_EMISSIVE','Cyan telemetry phosphor','emissive','#38bdf8',.15,.1,0,'Code, diagnostics, status LEDs',.94),
M('MAT_AMBER_HOLO','Amber holographic projection','emissive','#f59e0b',.1,0,.72,'Additive wireframe, scanlines',.92),
M('MAT_RAIN_GLASS','Rain-streaked plate glass','glass','#a5b4fc',.18,.05,.88,'Droplets and water streaks',.93),
M('MAT_AGED_BRICK','Soot-darkened hearth brick','masonry','#633b2d',.92,0,0,'Aged mortar, fire staining',.88),
M('MAT_GILT_FRAME','Aged gilt frame','metal','#9b7b3e',.4,.72,0,'Gilding over carved timber',.88),
M('MAT_OIL_CANVAS','Classical oil canvas','art','#665c42',.86,0,0,'Pastoral landscapes, portraits',.86),
M('MAT_BLACK_BAKELITE','Black Bakelite','polymer','#111214',.26,.08,0,'Polished telephone housing',.88),
M('MAT_RUBBER_CABLE','Industrial rubber cable','polymer','#151719',.72,.05,0,'Black, red and blue insulation',.94),
M('MAT_PARCHMENT_SHADE','Warm pleated parchment','fabric','#e7c99d',.8,0,.12,'Pleated diffusing shade',.9)];

const I = (id:string,name:string,category:string,w:number,h:number,d:number,
           x:number,y:number,z:number,ry:number,mat:string,geo:string,
           details:string[],conf:number,views:string[],accent?:string,
           rx=0,note?:string):Item =>
  ({id,name,category,w,h,d,x,y,z,ry,rx,mat,accent,geo,details,conf,views,note});

export const ITEMS: Item[] = [
I('DESK_001','Carved mahogany partners desk','furniture',2.3,.8,1.15,5.5,.4,5.4,-15,'MAT_CARVED_MAHOGANY','desk',['Ornate relief carvings','Data cables across surface'],.95,['IMAGE_001','IMAGE_002','IMAGE_004'],'MAT_BRASS'),
I('CHAIR_001','Tufted executive swivel chair','furniture',.75,1.15,.75,5.7,.58,6.2,165,'MAT_TUFTED_LEATHER','chair',['Dark brown tufted leather','Transient occupant excluded'],.88,['IMAGE_001','IMAGE_002'],'MAT_CARVED_MAHOGANY'),
I('CHAIR_002','Floral brocade wingback armchair','furniture',.85,1.12,.88,3.4,.56,4.6,42,'MAT_DAMASK_FABRIC','wing',['Olive-gold upholstery','Carved wood trim'],.9,['IMAGE_001','IMAGE_003','IMAGE_004'],'MAT_CARVED_MAHOGANY',0,'UNC_003: anchored on rug facing desk.'),
I('SOFA_001','West-wall Chesterfield sofa','furniture',2.2,.82,.95,.75,.41,5,90,'MAT_TUFTED_LEATHER','sofa',['Diamond button tufting','Brass nailhead trim'],.94,['IMAGE_001','IMAGE_004'],'MAT_BRASS'),
I('SOFA_002','North-window Chesterfield sofa','furniture',2.25,.82,.95,3.3,.41,7.1,180,'MAT_TUFTED_LEATHER','sofa',['Beneath panoramic window'],.92,['IMAGE_001','IMAGE_004'],'MAT_BRASS'),
I('BOOKCASE_001','Library bookcase with cyber deck','furniture',1.85,2.65,.52,8.65,1.325,5.5,-90,'MAT_CARVED_MAHOGANY','bookcase',['Leather-bound books','Embedded router'],.93,['IMAGE_001','IMAGE_002','IMAGE_003'],'MAT_BRUSHED_STEEL'),
I('CLOCK_001','Swan-neck grandfather clock','furniture',.62,2.35,.38,8.72,1.175,6.85,-90,'MAT_CARVED_MAHOGANY','clock',['Roman numeral dial','Glass pendulum door'],.91,['IMAGE_001','IMAGE_002','IMAGE_003'],'MAT_BRASS',0,'UNC_001: clock → bookcase → fireplace → door.'),
I('FIREPLACE_001','Carved timber & brick hearth','architecture',1.65,1.45,.55,8.7,.725,3.4,-90,'MAT_CARVED_MAHOGANY','fireplace',['Active wood fire','Mantel cables'],.9,['IMAGE_002','IMAGE_003'],'MAT_AGED_BRICK'),
I('HUTCH_001','South-west glazed bar hutch','furniture',1.9,2.45,.6,.45,1.225,1.6,90,'MAT_CARVED_MAHOGANY','hutch',['Glassware and decanters','Blue stasis canisters'],.89,['IMAGE_004'],'MAT_RAIN_GLASS'),
I('CREDENZA_001','South-wall carved sideboard','furniture',1.5,.9,.55,3.2,.45,.35,0,'MAT_CARVED_MAHOGANY','sideboard',['Rotary telephone','Stacked books'],.86,['IMAGE_003']),
I('TABLE_001','Round pedestal side table','furniture',.65,.68,.65,.55,.34,3.55,0,'MAT_CARVED_MAHOGANY','roundtable',['Lamp and phone'],.91,['IMAGE_001','IMAGE_004']),
I('TABLE_002','Cyber workstation side table','furniture',1.25,.76,.65,.45,.38,2.85,90,'MAT_CARVED_MAHOGANY','worktable',['Dual CRT monitors','Storage crate'],.87,['IMAGE_004'],'MAT_BRUSHED_STEEL'),
I('RUG_001','Crimson & navy Persian rug','decor',4.4,.02,3.4,4.3,.01,5.3,-15,'MAT_PERSIAN_WOOL','rug',['Medallion motif','Fringed edges'],.95,['IMAGE_001','IMAGE_002','IMAGE_003','IMAGE_004']),
I('SERVER_RACK_001','42U industrial mainframe rack','electronics',.8,2.15,.9,6.2,1.075,.55,0,'MAT_BRUSHED_STEEL','server',['Cyan status LEDs','Overhead umbilicals'],.92,['IMAGE_003'],'MAT_CYAN_EMISSIVE'),
I('CONSOLE_001','Retro-cyber tactical terminal','electronics',.95,1.45,.7,4.8,.725,.5,0,'MAT_BRUSHED_STEEL','console',['Telemetry screen','Mechanical keypad'],.9,['IMAGE_003'],'MAT_CYAN_EMISSIVE'),
I('CRATE_001','Armoured power case — east','electronics',.75,.48,.52,8.1,.24,4.5,-85,'MAT_BRUSHED_STEEL','crate',['Cyan charge bars','Hardwired to desk'],.91,['IMAGE_001','IMAGE_002','IMAGE_003'],'MAT_CYAN_EMISSIVE'),
I('CRATE_002','Armoured power case — south-east','electronics',.75,.48,.52,7.1,.24,.8,10,'MAT_BRUSHED_STEEL','crate',['Paper dossiers','Server tether'],.89,['IMAGE_003'],'MAT_CYAN_EMISSIVE'),
I('LAMP_001','Emerald banker’s lamp','lighting',.28,.38,.22,6.1,.99,5.1,-20,'MAT_BRASS','banker',['Green cased-glass shade'],.96,['IMAGE_001','IMAGE_002','IMAGE_004'],'MAT_EMERALD_GLASS'),
I('LAMP_002','North-west brass floor lamp','lighting',.48,1.65,.48,.65,.825,7.25,0,'MAT_BRASS','floorlamp',['Pleated fabric shade'],.93,['IMAGE_001','IMAGE_004'],'MAT_PARCHMENT_SHADE'),
I('LAMP_003','West side-table brass lamp','lighting',.35,.58,.35,.55,.97,3.55,0,'MAT_BRASS','tablelamp',['Warm ambient glow'],.92,['IMAGE_001','IMAGE_004'],'MAT_PARCHMENT_SHADE'),
I('DISPLAY_HOLO_001','Amber holographic terminal','electronics',.65,.42,.05,5.5,1.05,5.55,165,'MAT_AMBER_HOLO','holo',['Amber wireframe UI'],.91,['IMAGE_001','IMAGE_002','IMAGE_004'],undefined,-18),
I('MONITOR_DESK_001','Desk telemetry flatscreen','electronics',.52,.48,.18,4.9,1.04,5.35,140,'MAT_BRUSHED_STEEL','monitor',['Cyan diagnostics'],.92,['IMAGE_001','IMAGE_002','IMAGE_004'],'MAT_CYAN_EMISSIVE'),
I('WALL_MONITORS_SOUTH','Dual tactical wall displays','electronics',1.25,1.15,.14,4.8,2.35,.1,0,'MAT_BRUSHED_STEEL','wallmonitors',['Schematic screen','Global node map'],.91,['IMAGE_003'],'MAT_CYAN_EMISSIVE'),
I('ART_GALLERY_WEST','Gilt-framed classical paintings','decor',2.4,1.45,.08,.06,2.25,4.8,90,'MAT_GILT_FRAME','gallery',['5 portraits and landscapes'],.9,['IMAGE_004'],'MAT_OIL_CANVAS'),
I('ART_MANTEL_001','Landscape above fireplace','decor',1.35,.95,.08,8.94,2.55,3.4,-90,'MAT_GILT_FRAME','art',['Pastoral landscape'],.91,['IMAGE_002','IMAGE_003'],'MAT_OIL_CANVAS'),
I('PHONE_001','Black Bakelite rotary telephone','prop',.24,.16,.22,5.3,.88,5.15,25,'MAT_BLACK_BAKELITE','phone',['Coiled handset cord'],.88,['IMAGE_001','IMAGE_002','IMAGE_004'],'MAT_BRASS'),
I('CABLES_OVERHEAD_001','Suspended conduit bundles','infrastructure',7.5,.85,6.5,4.5,3.65,4,0,'MAT_RUBBER_CABLE','cables',['Black, red and blue swags'],.94,['IMAGE_001','IMAGE_002','IMAGE_003','IMAGE_004'])];

export const PRESETS = [
{id:'cinematic',label:'Cinematic',p:[7.6,3.1,1.4] as [number,number,number],t:[4.3,1.25,5.1] as [number,number,number]},
{id:'front',label:'Front',p:[4.5,2.2,.65] as [number,number,number],t:[4.5,1.5,5.5] as [number,number,number]},
{id:'back',label:'Back',p:[4.5,2.3,7.55] as [number,number,number],t:[4.5,1.35,3] as [number,number,number]},
{id:'left',label:'Left',p:[.55,2.1,4] as [number,number,number],t:[6,1.3,4] as [number,number,number]},
{id:'right',label:'Right',p:[8.45,2.1,4] as [number,number,number],t:[3,1.3,4] as [number,number,number]},
{id:'top',label:'Plan',p:[4.5,11.5,4.01] as [number,number,number],t:[4.5,0,4] as [number,number,number]}];

export const REFS = [
{id:'IMAGE_001',label:'North-west panorama',p:[1.6,1.55,1.8] as [number,number,number],t:[4.5,1.35,6.45] as [number,number,number],fov:72,regions:['North window','West seating','Centre desk','NE bookcase']},
{id:'IMAGE_002',label:'East wall & hearth',p:[2.2,1.55,3.2] as [number,number,number],t:[7.8,1.35,5.4] as [number,number,number],fov:70,regions:['Window edge','Centre desk','East bookcase','Fireplace']},
{id:'IMAGE_003',label:'Entrance & servers',p:[2.5,1.55,5.8] as [number,number,number],t:[7,1.25,1.75] as [number,number,number],fov:72,regions:['East fireplace','Entrance door','South rack','South console']},
{id:'IMAGE_004',label:'Gallery & hutch',p:[6.8,1.55,2.2] as [number,number,number],t:[1.8,1.35,5.85] as [number,number,number],fov:72,regions:['SW hutch','West gallery','West sofa','North window']}];

export const NOTES = [
{title:'UNC_001 · East-wall ordering',body:'IMAGE_002 places the clock north of the bookcase; IMAGE_003 shifts it between bookcase and door. North→south order retained: clock → bookcase → fireplace → door.',res:'Conservative fixed layout'},
{title:'UNC_002 · Optional hearth side table',body:'A small round lamp table appears beside the fireplace in IMAGE_002 but is absent in IMAGE_003.',res:'Omitted as movable prop'},
{title:'UNC_003 · Wingback position',body:'The wingback drifts between facing the desk and sitting near the server rack.',res:'Anchored on rug facing desk'},
{title:'UNC_004 · Camera intrinsics',body:'No EXIF exists. 24 mm-equivalent wide angle (70–72° FOV) inferred from perspective convergence.',res:'Marked estimated'},
{title:'Metric scale',body:'All dimensions estimated from standard furniture and architectural proportions — not surveyed.',res:'±10–15% tolerance'},
{title:'Transient occupant',body:'The seated human in IMAGE_001 / IMAGE_002 is a transient character, not fixed geometry.',res:'Excluded from model'},
{title:'Exterior cityscape',body:'Neon skyline and flying vehicles are environment backdrop outside WIN_001.',res:'Procedural backdrop'}];

export const LIGHTS = {
  sky:{color:'#6b8cae',intensity:3.2,kelvin:7200},
  led:{color:'#ffedd5',intensity:2.4,kelvin:3200},
  banker:{color:'#4ade80',intensity:1.8,kelvin:4200},
  warm:{color:'#fed7aa',kelvin:2700},
  fire:{color:'#fb923c',intensity:2.1,kelvin:2100},
  screens:{color:'#38bdf8',intensity:1.1,kelvin:8500},
  ambient:{color:'#28323c',intensity:.45}
};