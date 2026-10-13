const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const ctx=vm.createContext({state:null,console,Set,Map,Int16Array,Int32Array,Float64Array});vm.runInContext(fs.readFileSync(path.join(__dirname,'layer-geometry.js'),'utf8'),ctx);
let seed=7142;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};
const area=p=>p.reduce((v,a,i)=>{let b=p[(i+1)%p.length];return v+a[0]*b[1]-b[0]*a[1]},0)/2;
const inside=(p,ring)=>{let b=false;for(let i=0,k=ring.length-1;i<ring.length;k=i++){let a=ring[i],c=ring[k];if((a[1]>p[1])!==(c[1]>p[1])&&p[0]<(c[0]-a[0])*(p[1]-a[1])/(c[1]-a[1])+a[0])b=!b}return b};
function verify(rooms){ctx.state={width:4000,height:4000,rooms};let g=vm.runInContext('effectiveGeometry()',ctx);for(let r of g.rooms){assert.ok(Math.abs(r.area_mm2-r.regions.reduce((a,p)=>a+area(p.outer)+p.holes.reduce((s,h)=>s+area(h),0),0))<.001);for(let region of r.regions){assert.ok(inside(region.label_point,region.outer));assert.ok(!region.holes.some(h=>inside(region.label_point,h)))}}
 for(let x=125;x<4000;x+=250)for(let y=125;y<4000;y+=250){let expected=[...rooms].reverse().find(r=>x>r.x&&x<r.x+r.w&&y>r.y&&y<r.y+r.h)?.id;let actual=g.rooms.filter(r=>r.regions.some(p=>inside([x,y],p.outer)&&!p.holes.some(h=>inside([x,y],h)))).map(r=>r.room_id);assert.deepEqual(actual,expected?[expected]:[])}return g}
for(let n=0;n<150;n++){let rooms=[];for(let i=0;i<20;i++){let x=Math.floor(rand()*7)*500,y=Math.floor(rand()*7)*500,w=(1+Math.floor(rand()*(8-x/500)))*500,h=(1+Math.floor(rand()*(8-y/500)))*500;rooms.push({id:'r'+i,x,y,w,h})}verify(rooms)}
verify([{id:'base',x:0,y:0,w:4000,h:4000},{id:'a',x:0,y:0,w:2000,h:2000},{id:'b',x:2000,y:2000,w:2000,h:2000}]);
verify([{id:'base',x:0,y:0,w:4000,h:4000},{id:'a',x:0,y:0,w:1000,h:1000},{id:'b',x:1000,y:1000,w:1000,h:1000}]);
ctx.state={width:40000,height:40000,rooms:Array.from({length:200},(_,i)=>({id:'p'+i,x:Math.floor(rand()*15000),y:Math.floor(rand()*15000),w:10000+Math.floor(rand()*10000),h:10000+Math.floor(rand()*10000)}))};let start=performance.now();let g=vm.runInContext('effectiveGeometry()',ctx);let ms=performance.now()-start;assert.ok(ms<3000,'200-room worst-case geometry should remain usable');
console.log(JSON.stringify({random_layouts:150,corner_cases:2,performance_200_rooms_ms:Math.round(ms),visible_rooms:g.rooms.filter(r=>r.area_mm2).length}));
