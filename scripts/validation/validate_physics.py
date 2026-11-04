"""Independent prompt-based numeric oracles + separate symbolic identities.
Run from the repo root: python scripts/validation/validate_physics.py
No runtime helper or generated answer is used to calculate the oracle.
"""
import json
import math as m
import re
import subprocess
from pathlib import Path
import sympy as s
from pypdf import PdfReader
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
DATA = json.loads(subprocess.check_output(
    ['node', '--experimental-strip-types', 'scripts/export-physics-audit.mjs'], cwd=ROOT, text=True))

def sin(a): return m.sin(m.radians(a))
def asin(a): return m.degrees(m.asin(a))
def image(u, f): return 1 / (1/f - 1/u)
def numbers(prompt):
    prompt = prompt.split('(เลือกค่าที่ใกล้เคียงที่สุด')[0]
    return [float(n.replace('−', '-')) for n in re.findall(r'[-−]?\d+(?:\.\d+)?', prompt)]

# Each function reads the givens from the visible problem, not its PRNG or seed.
ORACLES = {
 'waves-2': (lambda a: a[0]*(a[2]-a[1])/a[3], 'Hz'),
 'waves-3': (lambda a: a[0]/a[1], 'cm/s'),
 'waves-4': (lambda a: a[0]*a[1]*1e-3, 'm'),
 'waves-5': (lambda a: 1000*a[0]/(4*a[1]), 'ms'),
 'waves-6': (lambda a: 1/a[1], 'Hz'),
 'waves-7': (lambda a: (360*a[2]*a[1]/a[0]) % 360, '°'),
 'waves-8': (lambda a: sum(a), 'cm'),
 'waves-12': (lambda a: a[0]*sin(a[2])/sin(a[1]), 'm/s'),
 'waves-13': (lambda a: a[0]*.01*a[1], 'm/s'),
 'waves-14': (lambda a: a[2]*sin(a[1])/sin(a[0]), 'cm'),
 'waves-15': (lambda a: 2*a[0]*a[2]/a[1], 'm/s'),
 'waves-16': (lambda a: a[1]/a[0], 'cm'),
 'waves-18': (lambda a: a[1]/(a[0]-.5), 'cm'),
 'wave-optics-1': (lambda a: (a[3]*.01)*(a[0]*.001)/(a[2]*a[1])*1e9, 'nm'),
 'wave-optics-2': (lambda a: a[0]*1e-9*a[1]/(a[4]*.01/(a[3]-a[2]))*1000, 'mm'),
 'wave-optics-3': (lambda a: a[2]*.001*a[0]*.001/(a[1]*1e-9), 'm'),
 'wave-optics-4': (lambda a: sin(a[2])/(a[1]*a[0]*1e-6), 'เส้น/mm'),
 'wave-optics-5': (lambda a: asin(a[2]*a[0]*1e-9/(a[1]*1e-6)), '°'),
 'wave-optics-6': (lambda a: 2*(m.ceil((1/(a[1]*100))/(a[0]*1e-9))-1)+1, 'แถบ'),
 'wave-optics-7': (lambda a: a[0]*1e-3/sin(a[1]), 'μm'),
 'wave-optics-8': (lambda a: 2*a[0]*1e-9*a[2]/(a[1]*1e-6)*1000, 'mm'),
 'wave-optics-9': (lambda a: a[0]*1e-9*a[1]/(a[-1]*.01)*1000, 'mm'),
 'wave-optics-10': (lambda a: a[0]/a[2], 'μm'),
 'ray-optics-1': (lambda a: 360/(a[0]+1), '°'),
 'ray-optics-2': (lambda a: a[0]/2, 'cm'),
 'ray-optics-3': (lambda a: abs(a[1]-(2*a[0]-a[2])), 'm'),
 'ray-optics-4': (lambda a: 2*a[0], '°'),
 'ray-optics-5': (lambda a: 2*(a[0]+a[1]), 'm/s'),
 'ray-optics-6': (lambda a: a[0]/a[1], 'nm'),
 'ray-optics-7': (lambda a: a[0]*sin(a[1])/sin(a[2]), ''),
 'ray-optics-8': (lambda a: 1/sin(a[0]), ''),
 'ray-optics-9': (lambda a: 3e8*sin(a[0]), 'm/s'),
 'ray-optics-10': (lambda a: a[1]/a[0], 'cm'),
 'ray-optics-11': (lambda a: a[2]/(1-a[1]/a[0]), 'cm'),
 'ray-optics-12': (lambda a: 1/(1/a[0]-1/(a[0]*a[1])), 'cm'),
 'ray-optics-13': (lambda a: 1/(a[1]/a[0]-1/a[0]), 'cm'),
 'ray-optics-14': (lambda a: 1/(1/a[0]-1/(a[0]*a[1])), 'cm'),
 'ray-optics-15': (lambda a: abs(image(a[2], a[0]/2)/a[2])*a[1], 'cm'),
 'ray-optics-16': (lambda a: image(a[1], -a[0]/2), 'cm'),
 'ray-optics-17': (lambda a: 1/(1/a[0]+1/a[1]), 'cm'),
 'ray-optics-18': (lambda a: abs((-image(a[2],a[1])/a[2]) * (-image(a[3]-image(a[2],a[1]),a[4])/(a[3]-image(a[2],a[1]))))*a[0], 'cm'),
 'sound-2': (lambda a: 2*a[0]/(a[1]*a[2]), 'Hz'),
 'sound-3': (lambda a: a[0]/(1/a[1]-1/a[2]), 'm'),
 'sound-4': (lambda a: asin(a[0]/a[1]), '°'),
 'sound-5': (lambda a: a[1]/(2*(a[2]/a[3]-2)*a[0]*.01), 'Hz'),
 'sound-6': (lambda a: a[0]/m.sqrt(a[1]), 'm'),
 'sound-7': (lambda a: 10*m.log10(a[1]*10**(a[0]/10)), 'dB'),
 'sound-8': (lambda a: a[1]*10**((a[0]-a[2])/20), 'm'),
 'sound-9': (lambda a: 4*m.pi*a[1]**2*1e-12*10**(a[0]/10), 'W'),
 'sound-10': (lambda a: a[0]*2*a[1]*.01, 'm/s'),
 'sound-11': (lambda a: a[2]*a[1]/a[0], 'Hz'),
 'sound-12': (lambda a: 2, 'เท่า'),
 'sound-13': (lambda a: a[0]*m.sqrt((a[2]+a[3])/(a[1]+a[3])), 'Hz'),
 'sound-14': (lambda a: a[1]/(2*a[0]), 'Hz'),
 'sound-15': (lambda a: abs(a[1]-a[0])*a[2], 'ครั้ง'),
 'sound-16': (lambda a: (1+a[0])/(1-a[0]), 'เท่า'),
 'sound-17': (lambda a: a[0]/(1-a[1]/a[2]), 'Hz'),
 'sound-19': (lambda a: a[1]/sin(a[0]), 'm/s'),
 'sound-20': (lambda a: a[0]*a[1]/a[2], 'km'),
}

