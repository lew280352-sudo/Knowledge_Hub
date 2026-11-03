import test from 'node:test';
import assert from 'node:assert/strict';
import {snapControl,refraction,opticalImage,slitSpacing,slitIntensity,resonance,pointSound,doppler,machGeometry,gratingAngle} from '../lib/physics-models.ts';
import {labs} from '../lib/labs.ts';
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Snell handles normal incidence, critical boundary and forbidden refracted angles',()=>{
 close(refraction(30,.5)!,Math.asin(.25));assert.equal(refraction(0,1.5),0);close(refraction(Math.asin(1/1.5)*180/Math.PI,1.5)!,Math.PI/2);assert.equal(refraction(50,1.5),null);
});
test('image signs and lens/mirror principal rays agree with image positions, including infinity',()=>{
 for(const u of [5,10,15,30,60])for(const f of [-20,-5,5,10,20]){
  const {v,m}=opticalImage(u,f);if(!Number.isFinite(v)){assert.equal(u,f);continue;}
  close(1/u+1/v,1/f);close(m,-v/u);
  // In coordinates relative to vertex: lens x=v, mirror x=-v.
  const h=1;close(-h+v*h/f,-h*m);close(v*h/u,-h*m);close(-h+(-v)*(-h/f),-h*m);close((-v)*(-h/u),-h*m);
  if(f<0){assert.ok(v<0);assert.ok(m>0&&m<1);}
 }
 assert.throws(()=>opticalImage(30,0),RangeError);
});
test('slit intensity has the right central limit, dark bands and scale without saturation',()=>{
 close(slitSpacing(600,2,.3),4);close(slitSpacing(700,3,.1),21);
 close(slitIntensity(0,600,2,.3,true),1);close(slitIntensity(4,600,2,.3,true),0);close(slitIntensity(2,600,2,.3),0);
 close(slitIntensity(12,600,2,.6,false,.2),0); // shared dark envelope: aλL gives 6mm, 12 is also dark
 for(const lambda of [400,700])for(const d of [.1,.8])for(const L of [.5,3])for(const y of [-16,0,16]){const I=slitIntensity(y,lambda,L,d,true);assert.ok(I>=0&&I<=1+1e-12);}
 close(gratingAngle(500,500,2)!,Math.PI/6);assert.equal(gratingAngle(700,1000,3),null);
});
test('resonance respects displacement boundary conditions at both ends and integer modes',()=>{
 for(const closed of [false,true])for(const n of [1,2,3,4]){
  const r=resonance(1,n,340,closed);close(r.frequency*r.wavelength,340);
  const kL=2*Math.PI*r.cycles;if(closed){close(Math.sin(0),0);close(Math.cos(kL),0);}else{close(Math.abs(Math.cos(0)),1);close(Math.abs(Math.cos(kL)),1);}
 }
 close(resonance(.5,2,340,true).frequency,510);assert.throws(()=>resonance(1,1.5,340,true),RangeError);assert.equal(snapControl(1.7,1,4,1),2);assert.equal(snapControl(9,1,4,1),4);
});
test('sound and supersonic models retain physical domains and limiting cases',()=>{
 const a=pointSound(.01,2),b=pointSound(.01,4);close(b.intensity/a.intensity,.25);close(b.level-a.level,-20*Math.log10(2));
 close(doppler(500,340,20),531.25);close(doppler(500,340,0),500);assert.throws(()=>doppler(500,340,340),RangeError);
 const m=machGeometry(1.25,800);close(m.horizontal,600);close(m.direct,1000);close(m.horizontal**2+800**2,m.direct**2);assert.throws(()=>machGeometry(1,800),RangeError);
});
test('guided labs have learning objectives, observation constraints and valid apply checkpoints',()=>{
 assert.equal(Object.keys(labs).length,18);for(const [id,lab]of Object.entries(labs)){assert.ok(lab.objective&&lab.prediction&&lab.observe, id);assert.ok(lab.apply.choices[lab.apply.answer]);assert.ok(lab.apply.explanation&&lab.apply.hint);}
});

test('models reject nonfinite inputs instead of producing invalid physical readouts',()=>{
 for(const bad of [NaN,Infinity,-Infinity]){
  for(const run of [()=>refraction(30,bad),()=>slitSpacing(600,bad,.3),()=>slitIntensity(bad,600,2,.3),()=>slitIntensity(0,600,2,.3,false,bad),()=>resonance(bad,1,340,true),()=>pointSound(1,bad),()=>doppler(440,bad,0),()=>machGeometry(bad,1),()=>gratingAngle(bad,500,1)])assert.throws(run,RangeError);
 }
});
test('open pipe displacement has antinodes at both ends, closed pipe a node and an antinode',()=>{
 for(const mode of [1,2,3,4]){
  const open=resonance(1,mode,340,false),closed=resonance(1,mode,340,true);
  close(Math.abs(Math.cos(0)),1);close(Math.abs(Math.cos(2*Math.PI*open.cycles)),1);
  close(Math.sin(0),0);close(Math.abs(Math.sin(2*Math.PI*closed.cycles)),1);
 }
});
