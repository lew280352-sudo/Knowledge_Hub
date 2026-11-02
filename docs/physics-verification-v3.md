# Physics verification — V3.0

Reviewed 2 November 2026 (Asia/Bangkok). Scope: the new s02–s20 teaching layers, guided-lab prompts and changed SVG models. s01 content is preserved and its fixed-speed/phase checks remain in the suite. Existing 70 question templates are unchanged and retain independent baseline fixtures plus 5,600 seeded-variant checks. This is source-based engineering verification, not an independent educator's endorsement or an official answer key.

## Method and release checks

Every added stage defines quantities/units and assumptions. Algebra and dimensions were reviewed against the relationships below; all 57 new numerical worked examples are compared with separate arithmetic/geometry in `tests/curriculum-v3.test.ts`. These oracles do not call the production physics helpers. `tests/physics-models.test.ts` separately checks boundaries and diagram geometry. Strict KaTeX parsing covers canonical, variant and generated-solution formulas. Browser tests exercise visible constraints, infinity/TIR readouts, image signs and absence of NaN/Infinity SVG coordinates.

SI is the default. Display controls explicitly declare cm, mm, nm, km or degrees. Unit conversions occur at model boundaries. Angles in trigonometric functions are radians; degrees are a labelled presentation unit. dB is a logarithmic level, not the SI unit of intensity; °C is used only in the stated empirical temperature approximation. Dimensionless quantities include phase ratios, magnification, refractive index, harmonic number and Mach number.

| Stages | Relationships and dimensional check | Assumptions / checked limits |
| --- | --- | --- |
| s01–s03 | v=fλ (m/s); y=y₁+y₂ (m); v=√(F/μ), N/(kg/m)=m²/s² | Linear superposition; same point/time; equal-frequency phase resultant; fixed/free endpoints; tension and density scaling. Cancellation at one point does not imply loss of total energy. |
| s04–s05 | sinθ₁/sinθ₂=v₁/v₂; Δr=nλ or half-integer λ; L=nλ/2 | Stationary boundary, coherent sources with stated phase; angles from normal; \|sinθ₂\|≤1; \|Δr\|≤source separation. Standing-wave endpoint model is distinguished from two-source interference. |
| s06–s09 | Δy≈λL/d; d sinθ=nλ; a sinθ=mλ; width≈2λL/a; n/d=m/a | Fraunhofer/small-angle screen patterns; exact angular comparison when the approximation fails. Grating orders are integers; ±90° does not reach a finite perpendicular screen. Missing orders require a common integer pair, not rounding. Combined pattern multiplies cos² by sinc². |
| s10–s12 | plane mirror \|v\|=u; n=c/v; n₁sinθ₁=n₂sinθ₂; sinθc=n₂/n₁; apparent depth≈d n_observer/n_object | Ideal flat interface, stationary media; TIR only high-to-low index and above θc. Depth formula near normal only. Virtual mirror images use dashed backprojections. |
| s13–s15 | 1/f=1/u+1/v (m⁻¹); m=−v/u; u₂=D−v₁; m_total=m₁m₂ | Thin/paraxial optics, explicit signs. Real objects u>0; diverging f<0. u=f produces parallel outgoing rays. Mirrors reflect toward the object side; lens rays transmit. Two-lens examples allow virtual objects with u₂<0; interactive single-element controls do not. RGB/filter examples are ideal and separate additive light from selective absorption. |
| s16–s17 | echo 2d=vt; Δt=d(1/v₁−1/v₂); I=P/(4πr²) (W/m²); β=10log₁₀(I/I₀) | Uniform media; air v≈331+0.6T_C near room temperature only; √T uses K. Point isotropic source, no absorption/reflections. Log input dimensionless. Independent source intensities add; coherent sources need phase. Doubling r quarters I and changes level by −6.0206 dB. |
| s18–s19 | closed tube λ=4L/(2n−1), open tube/string λ=2L/n; f=v/λ; f_b=|f₁−f₂|; f_L=f_s(v+v_L)/(v−v_S) | Ideal displacement endpoints, integer modes, no end correction. Closed-tube mode 2 is harmonic 3. Difference of adjacent resonant lengths removes a constant end correction. Classical axial sound Doppler is subsonic in the medium frame, with approach-positive signs. |
| s20 | M=v_S/v; sinμ=1/M; s=h√(M²−1); x=hM | M>1, constant horizontal motion, uniform medium. x²=h²+s²; M→1⁺ makes μ→90°. Geometry does not predict boom strength. |

## Diagram corrections and model scope

- Image formation now draws physical outgoing principal rays; only virtual-image backprojections are dashed. Lens and mirror signs agree with intersections, magnification and image orientation. SVG scale adjusts to fit the image; captions declare paraxial/rescaled geometry.
- s10 has a plane-mirror construction rather than a string-end reflection illustration. s07 shows angular grating directions rather than a double-slit intensity plot. s09 includes a single-slit envelope and keeps a<d.
- Screen fringes use a fixed 8 SVG units/mm rather than saturating the calculated spacing. Display resolution can limit how finely very dense fringes are visually separated; the numeric spacing remains available.
- Refraction handles normal, critical and forbidden-angle cases separately. Numerical tolerance only handles roundoff at the critical equality; it does not clamp physically impossible angles into existence.
- Resonance numeric input snaps to integer mode. Tube end type determines the displacement boundary, not a decorative waveform. The static examination diagram preserves its supplied driving frequency.
- Doppler controls stay at 0–150 m/s with v=340 m/s; shock controls stay at M=1.1–2.5. No negative-frequency extrapolation crosses the sound-speed singularity.
- Sound compression bars and two-source phase circles are schematic. The fixed-speed wave lab is a static nondispersive sinusoid, not a fluid/elastic energy solver. RGB is an ideal illustration, not a colorimetry simulator.