# Reviewed concept answers are a separate checklist, never an algebraic proof.
CONCEPTS = {'waves-1','waves-9','waves-10','waves-11','waves-17','waves-19','waves-20',
            'ray-optics-19','ray-optics-20','sound-1','sound-18'}

def check_questions():
    checked = 0
    for q in DATA['questions']:
        if q['sourceId'] in CONCEPTS:
            assert 'numericAnswer' not in q
            a=numbers(q['prompt'])
            if q['sourceId']=='waves-17':
                assert q['answer']==f'ปฏิบัพลำดับที่ {round(a[1]/a[0])}'
            if q['sourceId']=='waves-19':
                ratio=a[0]/a[1]
                bright=sum(abs(n)<ratio for n in range(-10,11))
                dark=sum(abs(n+.5)<ratio for n in range(-10,11))
                assert q['answer']==f'ปฏิบัพ {bright} แนว และบัพ {dark} แนว'
            continue
        calculate, unit = ORACLES[q['sourceId']]
        expected = calculate(numbers(q['prompt']))
        actual = q['numericAnswer']
        assert m.isclose(actual, expected, rel_tol=1e-10, abs_tol=1e-10), (q['sourceId'], q['seed'], expected, actual)
        answer = re.fullmatch(r'([-+\d.eE]+)\s*(.*)',q['answer'])
        assert answer and answer[2] == unit, (q['sourceId'],q['answer'],unit)
        quantum = 10**(m.floor(m.log10(abs(expected)))-3) if expected else 1e-12
        assert abs(float(answer[1])-expected) <= .500001*quantum, (q['sourceId'],q['answer'],expected)
        assert q['choices'].count(q['answer']) == 1
        assert len(set(q['choices'])) == 4
        checked += 1
    assert set(ORACLES) | CONCEPTS == {q['id'] for q in DATA['sources']}
    return checked


def check_symbolic():
    u,v,f,L,n,lam,speed,I,I0,P,r,M,h = s.symbols('u v f L n lam speed I I0 P r M h', positive=True)
    identities = {
        'image equation solved for v': (1/u + 1/(f*u/(u-f)) - 1/f),
        'wave frequency-period relation': (speed/lam - 1/(lam/speed)),
        'string frequency': (speed/(2*L/n) - n*speed/(2*L)),
        'closed-pipe frequency': (speed/(4*L/(2*n-1))-(2*n-1)*speed/(4*L)),
        'Mach right triangle': ((h*M)**2 - h**2 - (h*s.sqrt(M**2-1))**2),
        'point-source inverse square': ((P/(4*s.pi*(2*r)**2))/(P/(4*s.pi*r**2))-s.Rational(1,4)),
        'stationary Doppler limit': (f*(speed+0)/(speed-0)-f),
        'slit conversion nm, m, mm to mm': (s.Rational(1,10**9)/s.Rational(1,1000)*1000-s.Rational(1,1000)),
    }
    for name,residual in identities.items():
        assert s.simplify(residual)==0, (name,residual)
    # Dimensions of reference relationships, not of arbitrary prose or parsed LaTeX.
    length,time,mass=s.symbols('length time mass',positive=True)
    dimensions=[((1/time)*length,length/time),
        (s.sqrt((mass*length/time**2)/(mass/length)),length/time),
        ((mass*length**2/time**3)/(length**2),mass/time**3),
        (length/(length/time),time)]
    for left,right in dimensions: assert s.simplify(left/right)==1
    return len(identities),len(dimensions)


