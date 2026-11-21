import {mixture,pigmentAt,smooth} from './layers.js';
import {SIZE} from './surface.js';
import {GEL_SIZE,hairCoverage} from './hair.js';

// All gel (including a flying or hanging drop) uses the same optical response.
function shade(out,photo,i,sample,rgb,nx,ny,nz,pigment,alpha){
 const lit=Math.max(0,-.43*nx+.63*ny+.65*nz);
 const rim=Math.pow(1-Math.min(1,nz),1.7);
 const rx=2*nz*nx,ry=2*nz*ny,rz=2*nz*nz-1;
 const glint=Math.pow(Math.max(0,-.43*rx+.61*ry+.67*rz),38);
 const soft=Math.pow(Math.max(0,.48*rx-.34*ry+.81*rz),12);
 const shine=255*((.93-.49*pigment)*glint+(.16-.07*pigment)*soft);
 const weight=alpha*Math.min(1,.60+.37*pigment+.26*glint);
 for(let j=0;j<3;j++){
  const clear=photo[sample*4+j]*(.93+.05*lit)+19+3*j+59*rim;
  const core=rgb[j]*(.64+.34*lit)+6.4*rim;
  const gel=clear+(core-clear)*pigment+shine;
  out[i*4+j]+=(gel-out[i*4+j])*weight;
 }
}

