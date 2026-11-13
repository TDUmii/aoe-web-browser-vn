export function assetPath(path) {
  if (typeof path !== 'string' || path.length > 512) return null;
  try { path = decodeURIComponent(path); } catch { return null; }
  if (/[\\%\x00-\x1f\x7f?#]/.test(path) || path.includes('..') || /\.(exe|dll|msi|bat|cmd|ps1|zip|rar|7z|iso)\s*$/i.test(path)) return null;
  const allowed = /^\/assets\/[A-Za-z0-9_-]+\.js$/.test(path)
    || /^\/dev-assets\/aoe1\/web\/[A-Za-z0-9_./ ()',+&!-]+$/.test(path)
    || /^\/dev-assets\/graphics\/ui\/menu_button_[12]\.png$/.test(path)
    || /^\/art\/logo\/(favicon-32|favicon-16|apple-touch-icon)\.png$/.test(path);
  return allowed ? path : null;
}
