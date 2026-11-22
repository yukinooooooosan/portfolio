import {createStampEditor} from './stamps.js';
import {bindAimDrag} from './aim-drag.js';
import {bindPourTap} from './pour-tap.js';
import {decodePhoto,capturePhoto} from './photo-input.js';
import {createPhotoCropper} from './photo-crop.js';
import {analyzePhoto} from './cpu-tracker.js';
import {Surface} from './surface.js';
import {HAIR_SIZE,PhotoHair} from './hair.js';
import {targetMesh} from './target.js';
import {WebRenderer} from './render.js';
import {CanvasRenderer} from './canvas-render.js';
import {drawSlime,colors} from './sprite.js';

const $=id=>document.getElementById(id),stage=$('stage'),s=new Surface();
const photo=new Image();photo.src='assets/target.webp';
let canvas=$('scene'),renderer,software=false,source=photo,raw=targetMesh.points;
let sampleIdle=true, sampleHair=null, photoLoad=null;
let photoFile=null,photoSelection=null;
const tiltAngles={target:90,photo:90};
let drawHz=40,ratio=Math.min(devicePixelRatio,1.5),frameAt=0,lastTime=0,simDebt=0;
let noticeTimer=0,toastTimer=0,needsDraw=true,chosen=0;
let hintTimer=0,hudHidden=false;
const hasPhoto=()=>source!==photo;
function cancelPhotoLoad(){
 const job=photoLoad;
 if(!job)return;
 job.abort();
 finishPhotoLoad(job);
}
function updatePhotoControls(){
 const loading=!!photoLoad;
 for(const id of ['cannonMode','pourMode','stampMode','save','reset','playToggle','toggleHud','closePhoto','targetTilt','aimOpacity','adjustPhoto'])$(id).disabled=!ready||loading;
 $('pour').disabled=!ready||paused||loading;
 $('cancelPhoto').hidden=!loading;
 stage.setAttribute('aria-busy',String(loading));
 $('slimeSettings').inert=loading;
 stamps.setSuspended(loading);
}
function finishPhotoLoad(job){
 if(photoLoad!==job)return;
 photoLoad=null;lastTime=0;
 updatePhotoControls();updateStageHint();
}
let ready=false,paused=false,triggerPointer=null;
let mode='cannon',previousMode='cannon',pausedBeforeStamps=false,aimFrame=0;
const stamps=createStampEditor();
const cropper=createPhotoCropper();
const cancelAimDrag=bindAimDrag(stage,()=>ready&&!photoLoad&&(mode==='cannon'||mode==='pour'&&s.pouring),moveAim);
const canPour=()=>ready&&!photoLoad&&!paused&&mode==='pour';
const cancelPourTap=bindPourTap(stage,()=>canPour()&&!s.pouring,placePour);
const trigger=$('pour');
drawSlime(document.querySelector('.brand-slime'),'#ff863e');
function toast(text){$('toast').textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').textContent='',2600);}
function notice(text,duration=0){clearTimeout(noticeTimer);$('notice').textContent=text;if(duration)noticeTimer=setTimeout(()=>$('notice').textContent='',duration);}
function frame(){
 if(!renderer)return;
 const a=stage.clientWidth/stage.clientHeight;
 const ar=(source.naturalWidth||source.width)/(source.naturalHeight||source.height);
 const h=Math.min(1,a/ar),w=h*ar;
 stamps.setAspect(ar);
 stage.style.setProperty('--image-inset-x',((a-w)/a*50)+'%');
 stage.style.setProperty('--image-inset-y',((1-h)*50)+'%');
 s.setFrame(raw,{w,h,x:(a-w)*.5,y:(1-h)*.5,mirror:false},a,hasPhoto()?undefined:targetMesh);
 renderer.frame();needsDraw=true;
}
function resize(){
 if(!renderer||stage.clientHeight<1)return;
 renderer.size(stage.clientWidth,stage.clientHeight,ratio);
 frame();
 // Resizing clears the canvas. Repaint before the browser presents the new layout.
 renderer.render();needsDraw=false;
 queueAimPaint();
}
function choose(i){
 chosen=i;const [name,jp,col]=colors[i];$('coreRatio').style.setProperty('--gel-tint',col);$('matTitle').textContent=name;$('matJp').textContent=jp;$('matNumber').textContent='SLIME / '+String(i+1).padStart(2,'0');$('material').style.setProperty('--material',col);
 drawSlime($('slimeSprite'),col,s.coreRatio);document.querySelectorAll('.swatch').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
 renderer?.color(col.slice(1).match(/../g).map(v=>parseInt(v,16)));needsDraw=true;
}
for(const [i,c] of colors.entries()){const b=document.createElement('button');b.className='swatch';b.setAttribute('aria-label',c[1]);b.title=c[1];b.style.setProperty('--swatch',c[2]);b.onclick=()=>choose(i);$('palette').appendChild(b);}
choose(0);
function slider(id){
 const input=$(id),n=Number(input.value);$(id+'Out').value=n+'%';input.style.setProperty('--fill',((n-input.min)/(input.max-input.min))*100+'%');
 if(id==='coreRatio'){
  drawSlime($('slimeSprite'),colors[chosen][2],n/100);
  $(id+'Out').value='光沢 '+(100-n)+'% ／ 色 '+n+'%';
  input.setAttribute('aria-valuetext','光沢層'+(100-n)+'%、色層'+n+'%');
 }
 if(id==='opacity')renderer?.alpha(1-n/100);else s[id]=n/100;needsDraw=true;
}
for(const id of ['coreRatio','opacity','viscosity','amount']){$(id).addEventListener('input',()=>slider(id));slider(id);}
function updateAimOpacity(){
 const value=Number($('aimOpacity').value);
 $('reticle').style.opacity=String(value/100);
 $('aimOpacityOut').value=value+'%';
 $('aimOpacity').style.setProperty('--fill',value+'%');
 $('aimOpacity').setAttribute('aria-valuetext',value+'%');
}
$('aimOpacity').addEventListener('input',updateAimOpacity);
updateAimOpacity();
const tiltInput=$('targetTilt');
function updateTilt(){
 const degrees=tiltInput.valueAsNumber;
 tiltAngles[hasPhoto()?'photo':'target']=degrees;
 if(hasPhoto())s.setPhotoTilt(degrees);else s.setTargetTilt(degrees);
 $('targetTiltOut').value=degrees+'°';
 tiltInput.setAttribute('aria-valuetext',degrees===0?'0度、水平':degrees===90?'90度、直立':degrees+'度');
 tiltInput.style.setProperty('--fill',degrees/90*100+'%');
 $('tiltControl').style.setProperty('--tilt',-degrees+'deg');
 needsDraw=true;
}
tiltInput.addEventListener('input',updateTilt);
updateTilt();
function showPhoto(pixels,points,hair){
 stopInteractions();s.clear();stamps.clear();
 source=pixels;raw=points;s.hair=hair;hair?.clear();
 simDebt=0;sampleIdle=true;
 $('mode').textContent=hasPhoto()?'PHOTO':'TARGET';
 $('closePhoto').hidden=!hasPhoto();
 $('tiltControl').hidden=false;
 tiltInput.value=String(tiltAngles[hasPhoto()?'photo':'target']);updateTilt();
 $('tiltLabel').textContent=hasPhoto()?'写真の面の傾き':'的の傾き';
 tiltInput.setAttribute('aria-label',hasPhoto()?'写真の面の傾き':'的の傾き');
 $('adjustPhoto').hidden=!hasPhoto();
 $('openPhoto').querySelector('span').textContent=hasPhoto()?'写真を変更':'写真を選ぶ';
 $('trackText').textContent=hasPhoto()?'読み込み写真':'練習用の的';
 renderer.setSource(source);frame();
 if(!hasPhoto()){
  const [cx,cy]=targetMesh.points[0],f=s.source;
  moveAim((f.x+cx*f.w)/s.aspect,f.y+cy*f.h);
 }
 changeMode(mode);
 needsDraw=true;
}
function sample(){
 cancelPhotoLoad();photoFile=photoSelection=null;showPhoto(photo,targetMesh.points,sampleHair);notice('');
}
$('openPhoto').addEventListener('click',()=>$('imageFile').click());
$('closePhoto').addEventListener('click',()=>sample());
$('cancelPhoto').addEventListener('click',()=>{
 cancelPhotoLoad();notice('写真の読み込みをやめました。',3500);
});
$('imageFile').addEventListener('change',e=>{
 const file=e.target.files[0];
 e.target.value='';
 if(file)loadPhoto(file);
});
$('adjustPhoto').addEventListener('click',()=>{if(photoFile&&!photoLoad)loadPhoto(photoFile,photoSelection);});
async function loadPhoto(file,selection=null){
 if(!file||!ready)return;
 cancelPhotoLoad();
 const job=new AbortController();
 photoLoad=job;
 stopInteractions();lastTime=0;updatePhotoControls();
 notice('写真を読み込んでいます…');
 let phase='decode';
 try{
  let image=await decodePhoto(file);
  job.signal.throwIfAborted();
  phase='crop';notice('写真の範囲を調整してください');
  const cropped=await cropper.edit(image,job.signal,selection),{pixels}=cropped;
  image=null;
  job.signal.throwIfAborted();
  phase='detect';
  notice('写真の顔と髪を解析しています…');
  const result=await analyzePhoto(pixels,null,job.signal);
  job.signal.throwIfAborted();
  if(!result){
   notice('顔が見つかりませんでした。顔が大きく写った写真を選んでください。',7000);
   return;
  }
  const hair=result.mask?new PhotoHair(result.mask,result.rgba,result.region,result.faceSpan):null;
  finishPhotoLoad(job);
  showPhoto(pixels,result.points,hair);
  photoFile=file;photoSelection=cropped.selection;
  notice(hair?'':'髪の解析を利用できなかったため、顔への付着で開きました。',6500);
 }catch(error){
  if(!job.signal.aborted)notice(error.name==='AbortError'?'写真の調整を取り消しました。':phase==='decode'?'写真を開けませんでした。JPEGやPNGの写真を選んでください。':phase==='crop'?'写真を切り抜けませんでした。もう一度、写真を選んでください。':'写真を解析できませんでした。もう一度、写真を選んでください。',7000);
 }finally{
  finishPhotoLoad(job);
 }
}
function moveAim(x,y) {
 s.setAim(x,y);
 queueAimPaint();
}
function placePour(x,y){
 if(!canPour())return;
 suppressHint();restoreHintLater();
 moveAim(x,y);sampleIdle=false;
 s.splash(x*s.aspect,y);needsDraw=true;
}
function queueAimPaint(){
 if(aimFrame)return;
 aimFrame=requestAnimationFrame(()=>{
  aimFrame=0;
  const dx=(s.aim.x-.5)*stage.clientWidth,dy=(s.aim.y-.5)*stage.clientHeight;
  $('reticle').style.transform='translate3d('+dx+'px,'+dy+'px,0) translate(-50%,-50%)';
  $('aimX').textContent=String(Math.round(s.aim.x*100)).padStart(2,'0');
  $('aimY').textContent=String(Math.round(s.aim.y*100)).padStart(2,'0');
 });
}
function stopInteractions(){
 cancelAimDrag();cancelPourTap();stamps.cancelDrag();
 stopAction();
}
function stopAction() {
 const wasActive=s.firing||s.pouring;
 if(mode==='pour'&&s.pouring)cancelAimDrag();
 s.pouring=s.firing=false;
 triggerPointer=null;
 trigger.classList.remove('down');
 $('triggerText').textContent=mode==='cannon'?'発射':'長押しで注ぐ';
 if(wasActive)restoreHintLater();
}
function suppressHint(){clearTimeout(hintTimer);$('tapHint').hidden=true;}
function restoreHintLater(){
 clearTimeout(hintTimer);
 hintTimer=setTimeout(()=>{$('tapHint').hidden=false;},3000);
}
function updateStageHint(){
 if(mode==='stamp'){
  $('hintIcon').setAttribute('href','#i-stamp');
  return;
 }
 const hint='上から照準へ注ぐ・タップで一滴';
 const actionHint=mode==='cannon'?'タップ・ドラッグで照準を移動':hint;
 $('stageHint').textContent=paused?'停止中':actionHint;
 $('hintIcon').setAttribute('href',paused?'#i-pause':mode==='cannon'?'#i-aim':'#i-hand');
}
function setPaused(next){
 if(!ready || photoLoad || paused===next)return;
 paused=next;
 if(paused)stopInteractions();
 lastTime=0;
 trigger.disabled=paused;
 $('playToggle').setAttribute('aria-pressed',String(!paused));
 $('playToggle').setAttribute('aria-label',paused?'シミュレーションを再生':'シミュレーションを停止');
 $('playToggle').title=paused?'再生':'停止';
 $('playbackIcon').setAttribute('href',paused?'#i-play':'#i-stop');
 updateStageHint();
}
$('playToggle').onclick=()=>{
 if(photoLoad||!ready)return;
 if(mode==='stamp'){changeMode(previousMode);setPaused(false);}
 else setPaused(!paused);
};
$('toggleHud').onclick=()=>{
 if(photoLoad||!ready)return;
 hudHidden=!hudHidden;stage.classList.toggle('hud-hidden',hudHidden);
 $('toggleHud').setAttribute('aria-pressed',String(hudHidden));
 $('toggleHud').setAttribute('aria-label',hudHidden?'HUDを表示':'HUDを非表示');
 $('toggleHud').title=hudHidden?'HUDを表示':'HUDを非表示';
};
function changeMode(next) {
 if(photoLoad)return;
 stopInteractions();
 const from=mode,editing=next==='stamp',cannon=next==='cannon';
 if(editing&&from!=='stamp'){
  previousMode=from;pausedBeforeStamps=paused;
  setPaused(true);
 }
 mode=next;
 if(!editing&&from==='stamp')setPaused(pausedBeforeStamps);
 for(const name of ['cannon','pour','stamp'])$(name+'Mode').setAttribute('aria-pressed',String(name===next));
 stage.classList.toggle('cannon-aim',cannon);
 stage.classList.toggle('stamping',editing);
 $('reticle').hidden=$('aimReadout').hidden=editing;
 $('triggerRow').hidden=false;
 $('triggerRow').classList.toggle('is-stamp',editing);
 trigger.hidden=$('reset').hidden=editing;
 $('aimControl').hidden=editing;
 $('tiltControl').hidden=editing;
 $('slimeSettings').hidden=editing;
 stamps.setActive(editing);
 stage.setAttribute('aria-label',editing?'スタンプの配置':cannon?'照準操作':'スライムをかける位置');
 stage.tabIndex=0;
 canvas.setAttribute('aria-label',cannon?'照準を合わせるプレビュー':'スライムのプレビュー');
 updateStageHint();
 $('triggerIcon').setAttribute('href',cannon?'#i-aim':'#i-drop');
 $('triggerText').textContent=cannon?'発射':'長押しで注ぐ';
 $('triggerHint').hidden=!cannon;
}
for(const name of ['cannon','pour','stamp'])$(name+'Mode').onclick=()=>changeMode(name);
function startAction() {
 if(!ready || photoLoad || paused || s.firing || s.pouring) return false;
 suppressHint();
 sampleIdle=false;needsDraw=true;
 if(mode==='cannon') s.startFiring();
 else {s.pouring=true;s.emitPour();}
 trigger.classList.add('down');
 $('triggerText').textContent=mode==='cannon'?'発射中':'注いでいます';
 return true;
}
trigger.addEventListener('pointerdown',e=>{
 if(e.button!==0 || triggerPointer!==null || !startAction())return;
 e.preventDefault();triggerPointer=e.pointerId;trigger.setPointerCapture(e.pointerId);
});
for(const evt of ['pointerup','pointercancel','lostpointercapture']) {
 trigger.addEventListener(evt,e=>{if(e.pointerId===triggerPointer)stopAction();});
}
trigger.addEventListener('contextmenu',e=>e.preventDefault());
trigger.addEventListener('keydown',e=>{
 if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)startAction();}
});
trigger.addEventListener('keyup',e=>{
 if(e.key===' '||e.key==='Enter'){e.preventDefault();stopAction();}
});
trigger.addEventListener('click',e=>{
 if(e.detail===0 && startAction()) stopAction();
});
trigger.addEventListener('blur',stopAction);
window.addEventListener('blur',stopInteractions);
stage.addEventListener('keydown',e=>{
 if(photoLoad||(mode!=='cannon'&&mode!=='pour')||e.target!==stage)return;
 if(mode==='pour'&&e.key==='Enter'){
  e.preventDefault();if(!e.repeat)placePour(s.aim.x,s.aim.y);return;
 }
 const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
 if(!direction)return;
 e.preventDefault();
 const step=e.shiftKey ? .05 : .01;
 moveAim(s.aim.x+step*direction[0],s.aim.y+step*direction[1]);
});
$('reset').addEventListener('click',()=>{
 if(!ready||photoLoad)return;
 stopInteractions();s.clear();sampleIdle=true;simDebt=0;lastTime=0;needsDraw=true;
 toast('スライムをリセットしました');
});
$('save').addEventListener('click',async()=>{
 if(!ready||photoLoad)return;
 let output;
 try{
  output=capturePhoto(renderer,canvas,stage,s.source,source,ratio);
  await stamps.composite(output);
 }catch{toast('画像を保存できませんでした');return;}
 output.toBlob(blob=>{if(!blob){toast('画像を保存できませんでした');return;}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='slime-cam-'+new Date().toISOString().replace(/[:.]/g,'-')+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('合成画像をPNGで保存します');},'image/png');
});
$('help').onclick=()=>{stopInteractions();$('guide').showModal();};$('close').onclick=()=>$('guide').close();$('guide').addEventListener('click',e=>{if(e.target===$('guide')){const r=$('guide').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('guide').close();}});
function loop(now){
 requestAnimationFrame(loop);if(!ready||document.hidden||now-frameAt<1000/drawHz)return;frameAt=now;
 const dt=Math.min(.075,(now-(lastTime||now))/1000);lastTime=now;
 const simulating=!photoLoad&&!paused&&!sampleIdle;
 if(!simulating&&!needsDraw)return;
 const start=performance.now();
 if(simulating){
  simDebt+=dt;const simStep=1/28;
  while(simDebt>=simStep){s.update(simStep);simDebt-=simStep;}
 }
 renderer.render();needsDraw=false;
 if(performance.now()-start>40&&now-lastQualityChange>1400){
  lastQualityChange=now;drawHz=Math.max(20,drawHz-5);if(ratio>.76){ratio=Math.max(.75,ratio*.8);resize();}
 }
}
let lastQualityChange=0;
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopInteractions();else{lastTime=0;needsDraw=true;}});
window.addEventListener('pagehide',stopInteractions);
async function loadSampleHair(){
 const image=new Image();
 image.src='assets/target-tassel.png';
 await image.decode();
 const buffer=document.createElement('canvas');
 buffer.width=buffer.height=HAIR_SIZE;
 const ctx=buffer.getContext('2d',{willReadFrequently:true});
 ctx.drawImage(image,0,0,HAIR_SIZE,HAIR_SIZE);
 const maskPixels=ctx.getImageData(0,0,HAIR_SIZE,HAIR_SIZE).data;
 const mask=new Uint8Array(HAIR_SIZE**2);
 for(let i=0;i<mask.length;i++)mask[i]=maskPixels[i*4];
 ctx.drawImage(photo,0,0,HAIR_SIZE,HAIR_SIZE);
 const rgba=ctx.getImageData(0,0,HAIR_SIZE,HAIR_SIZE).data;
 return new PhotoHair(mask,rgba,{u:0,v:0,w:1,h:1},targetMesh.referenceWidth);
}
async function boot(){
 await photo.decode();
 try{sampleHair=await loadSampleHair();}catch{}
 try{renderer=new WebRenderer(canvas,s);}catch{
  const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;renderer=new CanvasRenderer(canvas,s);software=true;drawHz=24;
 }
 ready=true;
 showPhoto(photo,targetMesh.points,sampleHair);choose(chosen);slider('opacity');resize();
 notice(sampleHair?'':'毛束の判定を読み込めませんでした。的と球で遊べます。',5000);
 $('openPhoto').disabled=false;updatePhotoControls();
 new ResizeObserver(resize).observe(stage);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(software)return;
  stopInteractions();notice('軽量描画に切り替えました。',3500);
  const next=canvas.cloneNode(false);canvas.replaceWith(next);canvas=next;renderer=new CanvasRenderer(canvas,s);software=true;drawHz=24;renderer.setSource(source);choose(chosen);slider('opacity');resize();});
 requestAnimationFrame(loop);
}
boot().catch(()=>{notice('プレビューを初期化できませんでした。ページを再読み込みしてください。');});
