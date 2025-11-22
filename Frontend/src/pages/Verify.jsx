import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Verify() {
  const [batch, setBatch] = useState("");
  const [scratch, setScratch] = useState("");
  const [result, setResult] = useState(null);

  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner(
        "qr-scanner",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        (decodedText) => {
          try {
            const parsed = JSON.parse(decodedText);
            setBatch(parsed.batch_no || parsed.batchId || "");
            setScratch(parsed.scratch_card_no || "");
          } catch {
            setBatch(decodedText);
          }

          scanner.clear();
          setScanning(false);
        },
        (err) => {
          console.log("Scan error:", err);
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [scanning]);

  const handleVerify = async () => {
    setResult(null);
    try {
      const res = await api.post("/medicines/verify", {
        batch_no: batch,
        scratch_card_no: scratch
      });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.response?.data || err.message });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold mb-6">Verify Medicine</h2>

      <div className="space-y-4">

        {/* Batch Number */}
        <div>
          <label className="text-sm text-slate-300">Batch Number</label>
          <input
            className="w-full p-3 bg-[#0f172a] rounded border border-slate-600"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            placeholder="Enter or Scan QR"
          />
        </div>

        {/* Scratch */}
        <div>
          <label className="text-sm text-slate-300">Scratch Card</label>
          <input
            className="w-full p-3 bg-[#0f172a] rounded border border-slate-600"
            value={scratch}
            onChange={(e) => setScratch(e.target.value)}
            placeholder="Scratch Code"
          />
        </div>

        {/* Scanner Button */}
        <button
          onClick={() => setScanning(true)}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          Scan QR Code
        </button>

        {/* Scanner UI */}
        {scanning && <div id="qr-scanner" className="mt-4" />}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="px-4 py-2 bg-green-600 rounded"
        >
          Verify
        </button>

        {/* Result */}
        {result && (
          <pre className="bg-[#06101f] text-green-300 p-4 mt-4 rounded border border-slate-700 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}

      </div>
    </div>
  );
}
