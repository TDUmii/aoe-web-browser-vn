export function patchRenderer(path, source) {
  if (path !== '/assets/loadbar-COOfBw5G.js') return source;
  const edits = [
    ['u[e]=+(l[e*4+3]>=128)', 'u[e]=l[e*4+3]'],
    ['function M(e,t,n,r,i,a){', 'function M(e,t,n,r,i,a){if(globalThis.__aoeReadableText)return globalThis.__aoeReadableText.drawGlyph(e,k(t,i),n,r,a);'],
    ['function S(e,t,n){', 'function S(e,t,n){globalThis.__aoeReadableText?.bindPalette(e,t);'],
    ['let t=g.def;u.px.set(g.bg);', 'let t=g.def;globalThis.__aoeReadableText?.bindPalette(u,g.packed);u.px.set(g.bg);'],
  ];
  for (const [before, after] of edits) {
    if (source.split(before).length !== 2) throw new Error('Unsupported text renderer version');
    source = source.replace(before, after);
  }
  return source;
}
