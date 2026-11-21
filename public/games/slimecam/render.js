import {mixture} from './layers.js';
import {GEL_SIZE,HAIR_SIZE} from './hair.js';
import * as T from './vendor/three.module.js';
import {SIZE,MAX_DRAWN_DROPS} from './surface.js';
const common=`
uniform sampler2D imageMap;
uniform vec4 frame;
uniform vec2 resolution;
uniform float aspect,hairDepth;
uniform vec4 hairFrame;
uniform sampler2D hairMask;
vec2 sourceAt(vec2 st){return (st*vec2(aspect,1.)-frame.xy)/frame.zw;}
vec2 hairUV(vec2 st){return (st*vec2(aspect,1.)-hairFrame.xy)/hairFrame.zw;}
bool outside(vec2 p){return any(lessThan(p,vec2(0.)))||any(greaterThan(p,vec2(1.)));}
float hairCoverage(vec2 st){
 vec2 uv=hairUV(st);return outside(uv)?0.:smoothstep(.13,.79,texture2D(hairMask,uv).r);
}
vec3 photo(vec2 st){
 vec2 p=sourceAt(st);return outside(p)?vec3(.025):texture2D(imageMap,p).rgb;
}
vec2 screenAt(){return vec2(gl_FragCoord.x/resolution.x,1.-gl_FragCoord.y/resolution.y);}
`;
const screenVertex='void main(){gl_Position=vec4(position.xy,0.999,1.0);}';
const faceVertex=`varying vec2 tissue;varying vec3 wp;void main(){tissue=uv;wp=position;gl_Position=projectionMatrix*(modelViewMatrix*vec4(position,1.));}`;
const optics=`
uniform vec4 blend; // Clear height, core height, pigment threshold and strength.
uniform vec3 tint;
uniform float opacity,faceScale;
float pigment(float core){
 return blend.w*smoothstep(blend.z,blend.z+.17,core);
}
vec4 gel(vec2 screen,vec3 n,float colorAmount,float coverage){
 vec3 lamp=normalize(vec3(-.43,.63,.65));
 float lit=max(dot(n,lamp),0.);
 float rim=pow(1.-clamp(n.z,0.,1.),1.7);
 vec3 reflection=reflect(vec3(0.,0.,-1.),n);
 float glint=pow(max(dot(reflection,normalize(vec3(-.43,.61,.67))),0.),38.);
 float soft=pow(max(dot(reflection,normalize(vec3(.48,-.34,.81))),0.),12.);
 vec3 through=photo(screen+vec2(n.x,-n.y)*faceScale*.014);
 vec3 clearGel=through*(.93+.05*lit)+vec3(.075,.088,.10)+.23*rim;
 vec3 coloredGel=tint*(.64+.34*lit)+.025*rim;
 vec3 color=mix(clearGel,coloredGel,colorAmount)+(.93-.49*colorAmount)*glint+(.16-.07*colorAmount)*soft;
 return vec4(color,opacity*coverage*clamp(.60+.37*colorAmount+.26*glint,0.,1.));
}
`;
const slimeFragment=`
 varying vec2 tissue;varying vec3 wp;
 uniform sampler2D heightMap,hairGel,faceCore,hairCore;
 uniform float onHair;
 ${common}
 ${optics}
 void main(){
  vec2 sc=screenAt(),huv=hairUV(sc);
  float cover=hairCoverage(sc);
  float visible=onHair>.5?cover:1.-cover;
  float outer=onHair>.5?texture2D(hairGel,huv).r:texture2D(heightMap,tissue).r;
  float core=onHair>.5?texture2D(hairCore,huv).r:texture2D(faceCore,tissue).r;
  float h=max(outer*blend.x,core*blend.y);
  vec2 gradient=vec2(dFdx(h),dFdy(h))*resolution.y*faceScale*.09;
  vec3 plane=normalize(cross(dFdx(wp),dFdy(wp)));if(plane.z<0.)plane=-plane;
  vec3 n=normalize(vec3(-gradient+plane.xy*.22,.68));
  if(h<.035||visible<.004||opacity<.001)discard;
  gl_FragColor=gel(sc,n,pigment(core),visible*smoothstep(.035,.135,h));
 }`;
