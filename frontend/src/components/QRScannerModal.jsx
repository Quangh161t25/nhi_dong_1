import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode('qr-reader-element');
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isScanningRef.current) {
              onScanSuccess(decodedText);
              handleClose();
            }
          },
          () => {
            // scan failure callback (ignored while looking for qr)
          }
        );
        isScanningRef.current = true;
      } catch (err) {
        console.error('Lỗi khởi động camera:', err);
        alert('Không thể mở camera. Vui lòng cấp quyền truy cập máy ảnh cho trình duyệt.');
        onClose();
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isScanningRef.current) {
        isScanningRef.current = false;
        scannerRef.current
          .stop()
          .catch((e) => console.log('QR Stop Error (ignored):', e));
      }
    };
  }, [isOpen]);

  const handleClose = async () => {
    if (scannerRef.current && isScanningRef.current) {
      isScanningRef.current = false;
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.log('Error stopping QR scanner:', err);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in-up">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-base">
            <Camera className="h-5 w-5 text-teal-600" />
            <span>Quét mã QR Tủ</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 overflow-hidden rounded-xl border-2 border-teal-100 bg-slate-900">
          <div id="qr-reader-element" className="w-full" />
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500 mb-3">
            Hướng camera vào mã QR dán trên tủ để nhận diện tự động
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition active:scale-95"
          >
            Đóng máy ảnh
          </button>
        </div>
      </div>
    </div>
  );
}
