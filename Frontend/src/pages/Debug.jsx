import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Debug() {
  const [records, setRecords] = useState(null);

  async function load() {
    const res = await API.get("/debug/medicines");
    setRecords(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-3xl mb-4">Debug Medicines</h1>

      <pre className="bg-[#071028] p-4 rounded-xl">
        {JSON.stringify(records, null, 2)}
      </pre>
    </div>
  );
}
