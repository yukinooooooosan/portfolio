// One worker per photo. Cancelling a selection also stops any active inference.
export async function analyzePhoto(pixels,knownFace,signal) {
 signal.throwIfAborted();
 const worker=new Worker(new URL('vendor/cpu/recognizer.js',import.meta.url));
 let pending;
 const abort=()=>{worker.terminate();pending?.reject(new DOMException('Aborted','AbortError'));};
 signal.addEventListener('abort',abort,{once:true});
 function send(message,transfer=[]){
  return new Promise((resolve,reject)=>{pending={resolve,reject};worker.postMessage(message,transfer);});
 }
 worker.onmessage=e=>{const p=pending;pending=null;if(e.data.error)p?.reject(new Error(e.data.error));else p?.resolve(e.data);};
 worker.onerror=e=>pending?.reject(new Error(e.message));
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
 const w=pixels.naturalWidth||pixels.width,h=pixels.naturalHeight||pixels.height;
 try{
  await send({op:'init'});
  let points=knownFace;
  if(!points){
   const scale=Math.min(1,768/Math.max(w,h));
   canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
   ctx.drawImage(pixels,0,0,canvas.width,canvas.height);
   const buffer=ctx.getImageData(0,0,canvas.width,canvas.height).data.buffer;
   const result=await send({op:'face',w:canvas.width,h:canvas.height,buffer},[buffer]);
   points=result.points?.slice(0,468);
   if(!points||points.length!==468)return null;
  }
  const xs=points.map(p=>p[0]*w),ys=points.map(p=>p[1]*h);
  const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
  // A square head crop protects detail on distant faces and preserves strand angles.
  const side=Math.max(32,Math.min(Math.max(w,h),Math.max(2.85*(right-left),2.8*(bottom-top))));
  const origin=(c,size)=>size>=side?Math.max(0,Math.min(size-side,c-side/2)):(size-side)/2;
  const x=origin((left+right)/2,w),y=origin(top+.67*(bottom-top),h);
  canvas.width=canvas.height=512;
  ctx.fillStyle='#777';ctx.fillRect(0,0,512,512);
  ctx.drawImage(pixels,-x*512/side,-y*512/side,w*512/side,h*512/side);
  const rgba=ctx.getImageData(0,0,512,512).data;
  let mask;
  try{({mask}=await send({op:'hair',buffer:rgba.buffer}));}
  catch{signal.throwIfAborted();return {points,mask:null};}
  return {points,mask,rgba,region:{u:x/w,v:y/h,w:side/w,h:side/h},faceSpan:(right-left)/w};
 }finally{signal.removeEventListener('abort',abort);worker.terminate();}
}
