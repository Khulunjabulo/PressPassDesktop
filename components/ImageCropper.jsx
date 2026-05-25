// components/ImageCropper.jsx
// Lightweight drag-to-crop — no external libraries needed.
// ✅ FIXED: crossOrigin = 'anonymous' so Cloudinary images can be exported from canvas
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Check, RotateCcw, ZoomIn, ZoomOut, Crop } from 'lucide-react';

export default function ImageCropper({ imageSrc, onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [imgDisplay, setImgDisplay] = useState({ w: 0, h: 0, x: 0, y: 0 });
  const [crop, setCrop] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [imgError, setImgError] = useState(false);

  const MIN_CROP = 20;

  // ── Load image ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!imageSrc) return;
    setImgError(false);

    const img = new Image();

    // ✅ FIXED: required for cross-origin images (Cloudinary) so canvas.toDataURL works
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      imgRef.current = img;
      recalcDisplay(img, zoom);
    };

    img.onerror = () => {
      // If crossOrigin load fails (e.g. server doesn't send CORS headers),
      // fall back to loading without crossOrigin — canvas will be tainted
      // but at least the image renders. Crop will be blocked with a message.
      console.warn('⚠️ CrossOrigin image load failed, trying without CORS...');
      const fallback = new Image();
      fallback.onload = () => {
        imgRef.current = fallback;
        setImgError(true); // mark as tainted so we warn the user
        recalcDisplay(fallback, zoom);
      };
      fallback.onerror = () => console.error('❌ Image failed to load entirely');
      fallback.src = imageSrc;
    };

    // Cache-bust to force CORS headers from Cloudinary
    const sep = imageSrc.includes('?') ? '&' : '?';
    img.src = `${imageSrc}${sep}_cb=${Date.now()}`;
  }, [imageSrc]);

  useEffect(() => {
    if (imgRef.current) recalcDisplay(imgRef.current, zoom);
  }, [zoom]);

  const recalcDisplay = (img, z) => {
    const container = containerRef.current;
    if (!container) return;
    const maxW = container.clientWidth;
    const maxH = container.clientHeight;

    let dw = img.naturalWidth * z;
    let dh = img.naturalHeight * z;

    const scale = Math.min(1, maxW / dw, maxH / dh);
    dw *= scale;
    dh *= scale;

    const dx = (maxW - dw) / 2;
    const dy = (maxH - dh) / 2;

    setImgDisplay({ w: dw, h: dh, x: dx, y: dy });
  };

  // ── Draw ───────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgDisplay.w) return;

    const ctx = canvas.getContext('2d');
    const { w: dw, h: dh, x: dx, y: dy } = imgDisplay;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#12121f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, dx, dy, dw, dh);

    if (crop && crop.w > 2 && crop.h > 2) {
      const { x, y, w, h } = crop;

      // Dim overlay
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(dx, dy, dw, dh);

      // Restore crop area
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      // Border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Corner handles
      const hs = 8;
      ctx.fillStyle = '#ffffff';
      [
        [x, y], [x + w - hs, y],
        [x, y + h - hs], [x + w - hs, y + h - hs],
      ].forEach(([cx, cy]) => {
        ctx.fillRect(cx, cy, hs, hs);
        ctx.strokeRect(cx, cy, hs, hs);
      });

      // Rule-of-thirds grid
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(x + (w / 3) * i, y); ctx.lineTo(x + (w / 3) * i, y + h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + (h / 3) * i); ctx.lineTo(x + w, y + (h / 3) * i); ctx.stroke();
      }

      // Size label
      const natScaleX = img.naturalWidth / dw;
      const natScaleY = img.naturalHeight / dh;
      const label = `${Math.round(w * natScaleX)} × ${Math.round(h * natScaleY)} px`;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(x, y - 22, label.length * 7 + 10, 20);
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText(label, x + 5, y - 7);
    }
  }, [crop, imgDisplay]);

  useEffect(() => { draw(); }, [draw]);

  // ── Resize observer ────────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new ResizeObserver(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      if (imgRef.current) recalcDisplay(imgRef.current, zoom);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [zoom]);

  // ── Pointer helpers ────────────────────────────────────────────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (cx - rect.left) * (canvas.width / rect.width),
      y: (cy - rect.top) * (canvas.height / rect.height),
    };
  };

  const clamp = (pos) => ({
    x: Math.max(imgDisplay.x, Math.min(imgDisplay.x + imgDisplay.w, pos.x)),
    y: Math.max(imgDisplay.y, Math.min(imgDisplay.y + imgDisplay.h, pos.y)),
  });

  const onDown = (e) => {
    e.preventDefault();
    const pos = clamp(getPos(e));
    setDragStart(pos);
    setCrop(null);
    setDragging(true);
  };

  const onMove = (e) => {
    if (!dragging || !dragStart) return;
    e.preventDefault();
    const pos = clamp(getPos(e));
    setCrop({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      w: Math.abs(pos.x - dragStart.x),
      h: Math.abs(pos.y - dragStart.y),
    });
  };

  const onUp = () => {
    setDragging(false);
    if (crop && (crop.w < MIN_CROP || crop.h < MIN_CROP)) setCrop(null);
  };

  // ── Apply crop ─────────────────────────────────────────────────────────────
  const applyCrop = () => {
    if (!crop || !imgRef.current) return;

    // ✅ If the image is tainted (CORS failed), warn the user instead of crashing
    if (imgError) {
      alert('This image cannot be cropped because it was loaded without CORS headers. The image will be used as-is.');
      onCancel();
      return;
    }

    try {
      const img = imgRef.current;
      const scaleX = img.naturalWidth / imgDisplay.w;
      const scaleY = img.naturalHeight / imgDisplay.h;

      const natX = (crop.x - imgDisplay.x) * scaleX;
      const natY = (crop.y - imgDisplay.y) * scaleY;
      const natW = crop.w * scaleX;
      const natH = crop.h * scaleY;

      const off = document.createElement('canvas');
      off.width = Math.round(natW);
      off.height = Math.round(natH);
      off.getContext('2d').drawImage(img, natX, natY, natW, natH, 0, 0, natW, natH);
      onCrop(off.toDataURL('image/jpeg', 0.92));
    } catch (err) {
      console.error('Crop export error:', err);
      alert('Could not export cropped image. The image will be used as-is.');
      onCancel();
    }
  };

  const hasCrop = crop && crop.w >= MIN_CROP && crop.h >= MIN_CROP;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90">
      <div className="bg-[#12121f] rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl mx-4"
           style={{ height: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Crop className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-semibold">Crop Image</h2>
            <span className="text-xs text-gray-400 hidden sm:block">
              Drag to select the area you want to keep
            </span>
          </div>
          <button onClick={onCancel}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORS warning banner */}
        {imgError && (
          <div className="mx-6 mt-4 px-4 py-2 bg-yellow-900/50 border border-yellow-600/50 rounded-lg text-yellow-300 text-xs">
            ⚠️ This image was loaded without CORS headers. You can preview and zoom, but cropping will use the full image.
          </div>
        )}

        {/* Canvas */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden"
             style={{ cursor: 'crosshair' }}>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none select-none"
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
          />
          {!crop && (
            <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
              <div className="bg-black/60 rounded-xl px-5 py-2.5 text-white text-sm flex items-center gap-2">
                <Crop className="w-4 h-4 text-blue-400" />
                Click and drag to select crop area
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 gap-3 flex-wrap">
          {/* Zoom */}
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Zoom out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-white text-sm w-12 text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom(z => Math.min(4, +(z + 0.25).toFixed(2)))}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Zoom in">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setCrop(null)}
                    disabled={!crop}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm disabled:opacity-40 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={onCancel}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
              Cancel
            </button>
            <button onClick={applyCrop}
                    disabled={!hasCrop || imgError}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Check className="w-4 h-4" /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}