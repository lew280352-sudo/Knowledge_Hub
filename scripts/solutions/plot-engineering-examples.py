from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
out=Path('docs/solutions');out.mkdir(exist_ok=True)
x=np.linspace(0,18,1801)
left=np.interp(x-6,[1,3,5],[0,1,0],left=0,right=0)
right=np.interp(x+6,[13,15,17],[1,0,1],left=0,right=0)
fig,ax=plt.subplots(3,1,figsize=(7,4.8),sharex=True)
for a,y,title in zip(ax,[left,right,left+right],['Left pulse after 3 s','Right pulse after 3 s','Sum: rectangular pulse, width = 20 cm']):
 a.plot(x,y,lw=2);a.axhline(0,color='gray',lw=.7);a.set_ylim(-.1,1.2);a.set_ylabel('y/A');a.set_title(title,fontsize=10);a.grid(alpha=.25)
ax[-1].set_xlabel('Horizontal grid position (1 cell = 5 cm)');fig.tight_layout();fig.savefig(out/'pulse-superposition.svg');plt.close(fig)
x=np.linspace(0,8,801)
def F(t):return np.interp(t,[2,6,7],[0,2,0],left=0,right=0)
incident=F(x-4);reflected=-F(12-x)
assert abs((incident+reflected)[-1])<1e-12
assert abs((incident+reflected)[600]+2)<1e-12
fig,ax=plt.subplots(2,1,figsize=(7,4.4),sharex=True)
ax[0].plot(x,incident,'--',label='incident');ax[0].plot(x,reflected,'--',label='reflected');ax[0].legend()
ax[1].plot(x,incident+reflected,lw=2,label='total at t = 4 s');ax[1].legend()
for a in ax:a.axhline(0,color='gray',lw=.7);a.axvline(8,color='black');a.set_ylim(-2.5,2.5);a.set_ylabel('Grid displacement');a.grid(alpha=.25)
ax[-1].set_xlabel('Grid position: fixed endpoint x = 8');fig.tight_layout();fig.savefig(out/'fixed-end-reflection.svg');plt.close(fig)