## Reference ledger

The Thai explanations are newly authored. Primary educational relationships were checked against:

- [OpenStax University Physics 1 §16.2 — Mathematics of Waves](https://openstax.org/books/university-physics-volume-1/pages/16-2-mathematics-of-waves), [§16.5 — Interference of Waves](https://openstax.org/books/university-physics-volume-1/pages/16-5-interference-of-waves), [§16.6 — Standing Waves and Resonance](https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance).
- [University Physics 3 §1.3 — Refraction](https://openstax.org/books/university-physics-volume-3/pages/1-3-refraction), [§1.4 — Total Internal Reflection](https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection), [§2.1 — Plane Mirrors](https://openstax.org/books/university-physics-volume-3/pages/2-1-images-formed-by-plane-mirrors), [§2.2 — Spherical Mirrors](https://openstax.org/books/university-physics-volume-3/pages/2-2-spherical-mirrors), [§2.4 — Thin Lenses](https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses).
- [University Physics 3 §4.1 — Single-Slit Diffraction](https://openstax.org/books/university-physics-volume-3/pages/4-1-single-slit-diffraction), [§4.3 — Double-Slit Diffraction](https://openstax.org/books/university-physics-volume-3/pages/4-3-double-slit-diffraction), [§4.4 — Diffraction Gratings](https://openstax.org/books/university-physics-volume-3/pages/4-4-diffraction-gratings).
- [University Physics 1 §17.3 — Sound Intensity](https://openstax.org/books/university-physics-volume-1/pages/17-3-sound-intensity), [§17.4 — Normal Modes](https://openstax.org/books/university-physics-volume-1/pages/17-4-normal-modes-of-a-standing-sound-wave), [§17.7 — Doppler Effect](https://openstax.org/books/university-physics-volume-1/pages/17-7-the-doppler-effect), [§17.8 — Shock Waves](https://openstax.org/books/university-physics-volume-1/pages/17-8-shock-waves).
- [College Physics 2e §26.3 — Color and Color Vision](https://openstax.org/books/college-physics-2e/pages/26-3-color-and-color-vision) supports the distinction between additive light and object reflection/absorption; app examples explicitly idealize RGB components.

## New worked-example results

These are declared content values; the independent calculations are in the test file above. Units of `1` mean dimensionless; bands/order are counts. Degree outputs are also identified in the lesson as angle presentation rather than SI radians.

| Stage | Level | Checked results |
| --- | --- | --- |
| s02 | foundation | 0.02 m |
| s02 | standard | 0.5 m; 0.025 m |
| s02 | advanced | 0.01 m |
| s03 | foundation | -0.02 m |
| s03 | standard | 60 m/s; 2 m |
| s03 | advanced | 20 m/s; 2 m |
| s04 | foundation | 0.8 m; 0.4 m |
| s04 | standard | 14.47751219 degree |
| s04 | advanced | 30 degree |
| s05 | foundation | 0.8 m; 0.2 m |
| s05 | standard | 0.8 m; 30 Hz |
| s05 | advanced | 0.8 m; 1.2 m |
| s06 | foundation | 0.002 m |
| s06 | standard | 5e-7 m |
| s06 | advanced | 0.5773502692 m; 0.5 m |
| s07 | foundation | 0.000002 m |
| s07 | standard | 30 degree |
| s07 | advanced | 7 bands |
| s08 | foundation | 0.008 m |
| s08 | standard | 0.0003 m |
| s08 | advanced | 0.5773502692 m |
| s09 | foundation | 5 bands |
| s09 | standard | 3 order; 5 bands |
| s09 | advanced | 5 order; 5 bands |
| s10 | foundation | 1.4 m |
| s10 | standard | 0.85 m |
| s10 | advanced | 10 degree |
| s11 | foundation | 200000000 m/s |
| s11 | standard | 4e-7 m |
| s11 | advanced | 30 degree |
| s12 | foundation | 30 degree |
| s12 | standard | 0.45 m; 0.15 m |
| s12 | advanced | 41.8103149 degree |
| s13 | foundation | 0.15 m |
| s13 | standard | 0.15 m; -0.5 1; -0.02 m |
| s13 | advanced | -0.1 m; 2 1 |
| s14 | foundation | 0.2 m |
| s14 | standard | 0.3 m; -1 1 |
| s14 | advanced | -0.075 m; 0.25 1 |
| s15 | foundation | 0.25 m |
| s15 | standard | 0.0625 m; 0.125 1 |
| s15 | advanced | -0.1 m; 0.03333333333 m |
| s16 | foundation | 343 m/s |
| s16 | standard | 68 m |
| s16 | advanced | 0.2274509804 s |
| s17 | foundation | 0.25 1 |
| s17 | standard | 60 dB |
| s17 | advanced | 66.02059991 dB |
| s18 | foundation | 170 Hz; 2 m |
| s18 | standard | 0.6 m; 550 Hz |
| s18 | advanced | 510 Hz; 340 Hz; 1.5 1 |
| s19 | foundation | 4 Hz |
| s19 | standard | 531.25 Hz |
| s19 | advanced | 546.875 Hz |
| s20 | foundation | 2 1; 30 degree |
| s20 | standard | 2000 m; 1732.050808 m |
| s20 | advanced | 600 m; 1000 m |
