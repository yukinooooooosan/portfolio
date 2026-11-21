// Decode in the browser so EXIF orientation is applied to the same pixels used by the detector and renderer.
export async function readPhoto(file){
 const url=URL.createObjectURL(file);
 const image=new Image();
 try{
  image.src=url;
  await image.decode();
  const scale=Math.min(1,2048/Math.max(image.naturalWidth,image.naturalHeight));
  const pixels=document.createElement('canvas');
  pixels.width=Math.max(1,Math.round(image.naturalWidth*scale));
  pixels.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const ctx=pixels.getContext('2d',{alpha:false});
  ctx.fillStyle='#263120';
  ctx.fillRect(0,0,pixels.width,pixels.height);
  ctx.drawImage(image,0,0,pixels.width,pixels.height);
  return pixels;
 }finally{URL.revokeObjectURL(url);}
}

export function capturePhoto(renderer,canvas,stage,frame,pixels,previewRatio){
 const w=stage.clientWidth,h=stage.clientHeight;
 // Render the same projection at export resolution, with bounded GPU and memory use on phones.
 const photoWidth=pixels.naturalWidth||pixels.width,photoHeight=pixels.naturalHeight||pixels.height;
 let scale=Math.min(photoHeight/(frame.h*h),4096/Math.max(w,h),Math.sqrt(6000000/(w*h)));
 // CanvasRenderer allocates multiple full-stage buffers. Account for rounded
 // canvas dimensions as well as the ideal area when applying its budget.
 const budget=renderer.maxExportPixels;
 if(budget&&Math.max(1,Math.round(w*scale))*Math.max(1,Math.round(h*scale))>budget){
  let low=0,high=scale;
  for(let i=0;i<40;i++){
   const mid=(low+high)/2;
   if(Math.max(1,Math.round(w*mid))*Math.max(1,Math.round(h*mid))<=budget)low=mid;
   else high=mid;
  }
  scale=low;
 }
 try{
  renderer.size(w,h,scale,true);
  renderer.render();
  const unit=canvas.height;
  const output=document.createElement('canvas');
  output.width=Math.max(1,Math.min(photoWidth,Math.round(frame.w*unit)));
  output.height=Math.max(1,Math.min(photoHeight,Math.round(frame.h*unit)));
  output.getContext('2d').drawImage(canvas,frame.x*unit,frame.y*unit,frame.w*unit,frame.h*unit,0,0,output.width,output.height);
  return output;
 }finally{
  renderer.size(w,h,previewRatio);
  renderer.render();
 }
}
