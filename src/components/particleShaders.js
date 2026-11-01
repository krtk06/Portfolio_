/**
 * Shader source for the particle field. Kept out of the component so the
 * scene lifecycle stays readable and the GLSL can be scanned on its own.
 *
 * `uMouse` is always declared. When mouse interaction is off the uniform is
 * left at (50, 50, 50), which is far outside the figure and therefore never
 * triggers the repulsion branch.
 */
export const VERTEX_SHADER = `
  attribute vec3 aTarget;
  attribute vec3 aColor;
  attribute vec3 aTargetColor;
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uMorph;
  uniform float uPresence;
  uniform float uTilt;
  uniform float uSpin;
  uniform float uFlow;
  uniform float uDrift;
  uniform float uStill;
  uniform float uNoiseScale;
  uniform float uFlowSpeed;
  uniform vec3 uMouse;
  varying float vFade;
  varying vec3 vColor;

  /* 3D simplex noise (Ashima / Stefan Gustavson). The field needs a smooth,
     cheap function of position to sample, and this is the usual one: a
     handful of hashed gradients, interpolated. */
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  vec3 snoiseVec3(vec3 p) {
    return vec3(
      snoise(p),
      snoise(p + vec3(19.19, 7.13, 3.37)),
      snoise(p + vec3(11.31, 27.70, 5.50))
    );
  }

  /* Curl of a noise potential: the direction the noise field would swirl in.
     Because it is a curl, it is divergence-free, so particles are carried
     around in loops rather than piled up — the difference between a fluid
     and a drift. */
  vec3 curlNoise(vec3 p) {
    const float e = 0.06;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 p0 = snoiseVec3(p);
    vec3 px = snoiseVec3(p + dx);
    vec3 py = snoiseVec3(p + dy);
    vec3 pz = snoiseVec3(p + dz);

    float x = (py.z - p0.z) - (pz.y - p0.y);
    float y = (pz.x - p0.x) - (px.z - p0.z);
    float z = (px.y - p0.y) - (py.x - p0.x);
    /* Direction only; the caller decides how far along it to travel. */
    return normalize(vec3(x, y, z));
  }

  /* Rotate about Y then tilt about X, so the figure turns and tips as the
     reader moves down the page. */
  vec3 orient(vec3 p) {
    float c = cos(uSpin);
    float sn = sin(uSpin);
    p = vec3(p.x * c - p.z * sn, p.y, p.x * sn + p.z * c);
    float ct = cos(uTilt);
    float st = sin(uTilt);
    return vec3(p.x, p.y * ct - p.z * st, p.y * st + p.z * ct);
  }

  void main() {
    float t = clamp(uMorph, 0.0, 1.0);
    /* Stagger: every particle leaves and arrives on its own schedule. A wide
       window — up to nearly half the morph — is what turns the swap into a
       pour: points set off one after another rather than as one block. */
    float delay = aSeed * 0.6;
    float local = clamp((t - delay) / (1.0 - delay), 0.0, 1.0);
    /* Smootherstep, so each point eases out of the old form and into the new
       one with no visible corner at either end. */
    local = local * local * local * (local * (local * 6.0 - 15.0) + 10.0);

    vec3 pos = mix(position, aTarget, local);
    vColor = mix(aColor, aTargetColor, local);

    /* Sample the curl field where the particle currently is. Being a curl it
       is divergence-free, so the cloud eddies and swirls rather than sliding
       along straight lines, and points loop around instead of piling up. */
    vec3 swirl = curlNoise(pos * uNoiseScale + vec3(uTime * uFlowSpeed));

    /* Two strengths of the same field. Mid-flight it carries particles a long
       way out of their lane — the pour from one figure into the next. At rest
       a fraction of it keeps the figure alive, so a held shape still breathes
       rather than sitting frozen. */
    float flow = sin(local * 3.14159);
    float calm = 1.0 - uStill;
    pos += swirl * flow * uFlow * (0.4 + aSeed);
    pos += swirl * uDrift * (0.5 + aSeed) * calm;

    /* A small arc on top, so every particle still travels rather than slides.
       Kept tight now that the curl does most of the work. */
    float arc = flow * (0.015 + aSeed * 0.03);
    pos += normalize(vec3(aSeed - 0.5, aSeed - 0.5, 0.35)) * arc;

    /* Slow drift, so the figure breathes when the scroll is still. */
    pos += vec3(
      sin(uTime * 0.6 + aSeed * 6.28),
      cos(uTime * 0.5 + aSeed * 6.28),
      0.0
    ) * 0.008 * calm;

    vec3 toMouse = pos - uMouse;
    float dist = length(toMouse);
    if (dist < 0.9) {
      pos += normalize(toMouse) * (0.9 - dist) * (0.9 - dist) * 0.4;
    }

    /* Orientation is applied after the morph and the arc, so particles travel
       between shapes and the whole figure turns together. */
    vec3 placed = orient(pos);
    vec4 mvPosition = modelViewMatrix * vec4(placed, 1.0);
    gl_PointSize = aSize * 760.0 / max(-mvPosition.z, 0.5);
    /* Dimmed while forming, and scaled to zero when this figure is not the
       one on screen, so it never bleeds into the next section. */
    vFade = (1.0 - abs(local - 0.5) * 0.12) * uPresence;
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const FRAGMENT_SHADER = `
  varying float vFade;
  varying vec3 vColor;
  void main() {
    float r = length(gl_PointCoord - vec2(0.5));
    if (r > 0.5) discard;
    float alpha = (1.0 - r * 2.0) * 1.0 * vFade;
    gl_FragColor = vec4(vColor, alpha);
  }
`
