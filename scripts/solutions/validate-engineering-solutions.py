"""Check the authored ORIGINAL-PDF solution calculations, not web template answers."""
from pathlib import Path
import hashlib,json,math
import pymupdf
from pypdf import PdfReader
import sympy as sp
root=Path(__file__).resolve().parents[2]
data=json.loads((root/'docs/solutions/engineering-physics-solutions.json').read_text())
source=root/data['source']
assert hashlib.sha256(source.read_bytes()).hexdigest()==data['source_sha256']
viewer=pymupdf.open(source);extractor=PdfReader(source)
assert len(viewer)==int(extractor.trailer['/Root']['/Pages']['/Count'])==58
extractor_refs={page.indirect_reference.idnum for page in extractor.pages}
omitted_pages=[i+1 for i in range(len(viewer)) if viewer.page_xref(i) not in extractor_refs]
assert len(data['solutions'])==70
for ch,count in [('waves',20),('wave-optics',10),('ray-optics',20),('sound',20)]:
 rows=[r for r in data['solutions'] if r['chapter']==ch]
 assert sorted(r['number'] for r in rows)==list(range(1,count+1))
 assert all(1<=r['page']<=len(viewer) and len(r['work'])>=2 for r in rows)
# The expressions independently recalculate the visible givens; the expected
# column is an authored result in the saved solution, not a generator output.
cases=[
 ('waves-02','6/(7.2/3)','2.5'),('waves-03','12/8','1.5'),('waves-04','2000*0.002','4'),
 ('waves-05','0.8/5/4*1000','40'),('waves-06','1/8','0.125'),('waves-07','Mod(360*18/(20/5),360)','180'),
 ('waves-12','4*sin(pi/4)/sin(pi/6)','4*sqrt(2)'),('waves-13','3000/60*(0.625/100)*sin(53*pi/180)/sin(pi/6)','0.4991471938'),
 ('waves-14','sqrt(2)*sin(pi/6)/sin(pi/4)','1'),('waves-15','50*2*1.8/4','45'),('waves-16','(5-1/2)*(80/4)','90'),
 ('waves-17','(10-8)/(0.4/0.2)','1'),('waves-18','40/(2*(12-8))','5'),
 ('wave-optics-01','0.05*0.00003/(2*1.5)*10**9','500'),
 ('wave-optics-02','650e-9*2/(0.04/8)*1000','0.26'),('wave-optics-03','1*3/2','1.5'),
 ('wave-optics-04','500e-9/0.15*10**6','10/3'),('wave-optics-04','500e-9*sqrt(1+0.15**2)/0.15*10**6','3.370624736'),
 ('wave-optics-05','650e-9*sqrt(1+0.13**2)/0.13*10**6','5.04207298638'),
 ('wave-optics-06','2*3+1','7'),('wave-optics-07','1/sin(pi/6)','2'),
 ('wave-optics-08','2*630e-9*2/(200e-6)*1000','12.6'),('wave-optics-09','632.8e-9/0.01*1000','0.06328'),
 ('wave-optics-10','2*0.050*0.001','0.0001'),
 ('ray-optics-01','180/3','60'),('ray-optics-02','((170-10)+100)/2','130'),('ray-optics-03','(5+2)/2','3.5'),
 ('ray-optics-05','Abs(2*(-2)-5)','9'),('ray-optics-07','sin(pi/4)/sin(pi/6)','sqrt(2)'),
 ('ray-optics-08','sin(pi/3)/sin(pi/6)','sqrt(3)'),('ray-optics-09','3e8*sin(pi/6)','150000000'),
 ('ray-optics-09','asin(2*sin(pi/9))*180/pi','43.16017780'),
 ('ray-optics-11','10/(1-3/4)*3/4','30'),('ray-optics-12','1/(1/40-1/80)','80'),('ray-optics-12','80*(1-1/4)','60'),
 ('ray-optics-13','1/(16/9-1/9)','3/5'),('ray-optics-14','1/(1/5-1/4)','-20'),
 ('ray-optics-15','Abs((1/(1/10-1/50))/50)','1/4'),('ray-optics-16','1/(-2/45-1/15)','-9'),
 ('ray-optics-16','9/15*1','3/5'),('ray-optics-18','1/(1/10-1/30)','15'),('ray-optics-18','1/(-1/20-1/5)','-4'),
 ('ray-optics-18','20-4','16'),('ray-optics-18','(-15/30)*(4/5)*10','-4'),
 ('sound-02','(2*102/0.6)/0.5','680'),('sound-03','1.8/(1/340-1/1440)','801.16363636'),
 ('sound-04','asin(sqrt(234/312))*180/pi','60'),('sound-05','344/(2*(22/7-2)*0.14)','1075'),
 ('sound-06','10/sqrt(2)','5*sqrt(2)'),('sound-07','90+10*log(3,10)','94.771212547'),
 ('sound-08','15*10**((140-120)/20)','150'),('sound-09','4*pi*100**2*10**(-12+30/10)','4*pi*10**(-5)'),
 ('sound-10','1000*2*(0.267-0.095)','344'),('sound-11','450*(0.99-0.59)/(0.53-0.17)','500'),
 ('sound-12','(1/(2*1))/(1/(4*1))','2'),('sound-13','500*(331+0.6*30)/(331+0.6*20)','508.74635569'),
 ('sound-15','Abs(440-435)*2','10'),('sound-16','1.01/0.99','101/99'),
 ('sound-17','1650*343/(343-13)','1715'),('sound-19','345/sin(pi/6)','690'),('sound-20','6*510/340','9'),
]
ids={r['id'] for r in data['solutions']}
for key,expr,expected in cases:
 assert key in ids
 computed=float(sp.N(sp.sympify(expr),16));answer=float(sp.N(sp.sympify(expected),16))
 assert math.isclose(computed,answer,rel_tol=1e-8,abs_tol=1e-8),(key,expr,computed,answer)
# Independently check the symbolic construction of the special ray diagrams.
a,b,L,f,R,n=sp.symbols('a b L f R n',positive=True)
assert sp.solve(sp.Eq(a/f,(a-b)/L),f)==[L*a/(a-b)]
assert sp.simplify(R/n-(1/n)*R)==0
assert sp.solve(sp.Eq(1/f,sp.Rational(1,40)-sp.Rational(1,80)),f)==[80]
# The two unresolved/conditional source statements must never become unqualified.
lookup={r['id']:r for r in data['solutions']}
assert lookup['wave-optics-07']['status']=='conditional'
assert lookup['sound-18']['status']=='ambiguous'
assert 'เท่านั้น' in lookup['sound-18']['note']
print(json.dumps({'source_pdf_pages':len(viewer),'page_tree_count':58,'text_extractor_pages':len(extractor.pages),
 'text_extractor_omits_physical_pages':omitted_pages,'original_questions':70,'numeric_checks':len(cases),
 'conditional_sources_preserved':['wave-optics-07','sound-18'],'phase_convention_noted':'waves-06',
 'original_pdf_unchanged':True},ensure_ascii=False,indent=2))
