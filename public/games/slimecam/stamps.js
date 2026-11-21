import {stampCatalog} from './stamp-catalog.js';

const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const assetUrl=art=>'assets/stamps/'+art.id+'.webp';

function stampDimensions(art,percent,shortSide){
 const scale=shortSide*percent/(100*Math.max(art.w,art.h));
 return {width:art.w*scale,height:art.h*scale};
}

export function createStampEditor(){
 const $=id=>document.getElementById(id);
 const plane=$('stampPlane'),panel=$('stampPanel'),grid=$('stampGrid'),visible=$('showStamps');
 const size=$('stampSize'),angle=$('stampAngle');
 const mobile=matchMedia('(max-width:760px)'),desktop=panel.parentNode;
 let active=false,suspended=false,vertical=false,aspect=1,libraryLoaded=false;
 let brush=stampCatalog[0],selected=null,armed=false,drag=null;
 const placed=[],tiles=new Map(),images=new Map();

 function imageFor(art){
  if(!images.has(art.id)){
   const image=new Image();image.alt='';image.draggable=false;image.src=assetUrl(art);
   images.set(art.id,image);
  }
  return images.get(art.id);
 }
 function movePanel(){
  const parent=mobile.matches?$('mobileStampSlot'):desktop;
  if(panel.parentNode!==parent)parent.append(panel);
 }
 mobile.addEventListener('change',movePanel);
 movePanel();

 function position(item){
  const {width,height}=stampDimensions(item.art,item.size,Math.min(1,aspect));
  Object.assign(item.node.style,{left:item.x*100+'%',top:item.y*100+'%',width:width/aspect*100+'%',height:height*100+'%',
   transform:'translate(-50%, -50%) rotate('+item.angle+'deg)'});
 }
 function range(input,output,suffix){
  output.value=input.value+suffix;
  input.style.setProperty('--fill',(input.value-input.min)/(input.max-input.min)*100+'%');
 }
 function sync(){
  plane.hidden=!visible.checked;
  plane.inert=suspended||!active||!visible.checked;
  $('stampVisibility').hidden=!active&&!placed.length;
  $('stampCount').textContent='配置 '+placed.length;
  $('deleteStamp').disabled=!selected||!visible.checked;
  $('horizontalStamps').setAttribute('aria-pressed',String(!vertical));
  $('verticalStamps').setAttribute('aria-pressed',String(vertical));
  for(const [art,tile] of tiles){
   tile.hidden=art.vertical!==vertical;
   tile.setAttribute('aria-pressed',String(art===brush));
  }
  for(const item of placed)item.node.setAttribute('aria-pressed',String(active&&selected===item));
  range(size,$('stampSizeOut'),'%');range(angle,$('stampAngleOut'),'°');
  if(active)$('stageHint').textContent=visible.checked?'タップで配置・ドラッグで移動':'「スタンプ表示」で編集を再開';
 }
 function choose(art){
  brush=art;vertical=art.vertical;selected=null;armed=true;sync();
 }
 function loadLibrary(){
  if(libraryLoaded)return;
  for(const art of stampCatalog){
   const tile=document.createElement('button');
   tile.type='button';tile.className='stamp-tile';
   const label=(art.vertical?'縦書き':'横書き')+'「'+art.label+'」';
   tile.title=label;tile.setAttribute('aria-label',label);
   tile.append(imageFor(art));
   if(art.vertical){
    const labelText=document.createElement('span');labelText.textContent=art.label;
    tile.classList.add('vertical-tile');tile.append(labelText);
   }
   tile.addEventListener('click',()=>choose(art));
   grid.append(tile);tiles.set(art,tile);
  }
  libraryLoaded=true;
 }
 function switchBank(wantVertical){
  if(vertical===wantVertical)return;
  choose(stampCatalog.find(art=>art.vertical===wantVertical && art.label===brush.label));
  armed=false;grid.scrollLeft=0;
 }
 $('horizontalStamps').onclick=()=>switchBank(false);
 $('verticalStamps').onclick=()=>switchBank(true);
 function select(item){
  selected=item;brush=item.art;vertical=brush.vertical;armed=false;
  size.value=item.size;angle.value=item.angle;sync();
 }
 function place(x,y){
  const node=document.createElement('button');
  node.type='button';node.className='placed-stamp';
  node.setAttribute('aria-label','配置済みの'+(brush.vertical?'縦書き':'横書き')+'「'+brush.label+'」');
  const img=imageFor(brush).cloneNode();img.draggable=false;node.append(img);
  const item={art:brush,x,y,size:size.valueAsNumber,angle:angle.valueAsNumber,node};
  node.addEventListener('click',e=>{if(e.detail===0&&active)select(item);});
  placed.push(item);plane.append(node);position(item);select(item);
  return item;
 }
 function coordinates(e){
  const box=plane.getBoundingClientRect();
  return {x:(e.clientX-box.left)/box.width,y:(e.clientY-box.top)/box.height};
 }
 function cancelDrag(){
  if(!drag)return;
  const id=drag.id;drag=null;
  if(plane.hasPointerCapture(id))plane.releasePointerCapture(id);
 }
 plane.addEventListener('pointerdown',e=>{
  if(suspended||!active||!visible.checked||drag||e.button!==0||!e.isPrimary)return;
  e.preventDefault();
  const {x,y}=coordinates(e);
  const node=e.target.closest('.placed-stamp');
  let item=armed?null:placed.find(item=>item.node===node);
  if(item)select(item);else item=place(x,y);
  drag={id:e.pointerId,item,dx:item.x-x,dy:item.y-y};
  plane.setPointerCapture(e.pointerId);
 });
 function move(e){
  if(!drag||e.pointerId!==drag.id)return;
  const {x,y}=coordinates(e);
  drag.item.x=clamp(x+drag.dx,0,1);drag.item.y=clamp(y+drag.dy,0,1);
  position(drag.item);
 }
 plane.addEventListener('pointermove',move);
 plane.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId){move(e);cancelDrag();}});
 for(const type of ['pointercancel','lostpointercapture'])plane.addEventListener(type,e=>{if(drag?.id===e.pointerId)cancelDrag();});
 function removeSelected(){
  if(!selected)return;
  cancelDrag();selected.node.remove();placed.splice(placed.indexOf(selected),1);
  selected=null;sync();
 }
 $('deleteStamp').onclick=removeSelected;
 $('stage').addEventListener('keydown',e=>{
  if(suspended||!active||!visible.checked||!(e.target===$('stage')||plane.contains(e.target)))return;
  if(e.target===$('stage')&&e.key==='Enter'){e.preventDefault();place(.5,.5);return;}
  if(!selected)return;
  if(e.key==='Delete'){e.preventDefault();removeSelected();return;}
  const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
  if(!direction)return;
  e.preventDefault();const step=e.shiftKey?.05:.01;
  selected.x=clamp(selected.x+direction[0]*step,0,1);selected.y=clamp(selected.y+direction[1]*step,0,1);position(selected);
 });
 for(const input of [size,angle])input.addEventListener('input',()=>{
  if(selected){selected.size=size.valueAsNumber;selected.angle=angle.valueAsNumber;position(selected);}
  sync();
 });
 visible.addEventListener('change',()=>{cancelDrag();sync();});
 return {
  setSuspended(value){
   cancelDrag();suspended=value;panel.inert=value;visible.disabled=value;sync();
  },
  setActive(value){
   cancelDrag();active=value;
   panel.hidden=!value;
   if(value)loadLibrary();
   sync();
  },
  cancelDrag,
  setAspect(value){aspect=value;for(const item of placed)position(item);},
  clear(){
   cancelDrag();placed.length=0;plane.replaceChildren();selected=null;armed=false;
   visible.checked=true;sync();
  },
  async composite(output){
   if(!visible.checked||!placed.length)return;
   // Capture the arrangement at Save, even if the user edits while an image finishes decoding.
   const snapshot=placed.map(({art,x,y,size,angle})=>({art,x,y,size,angle,image:imageFor(art)}));
   await Promise.all([...new Set(snapshot.map(item=>item.image))].map(image=>image.decode()));
   const ctx=output.getContext('2d'),w=output.width,h=output.height;
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   for(const item of snapshot){
    const dims=stampDimensions(item.art,item.size,Math.min(w,h));
    ctx.save();ctx.translate(item.x*w,item.y*h);ctx.rotate(item.angle*Math.PI/180);
    ctx.drawImage(item.image,-dims.width/2,-dims.height/2,dims.width,dims.height);ctx.restore();
   }
  }
 };
}
