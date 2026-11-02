/** Ideal sinusoid in one nondispersive medium; SI units, snapshot at t=0. */
export function fixedSpeedWave(speed:number,frequency:number,amplitude:number){
 if(!(speed>0&&frequency>0&&amplitude>=0)||![speed,frequency,amplitude].every(Number.isFinite))throw new RangeError('invalid wave parameters');
 const wavelength=speed/frequency,period=1/frequency;
 return {speed,frequency,amplitude,wavelength,period,displacement:(x:number)=>amplitude*Math.sin(2*Math.PI*x/wavelength)};
}
