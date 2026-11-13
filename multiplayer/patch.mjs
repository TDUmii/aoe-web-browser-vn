// Keep the normal game lobby, showing the room flow supported by our server.
const connections = 'i=[{id:`rooms`,text:`Internet - Viva La RTS rooms`},{id:`quick`,text:`Quick Match - one against one`}]';

export function patchMultiplayer(path, source) {
  if (path !== '/assets/model-BbESgICJ.js') return source;
  if (source.split(connections).length !== 2) {
    throw new Error('Unsupported multiplayer menu version');
  }
  return source.replace(connections, 'i=[{id:`rooms`,text:`Internet - Tạo hoặc tham gia phòng`}]');
}
