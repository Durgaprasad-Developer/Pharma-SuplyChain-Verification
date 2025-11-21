import React, { useState } from "react";
import api from "../api/axios";

export default function AuditTrail() {
  const [batchNo, setBatchNo] = useState("");
  const [data, setData] = useState(null);

  const fetchAudit = async () => {
    try {
      const res = await api.get(`/medicines/audit/${batchNo}`);
      setData(res.data);
    } catch (err) {
      alert("Batch not found!");
    }
  };

  const stateLabels = ["Created", "Shipped", "At Pharmacy", "Sold"];

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Audit Trail</h1>

      <input
        className="border bg-transparent p-3 rounded w-full mb-4"
        placeholder="Enter Batch Number"
        onChange={(e) => setBatchNo(e.target.value)}
      />

      <button
        onClick={fetchAudit}
        className="bg-blue-600 px-6 py-2 rounded-md"
      >
        Get Audit Trail
      </button>

      {data && (
        <div className="mt-6 bg-[#0c1220] p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Batch: {data.batch_no}
          </h2>

          <p><strong>Current Blockchain State:</strong> {stateLabels[data.onchain_state]}</p>

          <div className="mt-4 space-y-2">
            <p><strong>Created TX:</strong> {data.audit.created || "—"}</p>
            <p><strong>Shipped TX:</strong> {data.audit.shipped || "—"}</p>
            <p><strong>Received TX:</strong> {data.audit.received || "—"}</p>
            <p><strong>Sold TX:</strong> {data.audit.sold || "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
