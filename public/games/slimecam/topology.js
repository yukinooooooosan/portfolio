// Triangles share an edge only within the same connected component.
export function topology(faces,uv){
 const edges=new Map(),adj=faces.map(()=>[-1,-1,-1]);
 for(let f=0;f<faces.length;f++){
  for(let k=0;k<3;k++){
   const a=faces[f][(k+1)%3],b=faces[f][(k+2)%3];
   const key=Math.min(a,b)*uv.length+Math.max(a,b);
   if(edges.has(key)){
    const [g,j]=edges.get(key);
    adj[f][k]=g;adj[g][j]=f;
   }else edges.set(key,[f,k]);
  }
 }
 const nearby=faces.map((_,start)=>{
  const found=new Set([start]);let frontier=[start];
  for(let depth=0;depth<5;depth++){
   const next=[];
   for(const f of frontier)for(const neighbor of adj[f]){
    if(neighbor<0||found.has(neighbor))continue;
    found.add(neighbor);next.push(neighbor);
   }
   frontier=next;
  }
  return found;
 });
 return {faces,uv,adj,nearby};
}
