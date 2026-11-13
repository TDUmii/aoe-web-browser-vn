# Multiplayer server

`attachMultiplayer(httpServer)` in `websocket.mjs` serves the native AOE1
protocol at `/ws/8b338ddc1fd0b8ff`. It uses `ws`; `rooms.mjs` itself uses only
Node built-ins and accepts an injected message sender for tests.

Supported flow: protocol-11 hello, public room listing, create/join by five
character code, native AOE1 settings, human/AI slots, room chat, host start,
shared deterministic seed/map seed, ready barrier, ordered command batches,
50 ms ticks, pause/resume and hash disagreement detection. Commands contain
the native hexadecimal engine payload; this server orders those payloads.

The current implementation stores rooms in one process. Both players must
reach the same running process. Multiple replicas need a shared room
coordinator and ordered command storage before deployment can promise stable
matches across instances. A disconnected participant ends the match;
reconnection/replay is not implemented. This is intended for trusted private
play: binary command permissions and cheat resistance are not verified.

Run `node --test tests/multiplayer.test.mjs` to exercise the protocol core.
These tests do not execute the actual game simulation or establish that two
rendered browser worlds remain synchronized. Test the native clients too.
