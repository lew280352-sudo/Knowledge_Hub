/** Units are stated at boundaries; no model evaluates outside its physical domain. */
export function snapControl(value:number,min:number,max:number,step:number){
 if(!Number.isFinite(value))return min;
 return Number(Math.max(min,Math.min(max,min+Math.round((value-min)/step)*step)).toPrecision(12));
}
export function refraction(angleDegrees:number,ratio:number){
 if(![angleDegrees,ratio].every(Number.isFinite)||!(angleDegrees>=0&&angleDegrees<=90&&ratio>0))throw new RangeError('invalid refraction');
 const sine=ratio*Math.sin(angleDegrees*Math.PI/180);
 return sine>1+1e-12?null:Math.asin(Math.min(1,sine));
}
export function opticalImage(u:number,f:number){
 if(!(u>0)||f===0||![u,f].every(Number.isFinite))throw new RangeError('invalid optics');
 const v=u===f?Infinity:f*u/(u-f);return {v,m:-v/u};
}
export function slitSpacing(wavelengthNm:number,distanceM:number,spacingMm:number){
 if(![wavelengthNm,distanceM,spacingMm].every(Number.isFinite)||!(wavelengthNm>0&&distanceM>0&&spacingMm>0))throw new RangeError('invalid slit parameters');
 return wavelengthNm*1e-3*distanceM/spacingMm; // mm on the screen
}
export function slitIntensity(offsetMm:number,wavelengthNm:number,distanceM:number,spacingMm:number,single=false,widthMm?:number){
 if(!Number.isFinite(offsetMm)||(widthMm!==undefined&&(!Number.isFinite(widthMm)||widthMm<=0)))throw new RangeError('invalid slit intensity');
 const beta=Math.PI*offsetMm/slitSpacing(wavelengthNm,distanceM,spacingMm);
 const sinc=(x:number)=>Math.abs(x)<1e-9?1:(Math.sin(x)/x)**2;
 if(single)return sinc(beta);
 return Math.cos(beta)**2*(widthMm===undefined?1:sinc(Math.PI*offsetMm/slitSpacing(wavelengthNm,distanceM,widthMm)));
}
export function resonance(length:number,mode:number,speed:number,closed:boolean,string=false){
 if(![length,mode,speed].every(Number.isFinite)||!(length>0&&speed>0&&Number.isInteger(mode)&&mode>=1))throw new RangeError('invalid mode');
 const wavelength=string||!closed?2*length/mode:4*length/(2*mode-1);
 return {wavelength,frequency:speed/wavelength,cycles:length/wavelength};
}
export function pointSound(power:number,distance:number){
 if(![power,distance].every(Number.isFinite)||!(power>0&&distance>0))throw new RangeError('invalid point source');
 const intensity=power/(4*Math.PI*distance**2);return {intensity,level:10*Math.log10(intensity/1e-12)};
}
export function doppler(frequency:number,speed:number,sourceSpeed:number,listenerSpeed=0){
 if(![frequency,speed,sourceSpeed,listenerSpeed].every(Number.isFinite)||!(frequency>0&&speed>0&&Math.abs(sourceSpeed)<speed&&Math.abs(listenerSpeed)<speed))throw new RangeError('subsonic model only');
 return frequency*(speed+listenerSpeed)/(speed-sourceSpeed);
}
export function machGeometry(mach:number,height:number){
 if(![mach,height].every(Number.isFinite)||!(mach>1&&height>0))throw new RangeError('supersonic model only');
 return {angle:Math.asin(1/mach),horizontal:height*Math.sqrt(mach**2-1),direct:height*mach};
}
export function gratingAngle(wavelengthNm:number,linesPerMm:number,order:number){
 if(![wavelengthNm,linesPerMm,order].every(Number.isFinite)||!(wavelengthNm>0&&linesPerMm>0&&Number.isInteger(order)))throw new RangeError('invalid grating');
 const sine=order*wavelengthNm*1e-6*linesPerMm;return Math.abs(sine)>1+1e-12?null:Math.asin(Math.max(-1,Math.min(1,sine)));
}
