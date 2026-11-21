import {CoreLayer,followCore} from './layers.js';
import {WetFilm} from './film.js';

export const HAIR_SIZE=512, GEL_SIZE=256, MAX_HAIR_BEADS=64;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};

export function hairCoverage(confidence) { return smooth(.13,.79,confidence/255); }

export class PhotoHair {
 constructor(mask,rgba,region,faceSpan) {
  this.mask=mask;this.region=region;this.span=faceSpan/region.w;
  this.core=new CoreLayer(GEL_SIZE);
  this.beads=[];this.film=new WetFilm(GEL_SIZE);
  this.bytes=new Uint8Array(GEL_SIZE**2);this.field=new Float32Array(this.bytes.length);
  this.dirty=true;
  // The local image structure tensor estimates strand direction even for light hair.
  const side=64, slopes=new Float32Array(side*side);
  const gray=new Float32Array(mask.length);
  for(let i=0;i<gray.length;i++) gray[i]=.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];
  for(let y=0;y<side;y++)for(let x=0;x<side;x++) {
   let xx=0,yy=0,xy=0;
   for(let j=1;j<8;j+=2)for(let k=1;k<8;k+=2) {
    const px=clamp(8*x+k,1,510),py=clamp(8*y+j,1,510),i=py*HAIR_SIZE+px;
    const gx=gray[i+1]-gray[i-1],gy=gray[i+HAIR_SIZE]-gray[i-HAIR_SIZE];
    const w=mask[i]/255;xx+=gx*gx*w;yy+=gy*gy*w;xy+=gx*gy*w;
   }
   // Least-gradient axis, oriented downhill. Weak texture leaves gravity dominant.
   const angle=.5*Math.atan2(2*xy,xx-yy);
   const coherence=Math.hypot(xx-yy,2*xy)/(xx+yy+160);
   slopes[y*side+x]=clamp(-Math.sin(angle)/Math.max(.24,Math.cos(angle)),-1.25,1.25)*coherence;
  }
  this.slopes=slopes;
 }
 clear(){this.beads.length=0;this.film.clear();this.dirty=true;}
 gridAt(u,v) {
  if(u<0||u>1||v<0||v>1)return 0;
  return this.mask[Math.round(v*(HAIR_SIZE-1))*HAIR_SIZE+Math.round(u*(HAIR_SIZE-1))];
 }
 hit(u,v){return this.gridAt(u,v)>=88;}
 slope(u,v){
  const x=clamp(u*64-.5,0,62.999),y=clamp(v*64-.5,0,62.999),i=Math.floor(y)*64+Math.floor(x),fx=x%1,fy=y%1;
  const s=this.slopes;
  return (s[i]*(1-fx)+s[i+1]*fx)*(1-fy)+(s[i+64]*(1-fx)+s[i+65]*fx)*fy;
 }
 radius(volume){return this.span*.037*Math.cbrt(Math.min(12,volume));}
 attach(u,v,volume){
  const r=this.radius(volume);
  for(const b of this.beads){
   if(Math.hypot(u-b.u,v-b.v)<.9*(r+this.radius(b.volume))){
    b.volume+=volume;this.dirty=true;return;
   }
  }
  if(this.beads.length>=MAX_HAIR_BEADS){
   const smallest=this.beads.reduce((a,b)=>a.volume<b.volume?a:b);
   this.film.deposit(smallest.u,smallest.v,this.radius(smallest.volume),smallest.volume);
   this.beads.splice(this.beads.indexOf(smallest),1);
  }
  this.beads.push({u,v,coreU:u,coreV:v,volume,tip:false,neck:0});this.dirty=true;
 }
 advance(dt,viscosity,release,downhill=1){
  const capacity=1.02+.75*viscosity;
  for(const b of this.beads) {
   if(b.tip){
    if(b.volume<=capacity)continue;
    b.neck+=dt*(1.25+Math.min(4,b.volume/capacity-1)*2.3)/(.5+viscosity);
    if(b.neck>=1){
     const residue=.16*capacity, r=this.radius(b.volume);
     release(b.u,b.v+downhill*r*(1.3+2.4*Math.min(1,b.neck)),b.volume-residue);
     b.volume=residue;b.neck=0;this.dirty=true;
    }
    continue;
   }
   const excess=Math.max(0,b.volume*downhill-(.17+.29*viscosity));
   if(excess<.002)continue;
   const distance=dt*downhill*this.span*(.20+.48*(1-viscosity))*Math.min(2.4,Math.sqrt(excess));
   const steps=Math.max(1,Math.ceil(distance*HAIR_SIZE/1.5)),dy=distance/steps;
   for(let j=0;j<steps;j++){
    const oldU=b.u,oldV=b.v,dx=dy*this.slope(oldU,oldV),v=oldV+dy;
    // Remain on the hair; a side edge guides the drip, the lower edge holds it.
    const options=[oldU+dx,oldU,oldU+dy*.85,oldU-dy*.85];
    const u=options.find(x=>this.hit(x,v));
    if(u===undefined){b.tip=true;this.dirty=true;break;}
    const r=this.radius(b.volume);
    const kept=this.film.leaveTrack(oldU,oldV,u,v,r*.85,b.volume);
    b.volume-=kept;b.u=u;b.v=v;this.dirty=true;
   }
  }
  for(let i=this.beads.length-1;i>0;i--){
   const b=this.beads[i];
   for(let j=0;j<i;j++){
    const a=this.beads[j];
    if(Math.hypot(a.u-b.u,a.v-b.v)>.72*(this.radius(a.volume)+this.radius(b.volume)))continue;
    if(b.tip || (!a.tip&&b.v>a.v)){a.u=b.u;a.v=b.v;}
    const share=b.volume/(a.volume+b.volume);
    a.coreU+=(b.coreU-a.coreU)*share;a.coreV+=(b.coreV-a.coreV)*share;
    a.tip=a.tip||b.tip;a.neck=Math.max(a.neck,b.neck);a.volume+=b.volume;
    this.beads.splice(i,1);this.dirty=true;break;
   }
  }
  for(const b of this.beads)if(followCore(b,dt,this.radius(b.volume)))this.dirty=true;
 }
 paint(){
  if(!this.dirty)return false;
  this.dirty=false;this.film.copyHeight(this.field);this.core.begin(this.field);
  const stamp=(target,b,u,v,scale)=>{
   const r=Math.max(1.4,this.radius(b.volume)*GEL_SIZE)*scale,cx=u*(GEL_SIZE-1),cy=v*(GEL_SIZE-1);
   const rx=r*(b.tip?.92:.70),ry=r*(b.tip?1.04:1.65),slope=this.slope(b.u,b.v)*.65;
   const reach=rx+ry*Math.abs(slope);
   for(let y=clamp(Math.floor(cy-ry),0,GEL_SIZE-1);y<=Math.min(cy+ry,GEL_SIZE-1);y++){
    const dy=y-cy;
    for(let x=clamp(Math.floor(cx-reach),0,GEL_SIZE-1);x<=Math.min(cx+reach,GEL_SIZE-1);x++){
     const d=1-((x-cx-slope*dy)/rx)**2-(dy/ry)**2;
     if(d>0)target[y*GEL_SIZE+x]+=(.82+.28*Math.cbrt(b.volume))*d*d;
    }
   }
  }
  for(const b of this.beads){
   stamp(this.field,b,b.u,b.v,1);
   stamp(this.core.field,b,b.coreU,b.coreV,.88);
  }
  this.core.encode(.78);
  for(let i=0;i<this.field.length;i++)this.bytes[i]=255*this.field[i]/(.78+this.field[i]);
  return true;
 }
}
