@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -Command "try { $reply = Invoke-WebRequest -Uri 'http://127.0.0.1:8097/game-config.json' -TimeoutSec 2; if ($reply.StatusCode -eq 200) { exit 0 }; exit 1 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 (
  start "" "http://127.0.0.1:8097/"
  exit /b
)
echo.
echo  De Che Web VN - Rise of Rome day du
echo  Mo trinh duyet tai http://127.0.0.1:8097/
echo  Trong game: Choi don - Ban do ngau nhien.
echo  Luu van trong game roi Xuat ban luu truoc khi dong trang.
echo  Nhan Ctrl+C de dung may chu.
echo.
start "" "http://127.0.0.1:8097/"
node server.mjs
pause
