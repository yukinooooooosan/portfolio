import {topology} from './topology.js';
import {outlines} from './target-outline.js';

const sourceSize=1254;
const points=[],faces=[],uv=[],objects=[];
const rings=[.18,.38,.58,.76,.89,.965,1];

// The board is a shallow dome. The two side objects expose the front of a sphere.
// Give each object its own UV island so deposited film cannot cross a background gap.
function addObject(name,cx,cy,depth,atlasU,atlasV){
 const rim=outlines[name],start=points.length,firstFace=faces.length;
 function vertex(x,y,height){
  points.push([x/sourceSize,y/sourceSize,-height]);
  uv.push([atlasU+(x-cx)/sourceSize,atlasV+(y-cy)/sourceSize]);
 }
 vertex(cx,cy,depth+.014);
 for(let level=0;level<rings.length;level++){
  const fraction=rings[level];
  const profile=1-fraction*fraction;
  const height=.014+depth*(name==='board'?profile:Math.sqrt(profile));
  const first=points.length;
  for(const [x,y] of rim)vertex(cx+(x-cx)*fraction,cy+(y-cy)*fraction,height);
  for(let i=0;i<rim.length;i++){
   const j=(i+1)%rim.length;
   if(level===0)faces.push([start,first+i,first+j]);
   else{
    const inner=first-rim.length;
    faces.push([inner+i,first+i,first+j],[inner+i,first+j,inner+j]);
   }
  }
 }
 for(let f=firstFace;f<faces.length;f++)objects[f]=name;
}
addObject('board',617,382,.031,.39,.33);
addObject('blue',180,445,.091,.22,.81);
addObject('gold',1060,445,.091,.72,.81);

export const targetMesh={...topology(faces,uv),kind:'target',points,objects,referenceWidth:.43};
