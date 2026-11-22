import {topology} from './topology.js';
import {CoreLayer,followCore} from './layers.js';
import {MAX_HAIR_BEADS} from './hair.js';
import {WetFilm} from './film.js';
import {triangles as faces,uv} from './face-data.js';
export {faces,uv};
export const SIZE=256;
const MAX_SHOTS = 12;
const SHOT_PARTS = [1, .63, .32];
export const MAX_DRAWN_DROPS = 90 + 2*20 + MAX_SHOTS*SHOT_PARTS.length + 2*MAX_HAIR_BEADS;
const FLIGHT_TIME = .46;
const REPEAT_INTERVAL = .17;
const faceMesh={...topology(faces,uv),kind:'face'};
function bary(x,y,a,b,c){
 const ex=b[0]-a[0],ey=b[1]-a[1],fx=c[0]-a[0],fy=c[1]-a[1],det=ex*fy-ey*fx;
 if(Math.abs(det)<1e-10)return null;
 const u=((x-a[0])*fy-(y-a[1])*fx)/det,v=(ex*(y-a[1])-ey*(x-a[0]))/det;
 return [1-u-v,u,v];
}
const mixPoint=(vertices,face,w,d)=>vertices[face[0]][d]*w[0]+vertices[face[1]][d]*w[1]+vertices[face[2]][d]*w[2];
const footprint = volume => Math.min(.145, .060 * Math.cbrt(volume));
const dropRadius = volume => .031 * Math.cbrt(volume);
function syncLocation(bead,{faces,uv}) {
 const f = faces[bead.f];
 bead.u = mixPoint(uv, f, bead.w, 0);
 bead.v = mixPoint(uv, f, bead.w, 1);
}
function setVolume(bead, volume) {
 bead.volume = volume;
 bead.r = footprint(volume)*bead.uvScale;
}
function absorb(a,b,mesh) {
 const {faces,uv,adj}=mesh;
 // Follow the UV segment across adjacent triangles to keep the merged center on the skin.
 const share = b.volume / (a.volume + b.volume);
 a.coreU+=(b.coreU-a.coreU)*share;a.coreV+=(b.coreV-a.coreV)*share;
 const u = a.u + (b.u-a.u)*share, v = a.v + (b.v-a.v)*share;
 let f = a.f;
 for (let step = 0; step < 10; step++) {
  const [p,q,r] = faces[f].map(i => uv[i]);
  const w = bary(u,v,p,q,r);
  if (!w) break;
  const smallest = Math.min(...w);
  if (smallest >= -1e-7) { a.f=f; a.w=w; syncLocation(a,mesh); break; }
  f = adj[f][w.indexOf(smallest)];
  if (f < 0) break;
 }
 setVolume(a, a.volume + b.volume);
 a.age = Math.max(a.age, b.age);
}
export class Surface{
 constructor(){
  this.points=null;this.aspect=1;this.anchors=[];this.film=new WetFilm(SIZE);this.falling=[];this.hanging=[];this.field=new Float32Array(SIZE*SIZE);this.bytes=new Uint8Array(SIZE*SIZE);this.dirty=true;
  this.hair=null;this.hairDepth=0;this.mesh=faceMesh;
  this.setTargetTilt(90);this.setPhotoTilt(90);
  this.core=new CoreLayer(SIZE);this.coreRatio=.60;
  this.shots=[];this.aim={x:.5,y:.5};this.firing=false;this.nextShot=0;
  this.viscosity=.7;this.amount=.6;this.time=0;this.pouring=false;this.nextPour=0;
 }
 setTargetTilt(degrees){
  if(!Number.isFinite(degrees))return;
  const angle=Math.max(0,Math.min(90,degrees)), radians=angle*Math.PI/180;
  // The camera faces the target: +y points toward its bottom and +z toward the camera.
  this.targetGravityY=angle===90?1:Math.sin(radians);
  this.targetGravityZ=angle===90?0:-Math.cos(radians);
 }
 setPhotoTilt(degrees){
  if(!Number.isFinite(degrees))return;
  const angle=Math.max(0,Math.min(90,degrees)), radians=angle*Math.PI/180;
  this.photoGravityY=angle===90?1:Math.sin(radians);
  this.photoGravityZ=angle===90?0:-Math.cos(radians);
 }
 get gravityY(){return this.mesh.kind==='target'?this.targetGravityY:this.photoGravityY;}
 get gravityZ(){return this.mesh.kind==='target'?this.targetGravityZ:this.photoGravityZ;}
 get flowViscosity(){
  // A core-rich mixture resists flow more than clear gel at the same viscosity setting.
  return this.viscosity+(this.coreRatio-.60)*(.22+.16*(1-this.viscosity))*(this.coreRatio>.60?1-this.viscosity:this.viscosity);
 }
 clear(){this.hair?.clear();this.anchors.length=this.falling.length=this.hanging.length=this.shots.length=0;this.firing=this.pouring=false;this.film.clear();this.dirty=true;}
 setFrame(points,source,aspect,mesh=faceMesh){
  const previous=this.fallingFrame;
  if(previous && previous.mesh===mesh && previous.w>0 && previous.h>0 && source.w>0 && source.h>0){
   const sx=source.w/previous.w,sy=source.h/previous.h;
   const flip=!!previous.mirror!==!!source.mirror;
   // Free drops use scene coordinates; carry them with the same source image on resize.
   for(const d of this.falling){
    const u=(d.x-previous.x)/previous.w;
    d.x=source.x+(flip?1-u:u)*source.w;
    d.y=source.y+(d.y-previous.y)*sy;d.z*=sx;d.r*=sx;
    d.vx*=flip?-sx:sx;d.vy*=sy;d.vz*=sx;
    if(d.pour){
     const u=(d.pour.x-previous.x)/previous.w;
     d.pour.x=source.x+(flip?1-u:u)*source.w;
     d.pour.y=source.y+(d.pour.y-previous.y)*sy;d.pour.z*=sx;
     d.pour.startY=source.y+(d.pour.startY-previous.y)*sy;d.pour.frontZ*=sx;
    }
   }
  }
  // Keep a snapshot even while landmarks are unavailable or the source object is mutated.
  this.fallingFrame={...source,mesh};
  this.mesh=mesh;this.aspect=aspect;this.source=source;
  this.points=points?points.map(([x,y,z])=>[(source.mirror?1-x:x)*source.w+source.x,y*source.h+source.y,-z*source.w]):null;
  if(!this.points)return;
  this.minDepth=Math.min(...this.points.map(p=>p[2]));
  this.faceWidth=mesh.referenceWidth?mesh.referenceWidth*source.w:Math.hypot(...this.points[454].map((q,i)=>q-this.points[234][i]));
  this.hairDepth=mesh.kind==='target' ? .004*source.w : Math.max(...this.points.map(p=>p[2]))+.006;
  // Cache candidates for the static photo; a burst tests only the triangles near its aim.
  this.bins=Array.from({length:32*32},()=>[]);
  for(let i=0;i<mesh.faces.length;i++){
   const p=mesh.faces[i].map(j=>this.points[j]);
   const xs=p.map(v=>this.bin(v[0]/aspect)),ys=p.map(v=>this.bin(v[1]));
   for(let y=Math.min(...ys);y<=Math.max(...ys);y++)
    for(let x=Math.min(...xs);x<=Math.max(...xs);x++)this.bins[y*32+x].push(i);
  }
 }
 bin(n){return Math.max(0,Math.min(31,Math.floor(n*32)));}
 hit(x,y){
  let hit=null,z=-Infinity;if(!this.points)return null;
  const {faces}=this.mesh;
  for(const i of this.bins[this.bin(y)*32+this.bin(x/this.aspect)]){
   const [a,b,c]=faces[i].map(j=>this.points[j]);if(x<Math.min(a[0],b[0],c[0])||x>Math.max(a[0],b[0],c[0])||y<Math.min(a[1],b[1],c[1])||y>Math.max(a[1],b[1],c[1]))continue;
   const w=bary(x,y,a,b,c);if(w&&Math.min(...w)>=-1e-5){const depth=w[0]*a[2]+w[1]*b[2]+w[2]*c[2];if(depth>z){z=depth;hit={f:i,w,z};}}
  }return hit;
 }
 hairFrame() {
  const f=this.source,r=this.hair.region;
  return {x:f.x+r.u*f.w,y:f.y+r.v*f.h,w:r.w*f.w,h:r.h*f.h};
 }
 hairHit(x,y) {
  if(this.hair){
   const r=this.hairFrame(),u=(x-r.x)/r.w,v=(y-r.y)/r.h;
   if(this.hair.hit(u,v))return {hair:true,u,v,z:this.hairDepth};
  }
  return null;
 }
 visibleHit(x,y) {
  if(this.mesh.kind==='target')return this.hit(x,y)||this.hairHit(x,y);
  return this.hairHit(x,y)||this.hit(x,y);
 }
 land(hit,volume) {
  if(hit?.hair)this.hair.attach(hit.u,hit.v,volume);
  else this.attach(hit,volume);
 }
 releaseHair(u,v,volume) {
  const r=this.hairFrame(),x=r.x+u*r.w,y=r.y+v*r.h;
  const below=this.visibleHit(x,y);
  if(below&&!below.hair){this.attach(below,volume);return;}
  // Cross an air gap below a lock and let the drop catch a lower cheek.
  this.drop(x,y,this.hairDepth,volume,true);
  const drop=this.falling.at(-1);drop.vy=.08*this.gravityY;drop.vz=.08*this.gravityZ;drop.vx=0;drop.fromHair=true;
 }
 contacts(a,b,reach) {
  const {faces,nearby}=this.mesh;
  if ((a.u-b.u)**2+(a.v-b.v)**2>reach*reach || !nearby[a.f].has(b.f)) return false;
  const fa=faces[a.f], fb=faces[b.f];
  let distanceSquared=0;
  for (let axis=0;axis<3;axis++) {
   distanceSquared+=(mixPoint(this.points,fa,a.w,axis)-mixPoint(this.points,fb,b.w,axis))**2;
  }
  return distanceSquared <= (1.45*(this.mesh.referenceWidth?this.source.w:this.faceWidth)*reach)**2;
 }
 attach(hit, volume) {
  if (!hit || volume <= 0) return;
  const bead = {f:hit.f, w:hit.w.slice(), age:0, uvScale:this.mesh.referenceWidth||1};
  syncLocation(bead,this.mesh);
  bead.coreU=bead.u;bead.coreV=bead.v;
  setVolume(bead, volume);
  this.dirty = true;
  if (this.feedPendant(bead)) return;
  for (const other of this.anchors) {
   if (this.contacts(bead, other, .77*(bead.r+other.r))) { absorb(other,bead,this.mesh); return; }
  }
  // On a saturated scene keep incoming liquid, releasing the oldest bead into free fall.
  if (this.anchors.length >= 144) {
   const old = this.anchors.shift(), f = this.mesh.faces[old.f];
   this.drop(mixPoint(this.points,f,old.w,0), mixPoint(this.points,f,old.w,1),
    mixPoint(this.points,f,old.w,2), old.volume, false);
  }
  this.anchors.push(bead);
 }
 splash(x,y) {
  const h=this.visibleHit(x,y), volume=.38+1.12*this.amount;
  if (!h) { this.drop(x,y,0,volume,true); return false; }
  this.splat(h,x,y,volume,this.amount);
  return true;
 }
 splat(h,x,y,volume,amount) {
  if(h.hair){this.hair.attach(h.u,h.v,volume);return;}
  const reach = (this.faceWidth||.38) * footprint(volume);
  const count = 3 + Math.round(amount*3);
  let center = volume;
  for (let k=0;k<count;k++) {
   const angle=Math.random()*2*Math.PI, dist=reach*(.60+.48*Math.random());
   const spot=this.visibleHit(x+Math.cos(angle)*dist,y+Math.sin(angle)*dist);
   if (spot) { const part=volume*.18/count; this.land(spot,part); center-=part; }
  }
  this.attach(h,center);
 }
 setAim(x,y) {
  this.aim.x=Math.max(0,Math.min(1,x));
  this.aim.y=Math.max(0,Math.min(1,y));
 }
 launch() {
  if (this.shots.length>=MAX_SHOTS) return;
  const {x,y}=this.aim;
  const hit=this.visibleHit(x*this.aspect,y);
  this.shots.push({x,y,age:0,volume:.58+1.45*this.amount,amount:this.amount,
   depth:hit?.z??0,width:this.faceWidth||.38,bend:(Math.random()-.5)*.09,miss:false});
 }
 startFiring() {
  if (this.firing) return;
  this.firing=true;
  this.launch();
  this.nextShot=this.time+.26;
 }
 advanceShots(dt) {
  if (this.firing && this.time>=this.nextShot) {
   this.launch(); this.nextShot+=REPEAT_INTERVAL;
  }
  for (let i=this.shots.length-1;i>=0;i--) {
   const shot=this.shots[i];
   shot.age+=dt;
   if (shot.age<FLIGHT_TIME) continue;
   if (!shot.miss) {
    // Aim is screen-fixed. Test against the face at arrival, even if it moved after launch.
    const x=shot.x*this.aspect, hit=this.visibleHit(x,shot.y);
    if (hit) {
     this.splat(hit,x,shot.y,shot.volume,shot.amount);
     this.shots.splice(i,1);
     continue;
    }
    shot.miss=true;
   }
   if (shot.age>=FLIGHT_TIME+.21) this.shots.splice(i,1);
  }
 }
 appendFlyingGel(result,shot) {
  const age=shot.age/FLIGHT_TIME;
  for (let i=0;i<SHOT_PARTS.length;i++) {
   const t=Math.max(0,age-i*.065);
   const travel=1-(1-Math.min(1,t))**1.6;
   const arc=4*travel*(1-travel);
   const past=Math.max(0,t-1);
   const x=.5+(shot.x-.5)*(travel+.18*past);
   const y=1.015+(shot.y-1.015)*(travel+.18*past)-.06*arc;
   const radius=shot.width*dropRadius(shot.volume)*(1+3.7*(1-travel))*SHOT_PARTS[i];
   result.push({x:x*this.aspect+shot.bend*arc,y:y+i*.006*(1-travel),
    z:shot.depth+.75*(1-travel)-.22*past,
    r:Math.max(.0002,radius*(1-Math.min(.99,past*2.15))),stretch:1.1+.23*arc,vy:0});
  }
 }
 drop(x,y,z,volume,canHit) {
  if (this.falling.length>=90) this.falling.shift();
  const speed=canHit?.26:.09;
  this.falling.push({x,y,z,volume,r:(this.faceWidth||.38)*dropRadius(volume),
   vy:speed*this.gravityY,vz:speed*this.gravityZ,vx:(Math.random()-.5)*.022,canHit});
 }
 stepAnchor(a,dt){
  const {faces,adj}=this.mesh;
  const wet = this.film.saturation(a.u,a.v);
  // Static adhesion pins a small bead. Wet skin and extra volume overcome it.
  const threshold = (.73 + .80*this.flowViscosity) * (1 - .45*wet);
  if(a.volume<=threshold)return false;
  const mobility=this.faceWidth*(.065+.43*(1-this.flowViscosity)**1.4);
  const gy=this.gravityY,gz=this.gravityZ;
  let remain=dt,exit=false,previous=-1;
  for(let n=0;n<9&&remain>1e-5;n++){
   const ids=faces[a.f],p=this.points[ids[0]],q=this.points[ids[1]],r=this.points[ids[2]];
   const ex=q[0]-p[0],ey=q[1]-p[1],ez=q[2]-p[2],fx=r[0]-p[0],fy=r[1]-p[1],fz=r[2]-p[2];
   const ee=ex*ex+ey*ey+ez*ez,ef=ex*fx+ey*fy+ez*fz,ff=fx*fx+fy*fy+fz*fz,det=ee*ff-ef*ef;
   if(det<1e-14)break;

   // Project gravity into the local tangent plane. Convex objects drain outward when level.
   const driveE=gy*ey+gz*ez, driveF=gy*fy+gz*fz;
   const du=(ff*driveE-ef*driveF)/det, dv=(ee*driveF-ef*driveE)/det;
   const slope=Math.sqrt(Math.max(0,Math.min(1,du*driveE+dv*driveF)));
   const load=a.volume*(this.mesh.kind==='target'?Math.sqrt(slope):gy+(1-gy)*Math.sqrt(slope));
   if(load<=threshold)break;
   const speed=mobility*Math.min(3.6,Math.sqrt(load/threshold-1));
   const u=du*speed,v=dv*speed,vel=[-u-v,u,v];
   let travel=remain,k=-1;
   for(let j=0;j<3;j++)if(vel[j]<-1e-8){const t=-a.w[j]/vel[j];if(t>=-1e-6&&t<travel){travel=Math.max(0,t);k=j;}}
   for(let j=0;j<3;j++)a.w[j]=Math.max(0,a.w[j]+vel[j]*travel);
   if(k<0)break;
   const next=adj[a.f][k];
   if(next<0){
    exit=true;break;
   }
   // Both surface gradients may point into the same crease. Carry gravity along its edge.
   if(next===previous){
    const j=(k+1)%3,l=(k+2)%3,start=this.points[ids[j]],end=this.points[ids[l]];
    const length2=(end[0]-start[0])**2+(end[1]-start[1])**2+(end[2]-start[2])**2;
    a.w[l]=Math.max(0,Math.min(1,a.w[l]+(gy*(end[1]-start[1])+gz*(end[2]-start[2]))*speed*(remain-travel)/Math.max(1e-10,length2)));
    a.w[j]=1-a.w[l];a.w[k]=0;break;
   }
   previous=a.f;const prev=a.w;a.w=faces[next].map(id=>ids.includes(id)?prev[ids.indexOf(id)]*.9999:.0001);a.f=next;remain-=travel;
  }return exit;
 }
 // In our coordinates +y points down. The normal sign flips for the mirrored camera.
 support(a, margin=0) {
  if(this.mesh.kind==='target')return null;
  const {faces}=this.mesh;
  const [p,q,r] = faces[a.f].map(i=>this.points[i]);
  const ex=q[0]-p[0], ey=q[1]-p[1], ez=q[2]-p[2];
  const fx=r[0]-p[0], fy=r[1]-p[1], fz=r[2]-p[2];
  const nx=ey*fz-ez*fy, ny=ez*fx-ex*fz, nz=ex*fy-ey*fx;
  const down=(ny*this.gravityY+nz*this.gravityZ)*(this.source.mirror?1:-1)/Math.max(1e-10,Math.hypot(nx,ny,nz));
  if (Math.abs(a.u-.5)<.062 && a.v>.398 && a.v<.469 && down>.34-margin) return 'nose';
  if (a.v<.13 && Math.abs(a.u-.5)<.23 && down>.38-margin) return 'chin';
  return null;
 }
 feedPendant(a) {
  for (const pool of this.hanging) {
   if (this.contacts(a,pool,.75*a.r+Math.min(.085,.032+.36*pool.r))) {
    // Root stays attached to the same material point as more liquid enters it.
    setVolume(pool,pool.volume+a.volume);
    return true;
   }
  }
  return false;
 }
 hang(a,site) {
  if (this.feedPendant(a)) return;
  if (this.hanging.length>=20) this.release(this.hanging.shift());
  this.hanging.push({...a,w:a.w.slice(),site,neck:0});
 }
 hangPoint(a) {
  const f=this.mesh.faces[a.f], radius=this.faceWidth*dropRadius(a.volume);
  const load=Math.min(1,a.volume/this.holdingVolume(a));
  return {x:mixPoint(this.points,f,a.w,0),y:mixPoint(this.points,f,a.w,1),
   z:mixPoint(this.points,f,a.w,2),radius,length:radius*(.30+1.1*load+3.6*a.neck)};
 }
 holdingVolume(a) {
  return (a.site==='nose'?1.40:1.70) + 1.05*this.flowViscosity;
 }
 // At a shared seam, wet the first visible fibers directly below the plaque.
 catchTassel(bead){
  if(!this.hair)return false;
  const f=this.mesh.faces[bead.f],x=mixPoint(this.points,f,bead.w,0),y=mixPoint(this.points,f,bead.w,1);
  for(let offset=.002;offset<=.008;offset+=.002){
   const hit=this.hairHit(x,y+offset*this.source.h);
   if(hit){this.land(hit,bead.volume);return true;}
  }
  return false;
 }
 release(a,volume=a.volume) {
  const p=this.hangPoint(a);
  const y=p.y+p.length*this.gravityY,z=p.z+p.length*this.gravityZ;
  if(this.mesh.kind==='target'){
   const hair=this.hairHit(p.x,y);
   if(hair){this.land(hair,volume);return;}
   this.drop(p.x,y,z,volume,true);
   this.falling.at(-1).hairOnly=true;
  }else this.drop(p.x,y,z,volume,false);
 }
 emitPour() {
   this.nextPour=this.time+.070;
   const x=this.aim.x*this.aspect,y=this.aim.y,z=this.visibleHit(x,y)?.z??0;
   const frontZ=Math.max(z,this.hairDepth||0,...(this.points||[]).map(p=>p[2]))+.1*(this.source?.w||1);
   this.drop(x,0,frontZ,.20+1.1*this.amount,true);
   const d=this.falling.at(-1),startY=-2*d.r;
   const duration=Math.max(.3,Math.min(1,Math.sqrt(2*(y-startY)/2.5)));
   d.y=startY;d.vx=d.vy=d.vz=0;
   // Fall down the screen in front of the subject; collide only at the intended point.
   d.pour={x,y,z,startY,frontZ,duration,remaining:duration};
 }
 update(dt) {
  this.time+=dt;
  this.advanceShots(dt);
  this.hair?.advance(dt,this.flowViscosity,(u,v,volume)=>this.releaseHair(u,v,volume),this.gravityY);
  if(this.pouring&&this.time>=this.nextPour) {
   this.emitPour();
  }
  for(let i=this.falling.length-1;i>=0;i--) {
   const d=this.falling[i],x0=d.x,y0=d.y,z0=d.z;
   if(d.pour){
    const p=d.pour,step=Math.min(dt,p.remaining);
    p.remaining-=step;
    const progress=1-Math.max(0,p.remaining)/p.duration;
    d.x=p.x;d.y=p.startY+(p.y-p.startY)*progress*progress;
    d.z=p.z+(p.frontZ-p.z)*Math.min(1,(1-progress)/.15);
    d.vy=2*(p.y-p.startY)*progress/p.duration;
    if(p.remaining>1e-9)continue;
    d.x=p.x;d.y=p.y;d.z=p.z;delete d.pour;
    const hit=this.points&&this.visibleHit(d.x,d.y);
    if(hit){this.falling.splice(i,1);this.land(hit,d.volume);}
    else d.canHit=false; // A background aim must not paint a different spot below it.
    continue;
   }
   d.vy+=dt*.95*this.gravityY;d.vz+=dt*.95*this.gravityZ;
   d.y+=dt*d.vy;d.z+=dt*d.vz;d.x+=dt*d.vx;
   let hit=null;
   if(d.canHit&&this.points) for(let j=1;j<=3&&!hit;j++){
    const t=j/3,atX=x0+(d.x-x0)*t,atY=y0+(d.y-y0)*t,atZ=z0+(d.z-z0)*t;
    const surface=d.hairOnly?this.hairHit(atX,atY):this.visibleHit(atX,atY);
    if(!surface||(d.fromHair&&surface.hair))continue;
    if(atZ>surface.z+d.r||atZ<surface.z-d.r)continue;
    hit=surface;
   }
   if(hit) { this.falling.splice(i,1);this.land(hit,d.volume); }
   else if(d.y>1.2 || d.z<(this.points?this.minDepth:0)-.18*(this.source?.w||1))this.falling.splice(i,1);
  }
  if(!this.points)return;
  // Turning a nose or chin upward brings a supported bead back onto the skin.
  for (let i=this.hanging.length-1;i>=0;i--) {
   const pool=this.hanging[i];
   if (pool.site!=='edge' && !this.support(pool,.16)) {
    this.hanging.splice(i,1); this.anchors.push(pool); this.dirty=true;
   }
  }
  for(let i=this.anchors.length-1;i>=0;i--) {
   const a=this.anchors[i], oldU=a.u, oldV=a.v;
   a.age+=dt;
   if (a.age<.30) this.dirty=true;
   let site=this.support(a);
   if (!site) {
    const atEdge=this.stepAnchor(a,dt);
    syncLocation(a,this.mesh);
    if (Math.abs(a.u-oldU)+Math.abs(a.v-oldV)>1e-8) {
     const retained=this.film.leaveTrack(oldU,oldV,a.u,a.v,a.r,a.volume);
     setVolume(a,Math.max(0,a.volume-retained));
     this.dirty=true;
    }
    if(followCore(a,dt,a.r))this.dirty=true;
    if(atEdge && this.mesh.objects?.[a.f]==='board' && this.catchTassel(a)){
     this.anchors.splice(i,1);this.dirty=true;continue;
    }
    site=this.support(a) || (atEdge?'edge':null);
   }
   if (site) { this.hang(a,site); this.anchors.splice(i,1); this.dirty=true; }
   else if (this.feedPendant(a)) { this.anchors.splice(i,1); this.dirty=true; }
  }
  // Beads deposited far apart may first touch after flowing down the face.
  for (let i=this.anchors.length-1;i>0;i--) {
   const bead=this.anchors[i];
   for (let j=0;j<i;j++) {
    const other=this.anchors[j];
    if (this.contacts(bead,other,.77*(bead.r+other.r))) {
     absorb(other,bead,this.mesh);this.anchors.splice(i,1);this.dirty=true;break;
    }
   }
  }
  for (const a of this.hanging) {
   const capacity=this.holdingVolume(a), excess=a.volume/capacity-1;
   if (excess<=0) continue;
   a.neck=Math.min(1,a.neck+dt*(.9+Math.min(3,excess)*2.8)/(.58+this.flowViscosity));
   if (a.neck>=1) {
    const residue=.14*capacity;
    this.release(a,a.volume-residue);
    setVolume(a,residue); a.neck=0;
   }
  }
 }
 visualDrops() {
  if(!this.hair?.beads.length && !this.shots.length && (!this.points||!this.hanging.length)) return this.falling;
  const result=this.falling.slice();
  if(this.points) for(const a of this.hanging) {
   const t=this.hangPoint(a), r=t.radius*(.58-.47*a.neck);
   result.push({x:t.x,y:t.y+t.length*.48*this.gravityY,z:t.z+t.length*.48*this.gravityZ,r,stretch:.55+this.gravityY*t.length/(2*r),vy:0},
    {x:t.x,y:t.y+t.length*this.gravityY,z:t.z+t.length*this.gravityZ,r:t.radius,stretch:1.10+.16*a.neck,vy:0});
  }
  if(this.hair){
   const frame=this.hairFrame();
   for(const b of this.hair.beads){
    if(!b.tip)continue;
    const radius=frame.w*this.hair.radius(b.volume)*.72;
    const length=radius*(.60+3.7*b.neck+Math.min(1,b.volume/1.7));
    const x=frame.x+b.u*frame.w,y=frame.y+b.v*frame.h,z=this.hairDepth+.001;
    const thread=radius*(.47-.35*Math.min(1,b.neck));
    result.push({x,y:y+length*.50*this.gravityY,z:z+length*.50*this.gravityZ,r:thread,stretch:.45+this.gravityY*length/(2*thread),vy:0},
     {x,y:y+length*this.gravityY,z:z+length*this.gravityZ,r:radius,stretch:1.12,vy:0});
   }
  }
  for(const shot of this.shots) this.appendFlyingGel(result,shot);
  return result;
 }
 paint(){
  if(!this.dirty)return false;this.dirty=false;const grid=this.field;this.film.copyHeight(grid);this.core.begin(grid);
  function stamp(target,u,v,r,amp){
   const cx=u*(SIZE-1),cy=v*(SIZE-1),rx=r*SIZE,ry=rx*.91;
   for(let y=Math.max(0,Math.ceil(cy-ry));y<=Math.min(SIZE-1,cy+ry);y++){const yy=((y-cy)/ry)**2;
    for(let x=Math.max(0,Math.ceil(cx-rx));x<=Math.min(SIZE-1,cx+rx);x++){const d=1-yy-((x-cx)/rx)**2;if(d>0)target[y*SIZE+x]+=amp*d*d;}
   }
  }
  for(const a of this.anchors) {
   const radius=a.r*(.64+.36*Math.min(1,a.age/.24));
   const amp=.72+.32*Math.cbrt(a.volume);
   if(radius>0){
    stamp(grid,a.u,a.v,radius,amp);
    stamp(this.core.field,a.coreU,a.coreV,radius*.89,amp*1.12);
   }
  }
  for(let i=0;i<grid.length;i++)this.bytes[i]=Math.round(255*grid[i]/(.85+grid[i]));
  this.core.encode(.85);
  return true;
 }
}
