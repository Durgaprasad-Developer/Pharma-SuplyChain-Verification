import React, { useState } from "react";
import api from "../api/axios";

export default function Transfer() {
  const [batchNo, setBatchNo] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [scratch, setScratch] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await api.post("/medicines/transfer", {
        batch_no: batchNo,
        to_owner: newOwner,
        scratch_card_no: scratch,
      });

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Transfer failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-2xl font-semibold text-white mb-4">Transfer Medicine</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-[#0d1627] p-6 rounded-xl shadow-lg space-y-4"
      >
        <input
          type="text"
          placeholder="Batch Number"
          className="w-full p-3 rounded-lg bg-[#0b1220] text-white border border-slate-600"
          value={batchNo}
          onChange={(e) => setBatchNo(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="New Owner (Distributor/Pharmacy)"
          className="w-full p-3 rounded-lg bg-[#0b1220] text-white border border-slate-600"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Scratch Card Number"
          className="w-full p-3 rounded-lg bg-[#0b1220] text-white border border-slate-600"
          value={scratch}
          onChange={(e) => setScratch(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-white font-semibold"
        >
          {loading ? "Transferring..." : "Transfer"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-400 font-semibold">{error}</p>
      )}

      {result && (
        <div className="mt-6 bg-[#07101c] p-5 rounded-xl text-white">
          <h3 className="text-xl font-semibold mb-2">Transfer Result</h3>
          <p><strong>Batch:</strong> {result.batch_no}</p>
          <p><strong>From:</strong> {result.from}</p>
          <p><strong>To:</strong> {result.to}</p>
          <p><strong>Blockchain:</strong> {JSON.stringify(result.blockchain_result)}</p>
        </div>
      )}
    </div>
  );
}
