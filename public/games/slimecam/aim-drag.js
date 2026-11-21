// The aiming finger and the fire button own separate pointers on a touchscreen.
export function bindAimDrag(stage, canAim, moveAim) {
 let pointer = null;

 function update(event) {
  const rect = stage.getBoundingClientRect();
  if (rect.width && rect.height) {
   moveAim((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  }
 }

 function cancel() {
  if (pointer === null) return;
  const id = pointer;
  pointer = null;
  if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
 }

 stage.addEventListener('pointerdown', event => {
  if (!canAim() || pointer !== null || event.button !== 0 || event.target.closest('button,label,input')) return;
  event.preventDefault();
  pointer = event.pointerId;
  stage.setPointerCapture(pointer);
  update(event);
 });
 stage.addEventListener('pointermove', event => {
  if (event.pointerId !== pointer) return;
  if (event.pointerType === 'mouse' && !(event.buttons & 1)) { cancel(); return; }
  update(event);
 });
 stage.addEventListener('pointerup', event => {
  if (event.pointerId !== pointer) return;
  update(event);
  cancel();
 });
 for (const type of ['pointercancel', 'lostpointercapture']) {
  stage.addEventListener(type, event => { if (event.pointerId === pointer) cancel(); });
 }
 stage.addEventListener('contextmenu', event => {
  if (pointer !== null && !event.target.closest('button,label,input')) event.preventDefault();
 });
 return cancel;
}