// The photo is static, so decode background, face UVs, depths and hair coverage once per projection.
export class CanvasRenderer{
 constructor(canvas,s){
  this.canvas=canvas;this.s=s;this.ctx=canvas.getContext('2d',{willReadFrequently:true,alpha:false});
  this.rgb=[154,246,31];this.opacity=.8;
  // Exporting renders the whole stage and allocates several buffers per pixel.
  this.maxExportPixels=1000000;
 }
 size(w,h,ratio,exporting=false){
  const scale=exporting?ratio:Math.min(1,720/Math.max(w,h));
  this.canvas.width=Math.max(1,Math.round(w*scale));this.canvas.height=Math.max(1,Math.round(h*scale));
  this.background=null;
 }
 setSource(media){this.media=media;this.background=null;}
 frame(){this.background=null;}
 alpha(value){this.opacity=value;}
 color(rgb){this.rgb=rgb;}
 prepare(w,h){
  const sim=this.s,frame=sim.source,ctx=this.ctx,n=w*h;
  ctx.fillStyle='#060606';ctx.fillRect(0,0,w,h);
  ctx.drawImage(this.media,frame.x*h,frame.y*h,frame.w*h,frame.h*h);
  this.background=ctx.getImageData(0,0,w,h);this.output=ctx.createImageData(w,h);
  this.faceUV=new Int32Array(n).fill(-1);this.depth=new Float32Array(n).fill(-Infinity);
  this.cover=new Uint8Array(n);this.hairUV=new Int32Array(n);
  this.height=new Uint8Array(n);this.pigment=new Uint8Array(n);
  if(sim.points){
   const {faces,uv}=sim.mesh;
   const p=sim.points.map(([x,y,z])=>[x*h,y*h,z]);
   for(const ids of faces){
    const [a,b,d]=ids.map(i=>p[i]),[u,v,t]=ids.map(i=>uv[i]);
    const x1=b[0]-a[0],y1=b[1]-a[1],x2=d[0]-a[0],y2=d[1]-a[1],det=x1*y2-y1*x2;
    if(Math.abs(det)<1e-8)continue;
    const xmin=Math.max(0,Math.floor(Math.min(a[0],b[0],d[0]))),xmax=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],d[0])));
    const ymin=Math.max(0,Math.floor(Math.min(a[1],b[1],d[1]))),ymax=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],d[1])));
    for(let y=ymin;y<=ymax;y++)for(let x=xmin;x<=xmax;x++){
     const dx=x+.5-a[0],dy=y+.5-a[1],j=(dx*y2-dy*x2)/det,k=(dy*x1-dx*y1)/det,l=1-j-k;
     if(Math.min(l,j,k)<0)continue;
     const i=y*w+x,z=l*a[2]+j*b[2]+k*d[2];if(z<=this.depth[i])continue;
     this.depth[i]=z;
     const tx=Math.round((l*u[0]+j*v[0]+k*t[0])*(SIZE-1)),ty=Math.round((l*u[1]+j*v[1]+k*t[1])*(SIZE-1));
     this.faceUV[i]=ty*SIZE+tx;
    }
   }
  }
  if(sim.hair){
   const r=sim.hairFrame(),x0=r.x*h,y0=r.y*h,width=r.w*h,height=r.h*h;
   for(let y=Math.max(0,Math.floor(y0));y<Math.min(h,y0+height);y++){
    const v=(y+.5-y0)/height;
    for(let x=Math.max(0,Math.floor(x0));x<Math.min(w,x0+width);x++){
     const u=(x+.5-x0)/width, i=y*w+x;
     const cover=hairCoverage(sim.hair.gridAt(u,v));if(!cover)continue;
     this.cover[i]=Math.round(255*cover);
     this.hairUV[i]=Math.round(v*(GEL_SIZE-1))*GEL_SIZE+Math.round(u*(GEL_SIZE-1));
    }
   }
  }
 }
 render(){
  const s=this.s,w=this.canvas.width,h=this.canvas.height;
  if(!s.source||!this.media)return;
  s.paint();s.hair?.paint();
  if(!this.background)this.prepare(w,h);
  const base=this.background.data,out=this.output.data,field=this.height,z=this.depth;
  out.set(base);
  const mix=mixture(s.coreRatio);
  if(this.lastRatio!==s.coreRatio){
   this.lastRatio=s.coreRatio;
   this.pigmentLUT=Uint8Array.from({length:256},(_,i)=>Math.round(255*pigmentAt(i/255,mix)));
  }
  const colorField=this.pigment,face=s.bytes,core=s.core.bytes,hair=s.hair;
  for(let i=0;i<field.length;i++){
   const uv=this.faceUV[i],huv=this.hairUV[i],cover=this.cover[i]/255;
   const shell=(uv<0?0:face[uv])*(1-cover)+(cover?hair.bytes[huv]*cover:0);
   const dense=(uv<0?0:core[uv])*(1-cover)+(cover?hair.core.bytes[huv]*cover:0);
   field[i]=Math.max(shell*mix.clearWeight,dense*mix.coreWeight);
   colorField[i]=this.pigmentLUT[Math.round(dense)];
  }
  const slopeScale=h*(s.faceWidth||.38)*.09/(2*255*.68),bend=h*(s.faceWidth||.38)*.014;
  for(let i=0;i<field.length;i++){
   if(field[i]<9)continue;
   const gx=((field[i-1]||0)-(field[i+1]||0))*slopeScale,gy=((field[i+w]||0)-(field[i-w]||0))*slopeScale;
   const inv=1/Math.hypot(gx,gy,1),nx=gx*inv,ny=gy*inv;
   const sample=Math.max(0,Math.min(w*h-1,i+Math.round(nx*bend)-w*Math.round(ny*bend)));
   shade(out,base,i,sample,this.rgb,nx,ny,inv,colorField[i]/255,this.opacity*smooth(.035,.135,field[i]/255));
  }
  for(const d of s.visualDrops()){
   const x=d.x*h,y=d.y*h,rx=Math.max(1,d.r*h),ry=rx*(d.stretch??(1.3+2*d.vy));
   for(let yy=Math.max(0,Math.floor(y-ry));yy<=Math.min(h-1,y+ry);yy++)for(let xx=Math.max(0,Math.floor(x-rx));xx<=Math.min(w-1,x+rx);xx++){
    const nx=(xx-x)/rx,ny=(yy-y)/ry,rr=nx*nx+ny*ny,i=yy*w+xx;if(rr>1)continue;
    const nz=Math.sqrt(1-rr),depth=d.z+d.r*nz;
    if(z[i]>depth)continue;
    const core=Math.max(0,Math.min(1,(nz-.23)*.9-.035*ny));
    const edge=Math.max(mix.clearWeight,mix.coreWeight*smooth(0,.12,core));
    const alpha=this.opacity*(depth<s.hairDepth?1-this.cover[i]/255:1)*edge;
    const normalScale=Math.hypot(nx,ny*rx/ry,nz);
    const normalX=nx/normalScale,normalY=-ny*rx/ry/normalScale,normalZ=nz/normalScale;
    const sample=Math.max(0,Math.min(w*h-1,i+Math.round(normalX*bend)-w*Math.round(normalY*bend)));
    shade(out,base,i,sample,this.rgb,normalX,normalY,normalZ,this.pigmentLUT[Math.round(255*core)]/255,alpha);
   }
  }
  this.ctx.putImageData(this.output,0,0);
 }
}
