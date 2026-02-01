/*! QRCode Generator (minimal) */
function generateQRCode(text, size = 120) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const cells = qr.getModuleCount();
  const scale = size / cells;

  canvas.width = canvas.height = size;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#000';
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(
          Math.floor(c * scale),
          Math.floor(r * scale),
          Math.ceil(scale),
          Math.ceil(scale)
        );
      }
    }
  }
  return canvas.toDataURL();
}
