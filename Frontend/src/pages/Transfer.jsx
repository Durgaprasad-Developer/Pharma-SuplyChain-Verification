// src/pages/Transfer.jsx
import React, { useState } from "react";
import api from "../api/axios";

export default function Transfer({ userRole }) {
  const [batch, setBatch] = useState("");
  const [scratch, setScratch] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Recommended flow mapping for UI options:
  // - Manufacturer -> send to Distributor
  // - Distributor -> send to Pharmacy
  // - Pharmacy -> mark as sold (to customer)

  const handleTransfer = async () => {
    setLoading(true);
    setResult(null);
    try {
      // For simplicity, backend handles ship+receive based on addresses and contract functions
      const res = await api.post("/medicines/transfer", {
        batch_no: batch,
        to_owner: toAddress,
        scratch_card_no: scratch,
      });
      setResult(res.data);
    } catch (err) {
      setResult({ success: false, error: err.response?.data || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold mb-6">Transfer / Ship Medicine</h2>

      <div className="space-y-4">
        <input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="Batch Number" className="w-full p-3 rounded-lg bg-[#071022] border border-slate-700" />
        <input value={scratch} onChange={(e) => setScratch(e.target.value)} placeholder="Scratch Card Number" className="w-full p-3 rounded-lg bg-[#071022] border border-slate-700" />

        <input value={toAddress} onChange={(e) => setToAddress(e.target.value)}   placeholder={'To address (ETH address or "markSold")'} className="w-full p-3 rounded-lg bg-[#071022] border border-slate-700" />
        <div className="flex gap-3">
          <button onClick={handleTransfer} disabled={loading} className="px-4 py-2 bg-blue-600 rounded">
            {loading ? "Processing..." : "Transfer / Ship"}
          </button>
        </div>

        <div>
          <pre className="bg-[#060913] text-green-300 p-4 rounded-lg overflow-x-auto text-sm">
            {result ? JSON.stringify(result, null, 2) : "No transfer yet"}
          </pre>
        </div>
      </div>
    </div>
  );
}
