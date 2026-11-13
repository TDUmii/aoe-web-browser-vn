export function patchRenderer(path, source) {
  const edits = path === '/assets/loadbar-COOfBw5G.js' ? [
    ['u[e]=+(l[e*4+3]>=128)', 'u[e]=l[e*4+3]'],
    ['function M(e,t,n,r,i,a){', 'function M(e,t,n,r,i,a){if(globalThis.__aoeReadableText)return globalThis.__aoeReadableText.drawGlyph(e,k(t,i),n,r,a);'],
    ['function S(e,t,n){', 'function S(e,t,n){globalThis.__aoeReadableText?.bindPalette(e,t);'],
    ['let t=g.def;u.px.set(g.bg);', 'let t=g.def;globalThis.__aoeReadableText?.bindPalette(u,g.packed);u.px.set(g.bg);'],
    ['r&&c.drawImage(_,x[0]-g.cursor.hotX,x[1]-g.cursor.hotY),te(s,r)',
      'globalThis.__aoeNativeCursor?globalThis.__aoeNativeCursor.update(s,r?_:null,g.cursor?.hotX??0,g.cursor?.hotY??0):(r&&c.drawImage(_,x[0]-g.cursor.hotX,x[1]-g.cursor.hotY),te(s,r))'],
  ] : path === '/assets/game-n1fFuRY1.js' ? [
    ['n&&ie.drawImage(Qn(e,t),O[0]-t.hotX,O[1]-t.hotY),lt(p,n)',
      'globalThis.__aoeNativeCursor?globalThis.__aoeNativeCursor.update(p,n?Qn(e,t):null,t?.hotX??0,t?.hotY??0):(n&&ie.drawImage(Qn(e,t),O[0]-t.hotX,O[1]-t.hotY),lt(p,n))'],
  ] : [];
  for (const [before, after] of edits) {
    if (source.split(before).length !== 2) throw new Error('Unsupported text renderer version');
    source = source.replace(before, after);
  }
  return source;
}
