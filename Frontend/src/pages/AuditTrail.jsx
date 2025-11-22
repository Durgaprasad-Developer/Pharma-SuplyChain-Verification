import React, { useState } from "react";
import api from "../api/axios";

export default function AuditTrail() {
  const [batch, setBatch] = useState("");
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  const fetchAudit = async () => {
    setError("");
    setInfo(null);

    try {
      const res = await api.get("/debug/medicines");

      if (!res.data[batch]) {
        setError("❌ No medicine found with that Batch Number.");
        return;
      }

      setInfo(res.data[batch]);

    } catch (err) {
      setError("Server error: " + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold mb-6">📜 Audit Trail</h2>

      <input
        type="text"
        className="w-full p-3 rounded bg-[#0f172a] border border-slate-700 mb-4"
        placeholder="Enter Batch Number"
        value={batch}
        onChange={(e) => setBatch(e.target.value)}
      />

      <button
        onClick={fetchAudit}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
      >
        Get Audit Trail
      </button>

      {/* ERROR */}
      {error && <p className="text-red-400 mt-4">{error}</p>}

      {/* AUDIT RESULT */}
      {info && (
        <div className="mt-6 bg-[#0a0f18] p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-blue-400 mb-3">
            {info.batch_no || batch}
          </h3>

          <AuditField label="Medicine Name" value={info.name} />
          <AuditField label="Manufacturer" value={info.manufacturer} />
          <AuditField label="Current Owner" value={info.current_owner} />
          <AuditField label="Scratch Card" value={info.scratch_card_no} />

          <AuditField
            label="Manufacture Date"
            value={new Date(info.manufacture_date * 1000).toLocaleString()}
          />
          <AuditField
            label="Expiry Date"
            value={new Date(info.expiry_date * 1000).toLocaleString()}
          />

          <AuditField label="Created TX" value={info.create_tx} />
          <AuditField label="Shipped TX" value={info.ship_tx || "Not shipped"} />
          <AuditField
            label="Received TX"
            value={info.receive_tx || "Not received"}
          />

          <div className="mt-4">
            <img
              src={`http://127.0.0.1:5000/static/qr_codes/${info.qr_code_path}`}
              alt="QR"
              className="w-32 h-32 border border-slate-700 rounded"
            />
          </div>

          <pre className="bg-black/40 p-4 rounded mt-4 overflow-x-auto text-green-400">
            {JSON.stringify(info, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function AuditField({ label, value }) {
  return (
    <p className="mb-2">
      <span className="text-slate-400">{label}: </span>
      <span className="text-slate-200 break-all">{value}</span>
    </p>
  );
}