def check_examples():
    # Independently calculated results, in the authored example's declared order.
    E={
      's02':[[.03-.01],[2*.25,.04-.015],[2*.01*m.cos(m.pi/3)]],
      's03':[[-.02],[m.sqrt(36/.01),m.sqrt(36/.01)/30],[40/m.sqrt(4),40/m.sqrt(4)/10]],
      's04':[[4/5,2/5],[asin(.5*sin(30))],[asin(2/4)]],
      's05':[[2*.4,.4/2],[2*1.2/3,24/(2*1.2/3)],[2*.4,3*.4]],
      's06':[[500e-9*2/.0005],[(.01/5)*.0005/2],[m.tan(m.asin(.5)),.5]],
      's07':[[1/(500*1000)],[asin(2*.5/2)],[7]],
      's08':[[2*600e-9*2/.0003],[2*600e-9*3/.012],[m.tan(m.asin(.5))]],
      's09':[[5],[.6/.2,5],[5,5]],
      's10':[[.7*2],[1.7/2],[5*2]],'s11':[[3e8/1.5],[600e-9/1.5],[asin(sin(45)/m.sqrt(2))]],
      's12':[[asin(.5)],[.6/(4/3),.6-.6/(4/3)],[asin(1/1.5)]],
      's13':[[image(.3,.1)],[image(.3,.1),-image(.3,.1)/.3,-image(.3,.1)/.3*.04],[image(.05,.1),2]],
      's14':[[.4/2],[image(.3,.15),-1],[image(.3,-.1),.25]],
      's15':[[.4-.15],[.05*.25/(.25-.05),(-.15/.3)*(-.0625/.25)],[.2-.3,.05*(-.1)/(-.1-.05)]],
      's16':[[331+.6*20],[340*.4/2],[100/340-100/1500]],
      's17':[[(2/4)**2],[10*m.log10(1e-6/1e-12)],[60+10*m.log10(4)]],
      's18':[[340/(4*.5),4*.5],[2*(.5-.2),330/(2*(.5-.2))],[3*340/(4*.5),340/(2*.5),1.5]],
      's19':[[abs(440-444)],[500*340/(340-20)],[500*(340+10)/(340-20)]],
      's20':[[680/340,asin(1/2)],[1000*2,m.sqrt(2000**2-1000**2)],[m.sqrt(1000**2-800**2),800*1.25]],
    }
    levels=['foundation','standard','advanced']
    for ex in DATA['examples']:
        stage,level=ex['id'].split('-');expected=E[stage][levels.index(level)]
        assert len(expected)==len(ex['results']),ex['id']
        for value,result in zip(expected,ex['results']):
            assert result['unit'] and m.isclose(value,result['value'],rel_tol=1e-8,abs_tol=1e-10),(ex['id'],value,result)
    # s01 has no results metadata: check its actual authored numerical claims.
    first={ex['id']:ex for ex in DATA['firstWave']}
    claims={
      's01-foundation-2':('v = 4 × 2 = 8 m/s', 4*2, 8),
      's01-standard-2':('v = λ/T = 0.8/0.2 = 4 m/s', .8/.2,4),
      's01-advanced-0':('v = 6/1.5 = 4 m/s',6/1.5,4),
      's01-advanced-1':('ω = 4π rad/s จึง f = ω/(2π) = 2 Hz',4*m.pi/(2*m.pi),2),
      's01-advanced-2':('หลังเปลี่ยน λ = 12/6 = 2 m',12/6,2),
      's01-advanced-3':('Δφ = kΔx − ωΔt = 45°',m.degrees(m.pi*.75-4*m.pi*.125),45),
    }
    assert set(first)==set(claims)
    for key,(claim,computed,expected) in claims.items():
        assert claim in ' '.join(first[key]['steps']),key
        assert m.isclose(computed,expected),key
    return len(DATA['examples'])+len(first)

if __name__=='__main__':
    reader=PdfReader(ROOT/'public/reference.pdf')
    pages=len(pymupdf.open(ROOT/'public/reference.pdf'))
    assert pages==int(reader.trailer['/Root']['/Pages']['/Count'])==58,pages
    assert all(1<=q['page']<=pages for q in DATA['sources'])
    assert all(1<=page<=pages for stage in DATA['stages'] for page in stage['sourcePages'])
    numeric=check_questions();symbolic,dimensions=check_symbolic();examples=check_examples()
    print(json.dumps({'reference_pdf_pages':pages,'text_extractor_pages':len(reader.pages),'numeric_cases':numeric,'numeric_templates':len(ORACLES),
        'concept_templates_reviewed_separately':len(CONCEPTS),'worked_examples':examples,
        'symbolic_identities':symbolic,'dimensional_reference_checks':dimensions,
        'conceptual_correctness_proved_by_algebra':False},indent=2))