const dropFragment=`
 ${common}
 ${optics}
 varying vec3 vn;varying vec3 localNormal;varying float depth;
 void main(){
  vec2 sc=screenAt();vec3 n=normalize(vn),shape=normalize(localNormal);
  // Optical depth is greatest near the drop axis and thins to a clear rim.
  float core=clamp((shape.z-.23)*.90+.035*shape.y,0.,1.);
  float cover=depth<hairDepth?1.-hairCoverage(sc):1.;
  gl_FragColor=gel(sc,n,pigment(core),cover*max(blend.x,blend.y*smoothstep(0.,.12,core)));
 }`;
export class WebRenderer{
 constructor(canvas,surface){
  this.canvas=canvas;this.s=surface;this.gl=new T.WebGLRenderer({canvas,alpha:false,antialias:false,powerPreference:'high-performance'});this.gl.outputColorSpace=T.LinearSRGBColorSpace;
  this.scene=new T.Scene();this.cam=new T.OrthographicCamera(0,1,1,0,.01,30);this.cam.position.z=10;
  const ht=new T.DataTexture(surface.bytes,SIZE,SIZE,T.RedFormat,T.UnsignedByteType);ht.magFilter=ht.minFilter=T.LinearFilter;ht.needsUpdate=true;this.ht=ht;
  const ct=new T.DataTexture(surface.core.bytes,SIZE,SIZE,T.RedFormat,T.UnsignedByteType);ct.minFilter=ct.magFilter=T.LinearFilter;ct.needsUpdate=true;this.ct=ct;
  this.u={blend:{value:new T.Vector4()},faceCore:{value:ct},hairCore:{value:null},heightMap:{value:ht},imageMap:{value:null},frame:{value:new T.Vector4()},resolution:{value:new T.Vector2(1,1)},aspect:{value:1},hairFrame:{value:new T.Vector4(-2,-2,1,1)},hairDepth:{value:0},hairMask:{value:null},hairGel:{value:null},onHair:{value:0},opacity:{value:.8},faceScale:{value:.4},tint:{value:new T.Vector3(.62,.95,.1)}};
  this.bg=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({uniforms:this.u,vertexShader:screenVertex,fragmentShader:common+'void main(){gl_FragColor=vec4(photo(screenAt()),1.);}',depthTest:false,depthWrite:false}));this.bg.frustumCulled=false;this.bg.renderOrder=-3;this.scene.add(this.bg);
  const geo=new T.BufferGeometry();
  this.depth=new T.Mesh(geo,new T.MeshBasicMaterial({colorWrite:false,side:T.DoubleSide}));this.depth.renderOrder=-2;this.depth.frustumCulled=false;this.scene.add(this.depth);
  this.face=new T.Mesh(geo,new T.ShaderMaterial({uniforms:this.u,vertexShader:faceVertex,fragmentShader:slimeFragment,transparent:true,side:T.DoubleSide,forceSinglePass:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-.3,polygonOffsetUnits:-1,depthFunc:T.LessEqualDepth}));this.face.renderOrder=1;this.face.frustumCulled=false;this.scene.add(this.face);
  this.hairLayer=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({
   uniforms:{...this.u,onHair:{value:1}},
   vertexShader:'varying vec2 tissue; varying vec3 wp; void main(){tissue=uv;wp=position;gl_Position=vec4(position.xy,0.,1.);}',
   fragmentShader:slimeFragment,transparent:true,depthTest:false,depthWrite:false
  }));this.hairLayer.frustumCulled=false;this.hairLayer.renderOrder=1.5;this.scene.add(this.hairLayer);
  const dp=new T.ShaderMaterial({uniforms:this.u,vertexShader:`
   varying vec3 vn;varying vec3 localNormal;varying float depth;
   void main(){
    vec4 pos=instanceMatrix*vec4(position,1.);depth=pos.z;localNormal=normal;
    vn=normalize(normal/vec3(instanceMatrix[0][0],instanceMatrix[1][1],instanceMatrix[2][2]));
    gl_Position=projectionMatrix*modelViewMatrix*pos;
   }`,fragmentShader:dropFragment,transparent:true,depthWrite:false});
  this.drops=new T.InstancedMesh(new T.SphereGeometry(1,16,12),dp,MAX_DRAWN_DROPS);this.drops.count=0;this.drops.frustumCulled=false;this.drops.renderOrder=2;this.scene.add(this.drops);this.temp=new T.Object3D();
 }
 setSource(media){
  if(this.tex)this.tex.dispose();
  this.tex=new T.Texture(media);
  this.tex.flipY=false;this.tex.generateMipmaps=false;this.tex.minFilter=this.tex.magFilter=T.LinearFilter;this.tex.needsUpdate=true;
  this.u.imageMap.value=this.tex;
  const hair=this.s.hair;
  for(const [key,array,size] of [['hairMask',hair?.mask,HAIR_SIZE],['hairGel',hair?.bytes,GEL_SIZE],['hairCore',hair?.core.bytes,GEL_SIZE]]){
   this.u[key].value?.dispose();
   const length=array?size:1;
   const texture=new T.DataTexture(array||new Uint8Array(1),length,length,T.RedFormat,T.UnsignedByteType);
   texture.magFilter=texture.minFilter=T.LinearFilter;texture.needsUpdate=true;this.u[key].value=texture;
  }
  this.hairLayer.visible=!!hair;
 }
 size(w,h,dpr){this.gl.setPixelRatio(dpr);this.gl.setSize(w,h,false);this.gl.getDrawingBufferSize(this.u.resolution.value);this.cam.right=w/h;this.cam.updateProjectionMatrix();this.u.aspect.value=w/h;}
 frame(){
  const s=this.s,src=s.source;if(!src)return;
  this.u.frame.value.set(src.x,src.y,src.w,src.h);this.u.hairDepth.value=s.hair?s.hairDepth:-20;
  if(s.hair){const r=s.hairFrame();this.u.hairFrame.value.set(r.x,r.y,r.w,r.h);}
  else this.u.hairFrame.value.set(-2,-2,1,1);
  this.face.visible=this.depth.visible=!!s.points;
  if(!s.points)return;this.u.faceScale.value=s.faceWidth;
  if(this.mesh!==s.mesh){
   const previous=this.face.geometry,geo=new T.BufferGeometry();
   geo.setIndex(s.mesh.faces.flat());
   geo.setAttribute('uv',new T.Float32BufferAttribute(s.mesh.uv.flat(),2));
   geo.setAttribute('position',new T.BufferAttribute(new Float32Array(s.points.length*3),3));
   this.face.geometry=this.depth.geometry=geo;
   this.mesh=s.mesh;previous.dispose();
  }
  const pos=this.face.geometry.attributes.position;for(let i=0;i<s.points.length;i++){const [x,y,z]=s.points[i];pos.setXYZ(i,x,1-y,z);}pos.needsUpdate=true;
 }
 color(rgb){this.u.tint.value.fromArray(rgb.map(v=>v/255));}
 alpha(a){this.u.opacity.value=a;}
 render(){
  const mix=mixture(this.s.coreRatio);
  this.u.blend.value.set(mix.clearWeight,mix.coreWeight,mix.threshold,mix.strength);
  if(this.s.hair?.paint()){this.u.hairGel.value.needsUpdate=true;this.u.hairCore.value.needsUpdate=true;}
  if(this.s.paint()){this.ht.needsUpdate=true;this.ct.needsUpdate=true;}
  const d=this.s.visualDrops();this.drops.count=d.length;for(let i=0;i<d.length;i++){const p=d[i],o=this.temp;o.position.set(p.x,1-p.y,p.z+.0002);o.scale.set(p.r,p.r*(p.stretch??(1.2+Math.min(2.8,p.vy*3))),p.r);o.updateMatrix();this.drops.setMatrixAt(i,o.matrix);}this.drops.instanceMatrix.needsUpdate=true;this.gl.render(this.scene,this.cam);
 }
}
