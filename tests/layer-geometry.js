// Embedded in index.html: no runtime library or network dependency.
function ringArea(p){return p.reduce((a,v,i)=>{const n=p[(i+1)%p.length];return a+v[0]*n[1]-n[0]*v[1]},0)/2}
function inRing(p,ring){let yes=false;for(let i=0,k=ring.length-1;i<ring.length;k=i++){const a=ring[i],b=ring[k];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes}
let geometryKey='',geometryCache=null;
function effectiveGeometry(){
 const key=JSON.stringify([state.width,state.height,state.rooms.map(r=>[r.id,r.x,r.y,r.w,r.h])]);
 if(key===geometryKey)return geometryCache;
 const xs=[...new Set([0,state.width,...state.rooms.flatMap(r=>[r.x,r.x+r.w])])].sort((a,b)=>a-b),ys=[...new Set([0,state.height,...state.rooms.flatMap(r=>[r.y,r.y+r.h])])].sort((a,b)=>a-b);
 const nx=xs.length-1,ny=ys.length-1,N=nx*ny,owners=new Int16Array(N).fill(-1),ids=new Int32Array(N).fill(-1),components=[];
 const xi=new Map(xs.map((v,i)=>[v,i])),yi=new Map(ys.map((v,i)=>[v,i]));
 state.rooms.forEach((r,index)=>{for(let y=yi.get(r.y);y<yi.get(r.y+r.h);y++)for(let x=xi.get(r.x);x<xi.get(r.x+r.w);x++)owners[y*nx+x]=index});
 // Four-connected components keep separate islands separate even at a shared corner.
 for(let seed=0;seed<N;seed++){
  if(owners[seed]<0||ids[seed]>=0)continue;
  const cid=components.length,c={owner:owners[seed],area:0,edges:new Map(),box:null},queue=[seed];ids[seed]=cid;
  for(let q=0;q<queue.length;q++){
   const cell=queue[q],x=cell%nx,y=Math.floor(cell/nx);c.area+=(xs[x+1]-xs[x])*(ys[y+1]-ys[y]);
   for(const n of [x?cell-1:-1,x<nx-1?cell+1:-1,y?cell-nx:-1,y<ny-1?cell+nx:-1])if(n>=0&&owners[n]===c.owner&&ids[n]<0){ids[n]=cid;queue.push(n)}
  }components.push(c);
 }
 const vertex=(x,y)=>y*(nx+1)+x,xy=v=>[xs[v%(nx+1)],ys[Math.floor(v/(nx+1))]];
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
  const cell=y*nx+x,cid=ids[cell];if(cid<0)continue;const c=components[cid];
  for(const [other,a,b] of [[y?ids[cell-nx]:-1,vertex(x,y),vertex(x+1,y)],[x<nx-1?ids[cell+1]:-1,vertex(x+1,y),vertex(x+1,y+1)],[y<ny-1?ids[cell+nx]:-1,vertex(x+1,y+1),vertex(x,y+1)],[x?ids[cell-1]:-1,vertex(x,y+1),vertex(x,y)]])if(other!==cid){if(!c.edges.has(a))c.edges.set(a,new Set());c.edges.get(a).add(b)}
 }
 // Largest axis-aligned rectangle in each component provides a name point inside it.
 const heights=new Float64Array(nx);
 for(let y=0;y<ny;y++){
  for(let x=0;x<nx;x++)heights[x]=ids[y*nx+x]<0?0:((y&&ids[(y-1)*nx+x]===ids[y*nx+x])?heights[x]:0)+ys[y+1]-ys[y];
  for(let start=0;start<nx;){const cid=ids[y*nx+start];let end=start+1;while(end<nx&&ids[y*nx+end]===cid)end++;
   if(cid>=0){const stack=[],c=components[cid];for(let x=start;x<=end;x++){const h=x===end?0:heights[x];let left=x;while(stack.length&&stack[stack.length-1].h>h){const old=stack.pop();left=old.left;const w=xs[x]-xs[left];if(!c.box||w*old.h>c.box.w*c.box.h)c.box={x:xs[left],y:ys[y+1]-old.h,w,h:old.h}}if(h>0&&(!stack.length||stack[stack.length-1].h<h))stack.push({left,h})}}start=end;
  }
 }
 const rooms=state.rooms.map(r=>({room_id:r.id,area_mm2:0,regions:[]}));
 for(const c of components){
  const loops=[];
  while(c.edges.size){const start=c.edges.keys().next().value;let a=start,path=[];
   do{path.push(xy(a));const candidates=c.edges.get(a);let b;
    if(candidates.size===1||path.length===1)b=candidates.values().next().value;
    else{const prev=path[path.length-2],cur=xy(a);b=[...candidates].sort((u,v)=>{const turn=k=>{const p=xy(k),dx=cur[0]-prev[0],dy=cur[1]-prev[1];return Math.atan2(dx*(p[1]-cur[1])-dy*(p[0]-cur[0]),dx*(p[0]-cur[0])+dy*(p[1]-cur[1]))};return turn(v)-turn(u)})[0]}
    candidates.delete(b);if(!candidates.size)c.edges.delete(a);a=b;
   }while(a!==start);
   path=path.filter((b,i,p)=>{const a=p[(i+p.length-1)%p.length],d=p[(i+1)%p.length];return (b[0]-a[0])*(d[1]-b[1])!==(b[1]-a[1])*(d[0]-b[0])});loops.push(path);
  }
  const outers=loops.filter(p=>ringArea(p)>0).map(outer=>({outer,holes:[],label_box:c.box,label_point:[c.box.x+c.box.w/2,c.box.y+c.box.h/2]}));
  for(const hole of loops.filter(p=>ringArea(p)<0)){const mid=[(hole[0][0]+hole[1][0])/2,(hole[0][1]+hole[1][1])/2];const parent=outers.find(r=>inRing(mid,r.outer));if(parent)parent.holes.push(hole);else throw Error('실 경계의 내부 구멍을 연결하지 못했습니다.')}
  for(const region of outers){region.area_mm2=ringArea(region.outer)+region.holes.reduce((a,p)=>a+ringArea(p),0);rooms[c.owner].regions.push(region)}rooms[c.owner].area_mm2+=c.area;
 }
 geometryKey=key;return geometryCache={rooms,area_mm2:rooms.reduce((a,r)=>a+r.area_mm2,0)};
}
function reorderSelected(where){const i=state.rooms.findIndex(r=>r.id===selected);if(i<0)return;const target=where==='front'?state.rooms.length-1:where==='back'?0:clamp(i+(where==='up'?1:-1),0,state.rooms.length-1);if(i===target)return;change(()=>{const r=state.rooms.splice(i,1)[0];state.rooms.splice(target,0,r)})}
