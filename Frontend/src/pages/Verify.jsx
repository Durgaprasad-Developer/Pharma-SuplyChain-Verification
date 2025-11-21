import React, { useState } from "react";
import api from "../api/axios";
import { FaSearch, FaBarcode } from "react-icons/fa";

export default function Verify() {
  const [batchId, setBatchId] = useState("");
  const [scratch, setScratch] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const STATE_MAP = {
  0: "Created",
  1: "Shipped",
  2: "Received",
  3: "Sold"
};


  const verify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/medicines/verify", {
        batch_no: batchId,
        scratch_card_no: scratch
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Verification failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] p-6 text-white">
      <div className="max-w-2xl mx-auto mt-10 bg-[#0b1220] p-8 rounded-2xl border border-slate-700 shadow-xl">

        <h1 className="text-3xl font-semibold mb-6 flex items-center gap-2">
          <FaSearch className="text-blue-400" />
          Verify Medicine
        </h1>

        <form onSubmit={verify} className="space-y-5">

          <div>
            <label className="text-slate-300">Batch Number</label>
            <div className="flex items-center bg-[#0f1724] p-3 rounded-lg mt-1 border border-slate-700">
              <FaBarcode className="text-blue-400 mr-3" />
              <input
                type="text"
                className="bg-transparent w-full outline-none"
                placeholder="Enter batch number"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300">Scratch Card Number</label>
            <input
              type="text"
              className="w-full bg-[#0f1724] p-3 rounded-lg mt-1 border border-slate-700 outline-none"
              placeholder="Enter scratch number"
              value={scratch}
              onChange={(e) => setScratch(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-lg font-semibold"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Medicine"}
          </button>
        </form>

        {/* Verification Results */}
        {result && (
          <div className="mt-8 bg-[#071028] p-5 rounded-xl border border-slate-700">
            <h2 className="text-xl font-semibold text-green-400">
              Verification Completed
            </h2>

            <p className="mt-3 text-slate-300">
              <strong>Scratch Match:</strong>{" "}
              {result.scratch_card_match ? (
                <span className="text-green-400">Valid</span>
              ) : (
                <span className="text-red-400">Invalid</span>
              )}
            </p>

            <p className="mt-2 text-slate-300">
              <strong>Digital Signature:</strong>{" "}
              {result.digital_signature_valid ? (
                <span className="text-green-400">Authentic</span>
              ) : (
                <span className="text-red-400">Tampered</span>
              )}
            </p>

            {result.onchain && (
              <p className="mt-2 text-slate-300">
                <p>
  <strong>Current State:</strong>{" "}
  {STATE_MAP[result.onchain?.state] || "Unknown"}
</p>

              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
