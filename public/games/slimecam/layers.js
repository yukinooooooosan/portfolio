// Both phases share a bead's volume. The more viscous core follows its moving
// envelope with a short delay, bounded by the bead's own footprint.
export function followCore(bead, dt, radius) {
 const du=bead.coreU-bead.u,dv=bead.coreV-bead.v;
 const distance=Math.hypot(du,dv);
 if(distance===0)return false;
 const keep=distance<.00012?0:Math.min(Math.exp(-dt/.39),.56*radius/distance);
 bead.coreU=bead.u+du*keep;
 bead.coreV=bead.v+dv*keep;
 return true;
}

export class CoreLayer {
 constructor(size){
  this.field=new Float32Array(size*size);
  this.bytes=new Uint8Array(size*size);
 }
 begin(film){
  // A thin track is mostly clear. Thick, repeatedly wetted tracks retain more pigment.
  for(let i=0;i<film.length;i++)this.field[i]=film[i]*(.30+.86*film[i]);
 }
 encode(softness){
  for(let i=0;i<this.field.length;i++)this.bytes[i]=Math.round(255*this.field[i]/(softness+this.field[i]));
 }
}

export function smooth(a,b,v){
 const t=Math.max(0,Math.min(1,(v-a)/(b-a)));
 return t*t*(3-2*t);
}

export function mixture(coreRatio){
 return {
  clearWeight:smooth(0,.25,1-coreRatio),
  coreWeight:smooth(0,.35,coreRatio),
  threshold:.42*(1-coreRatio),
  strength:Math.sqrt(coreRatio)
 };
}

export function pigmentAt(height,mix){
 return mix.strength*smooth(mix.threshold,mix.threshold+.17,height);
}
