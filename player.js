// The emulator's Running status precedes Wine and the first game image.
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const overlay = $("overlay");
  const canvas = $("canvas");
  // Preserve the last rendered image so paused Win32 dialogs remain observable.
  // The SDL loop can stop while a dialog waits for input.
  const getContext = canvas.getContext.bind(canvas);
  canvas.getContext = (type, attributes) => getContext(type,
    /webgl/i.test(type) ? { ...attributes, preserveDrawingBuffer: true } : attributes);
  const debug = new URLSearchParams(location.search).has("debug");
  let ready = false;
  let failed = false;
  let running = false;
  let lastProbe = 0;
  let watchdog;
  let framePoll;
  if (debug) document.body.classList.add("debug");

  function fail(message) {
    if (failed) return;
    failed = true;
    clearTimeout(watchdog);
    clearInterval(framePoll);
    overlay.classList.remove("is-hidden");
    $("welcomeMessage").textContent = message;
    $("bootStatus").textContent = "Thử tải lại. Nếu vẫn lỗi, hãy mở trang bằng Chrome hoặc Edge trên máy tính.";
    $("bootProgress").hidden = true;
    $("retryGame").hidden = false;
    $("info").hidden = false;
    document.body.classList.remove("started");
  }

  function onStatus(text) {
    if (failed || ready) return;
    if (/Không thể|exception thrown|\b(?:failed|error|abort)\b/i.test(text)) {
      fail("Không khởi chạy được Đế Chế.");
    } else if (/Running/i.test(text)) {
      if (!running && !watchdog) begin();
      running = true;
      $("welcomeMessage").textContent = "Đang chờ hình ảnh từ game...";
      $("bootStatus").textContent = "Lần đầu có thể mất khoảng một phút. Game sẽ hiện khi có hình ảnh.";
    }
  }

  // Called inside Emscripten's frame loop, before WebGL clears its back buffer.
  // A visible image confirms rendering, not menu readiness or game performance.
  function onFrame() {
    if (failed || ready || !running || performance.now() - lastProbe < 500) return;
    lastProbe = performance.now();
    const gl = window.Module && window.Module.ctx;
    if (!gl || typeof gl.readPixels !== "function" || gl.isContextLost()) return;
    const pixel = new Uint8Array(4);
    let visible = 0;
    for (const x of [0.2, 0.5, 0.8]) {
      for (const y of [0.2, 0.5, 0.8]) {
        gl.readPixels(Math.floor(gl.drawingBufferWidth * x), Math.floor(gl.drawingBufferHeight * y),
          1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        if (Math.max(pixel[0], pixel[1], pixel[2]) > 24) visible++;
      }
    }
    if (visible < 3) return;
    ready = true;
    clearTimeout(watchdog);
    clearInterval(framePoll);
    overlay.classList.add("is-hidden");
    document.body.classList.add("started");
    $("exportSaves").disabled = false;
    $("importSaves").disabled = false;
    canvas.focus({ preventScroll: true });
    canvas.dispatchEvent(new CustomEvent("aoe-first-frame"));
  }

  function begin() {
    clearTimeout(watchdog);
    clearInterval(framePoll);
    framePoll = setInterval(onFrame, 500);
    watchdog = setTimeout(() => {
      if (!ready) fail("Game chưa hiển thị được hình ảnh. Bạn có thể thử khởi động lại.");
    }, 120000);
  }
  function idle() { clearTimeout(watchdog); clearInterval(framePoll); watchdog = null; }
  window.AoEPlayer = { onStatus, onFrame, fail, begin, idle };
  canvas.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    fail("Trình duyệt bị mất kết nối với bộ xử lý đồ họa.");
  });
  window.addEventListener("unhandledrejection", () => {
    if (!ready) fail("Có lỗi khi tải hoặc khởi chạy game.");
  });
  window.addEventListener("error", event => {
    if (!ready && event.target === window) fail("Có lỗi khi khởi chạy bộ giả lập.");
  });

  function reload() {
    if (!ready || window.confirm("Tải lại sẽ đóng ván đang chơi. Hãy xuất bản lưu trước nếu muốn chơi tiếp. Tải lại ngay?")) location.reload();
  }
  $("retryGame").addEventListener("click", reload);
  $("recovery").addEventListener("click", reload);
  const help = $("gameHelp");
  $("helpGame").addEventListener("click", () => {
    help.showModal();
    help.scrollTop = 0;
  });
  help.addEventListener("close", () => { if (ready) canvas.focus({ preventScroll: true }); });
  $("fullscreenGame").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      canvas.focus({ preventScroll: true });
    } catch {
      $("saveMessage").textContent = "Trình duyệt không cho mở toàn màn hình. Bạn có thể dùng phím F11.";
    }
  });
  document.addEventListener("fullscreenchange", () => {
    $("fullscreenGame").textContent = document.fullscreenElement ? "Thu nhỏ" : "Toàn màn hình";
  });
})();
