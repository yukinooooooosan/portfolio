const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));

// Coordinates are in the decoded, EXIF-oriented image, before any downsampling.
export function cropRect(width,height,aspect=width/height,zoom=1,x=.5,y=.5){
 if(![width,height,aspect,zoom,x,y].every(Number.isFinite)||width<=0||height<=0||aspect<=0)throw new Error('Invalid crop');
 const w=Math.min(width,height*aspect)/clamp(zoom,1,4),h=w/aspect;
 return {x:(width-w)*clamp(x,0,1),y:(height-h)*clamp(y,0,1),w,h};
}

export function cropPixels(image,rect){
 const scale=Math.min(1,2048/Math.max(rect.w,rect.h));
 const output=document.createElement('canvas');
 output.width=Math.max(1,Math.round(rect.w*scale));output.height=Math.max(1,Math.round(rect.h*scale));
 const ctx=output.getContext('2d',{alpha:false});
 ctx.fillStyle='#263120';ctx.fillRect(0,0,output.width,output.height);
 ctx.drawImage(image,rect.x,rect.y,rect.w,rect.h,0,0,output.width,output.height);
 return output;
}

export function createPhotoCropper(){
 const $=id=>document.getElementById(id),dialog=$('photoCrop'),canvas=$('cropPreview');
 const zoom=$('cropZoom'),x=$('cropX'),y=$('cropY'),aspect=$('cropAspect');
 let active=null,drag=null,view=null;
 function rectangle(){
  const {image}=active,w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
  return cropRect(w,h,aspect.value==='original'?w/h:Number(aspect.value),zoom.valueAsNumber,x.valueAsNumber/100,y.valueAsNumber/100);
 }
 function cancelDrag(){
  if(!drag)return;
  const id=drag.id;drag=null;
  if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
 }
 function draw(){
  if(!active)return;
  const r=rectangle(),image=active.image,W=image.naturalWidth||image.width,H=image.naturalHeight||image.height;
  x.disabled=W-r.w<.01;y.disabled=H-r.h<.01;
  for(const [input,id,text] of [[zoom,'cropZoomOut',Math.round(zoom.valueAsNumber*100)+'%'],[x,'cropXOut',Math.round(x.valueAsNumber-50)+'%'],[y,'cropYOut',Math.round(y.valueAsNumber-50)+'%']]){
   $(id).value=text;input.setAttribute('aria-valuetext',text);
   input.style.setProperty('--fill',((input.valueAsNumber-Number(input.min))/(Number(input.max)-Number(input.min))*100)+'%');
  }
  const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);
  if(box.width<2||box.height<2)return;
  canvas.width=Math.max(1,Math.round(box.width*ratio));canvas.height=Math.max(1,Math.round(box.height*ratio));
  const cw=canvas.width,ch=canvas.height,scale=Math.min((cw-24)/r.w,(ch-24)/r.h),w=r.w*scale,h=r.h*scale,left=(cw-w)/2,top=(ch-h)/2;
  const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#08090a';ctx.fillRect(0,0,cw,ch);
  const preview=active.preview,kx=preview.width/W,ky=preview.height/H;
  ctx.drawImage(preview,r.x*kx,r.y*ky,r.w*kx,r.h*ky,left,top,w,h);
  ctx.strokeStyle='#ffa363';ctx.lineWidth=2;ctx.strokeRect(left,top,w,h);
  ctx.strokeStyle='#ffffff40';ctx.lineWidth=1;ctx.beginPath();
  for(const part of [1/3,2/3]){ctx.moveTo(left+w*part,top);ctx.lineTo(left+w*part,top+h);ctx.moveTo(left,top+h*part);ctx.lineTo(left+w,top+h*part);}
  ctx.stroke();view={scale:scale*box.width/cw,rect:r,W,H};
 }
 function reset(){cancelDrag();zoom.value='1';x.value=y.value='50';aspect.value='original';draw();}
 function finish(error,pixels){
  if(!active)return;
  cancelDrag();const job=active;active=null;view=null;
  job.signal.removeEventListener('abort',job.abort);
  dialog.close();
  if(error)job.reject(error);else job.resolve(pixels);
 }
 const cancelled=()=>new DOMException('Crop cancelled','AbortError');
 $('cancelCrop').addEventListener('click',()=>finish(cancelled()));
 dialog.addEventListener('cancel',e=>{e.preventDefault();finish(cancelled());});
 $('applyCrop').addEventListener('click',()=>{
  if(!active)return;
  try{const pixels=cropPixels(active.image,rectangle()),selection={aspect:aspect.value,zoom:zoom.value,x:x.value,y:y.value};finish(null,{pixels,selection});}
  catch(error){finish(error);}
 });
 $('resetCrop').addEventListener('click',reset);
 for(const input of [zoom,x,y,aspect])input.addEventListener('input',()=>{cancelDrag();draw();});
 canvas.addEventListener('pointerdown',e=>{
  if(!active||drag||!e.isPrimary||e.button!==0||!view)return;
  e.preventDefault();drag={id:e.pointerId,cx:e.clientX,cy:e.clientY,x:x.valueAsNumber,y:y.valueAsNumber,...view};
  canvas.setPointerCapture(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=drag.W-drag.rect.w,dy=drag.H-drag.rect.h;
  if(dx>.01)x.value=String(clamp(drag.x-(e.clientX-drag.cx)/drag.scale/dx*100,0,100));
  if(dy>.01)y.value=String(clamp(drag.y-(e.clientY-drag.cy)/drag.scale/dy*100,0,100));
  draw();
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(drag?.id===e.pointerId)cancelDrag();});
 canvas.addEventListener('keydown',e=>{
  if(!active)return;
  const steps={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
  if(!steps)return;
  e.preventDefault();const step=e.shiftKey?10:2;
  if(!x.disabled)x.value=String(clamp(x.valueAsNumber+steps[0]*step,0,100));
  if(!y.disabled)y.value=String(clamp(y.valueAsNumber+steps[1]*step,0,100));draw();
 });
 new ResizeObserver(()=>{cancelDrag();draw();}).observe(canvas);
 return {edit(image,signal,selection=null){
  signal.throwIfAborted();
  if(active)finish(cancelled());
  return new Promise((resolve,reject)=>{
   // Keep dragging cheap even with large phone photos. Confirm still samples the original.
   const W=image.naturalWidth||image.width,H=image.naturalHeight||image.height,k=Math.min(1,1536/Math.max(W,H));
   const preview=document.createElement('canvas');preview.width=Math.max(1,Math.round(W*k));preview.height=Math.max(1,Math.round(H*k));
   preview.getContext('2d',{alpha:false}).drawImage(image,0,0,preview.width,preview.height);
   const abort=()=>finish(cancelled());
   active={image,preview,signal,resolve,reject,abort};signal.addEventListener('abort',abort,{once:true});
   reset();
   if(selection){aspect.value=selection.aspect;zoom.value=selection.zoom;x.value=selection.x;y.value=selection.y;}
   dialog.showModal();draw();
  });
 }};
}
