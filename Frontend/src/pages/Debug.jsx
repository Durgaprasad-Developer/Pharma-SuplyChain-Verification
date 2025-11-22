import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function DebugMedicines() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/debug/medicines");
      setData(res.data);
    } catch (err) {
      setData({ error: err.message });
    }
    setLoading(false);
  };

  if (loading) {
    return <p className="text-center text-slate-300 mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold mb-8">🛠 Debug Medicines</h2>

      {Object.keys(data).length === 0 ? (
        <p className="text-gray-300">No records found.</p>
      ) : (
        <div className="space-y-6">
          {Object.keys(data).map((batchId) => {
            const item = data[batchId];

            // FIX — Define filename properly
            const fileName = item.qr_code_path || "";

            return (
              <div
                key={batchId}
                className="bg-[#0f172a] p-6 rounded-xl border border-gray-700"
              >
                <h3 className="text-xl font-semibold text-blue-400 mb-3">
                  {batchId}
                </h3>

                {/* DETAILS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DebugField label="Name" value={item.name} />
                  <DebugField label="Manufacturer" value={item.manufacturer} />
                  <DebugField label="Current Owner" value={item.current_owner} />
                  <DebugField label="Scratch Card" value={item.scratch_card_no} />

                  <DebugField
                    label="Manufacture Date"
                    value={new Date(item.manufacture_date * 1000).toLocaleString()}
                  />
                  <DebugField
                    label="Expiry Date"
                    value={new Date(item.expiry_date * 1000).toLocaleString()}
                  />

                  <DebugField label="Created TX" value={item.create_tx} />
                  <DebugField label="Ship TX" value={item.ship_tx || "Not shipped yet"} />
                  <DebugField label="Receive TX" value={item.receive_tx || "Not received yet"} />
                </div>

                {/* QR Code */}
                {fileName && (
                  <div className="mt-5">
                    <img
                      src={`https://pharma-suplychain-verification.onrender.com/static/qr_codes/${fileName}`}
                      alt="QR"
                      className="w-32 h-32 border border-slate-700 rounded bg-black"
                    />
                  </div>
                )}

                {/* JSON COPY */}
                <div className="relative mt-4">
                  <button
                    className="absolute right-2 top-2 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-xs"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        JSON.stringify(item, null, 2)
                      )
                    }
                  >
                    Copy
                  </button>

                  <pre className="bg-[#0a0f18] p-4 rounded-lg text-green-300 text-sm overflow-x-auto border border-slate-800">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DebugField({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className="text-slate-200 break-all">{value}</span>
    </div>
  );
}
