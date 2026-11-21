// Wait for a completed tap so a swipe can scroll without placing slime.
export function bindPourTap(stage, canPour, place) {
 let pointer=null;
 function cancel(){pointer=null;}
 function moved(event){return Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>10;}
 // A pinch can start with its second finger outside the preview.
 (stage.ownerDocument||stage).addEventListener('pointerdown',event=>{
  if(pointer&&event.pointerType==='touch'&&event.pointerId!==pointer.id)cancel();
 },true);
 stage.addEventListener('pointerdown',event=>{
  if(pointer){cancel();return;}
  if(!canPour()||!event.isPrimary||event.button!==0||event.target.closest('button,label,input'))return;
  pointer={id:event.pointerId,x:event.clientX,y:event.clientY};
 });
 stage.addEventListener('pointermove',event=>{
  if(pointer?.id!==event.pointerId)return;
  if(moved(event)||(event.pointerType==='mouse'&&!(event.buttons&1)))cancel();
 });
 stage.addEventListener('pointerup',event=>{
  if(pointer?.id!==event.pointerId)return;
  const tapped=!moved(event);cancel();
  if(!tapped||!canPour())return;
  const box=stage.getBoundingClientRect();
  if(!box.width||!box.height)return;
  const x=(event.clientX-box.left)/box.width,y=(event.clientY-box.top)/box.height;
  if(x<0||x>1||y<0||y>1)return;
  place(x,y);
 });
 for(const type of ['pointercancel','lostpointercapture'])stage.addEventListener(type,event=>{
  if(pointer?.id===event.pointerId)cancel();
 });
 stage.addEventListener('pointerleave',cancel);
 stage.addEventListener('contextmenu',cancel);
 return cancel;
}
