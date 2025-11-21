import React, { useState } from "react";
import api from "../api/axios";

import { 
  FiHash, 
  FiPackage, 
  FiUser, 
  FiCalendar, 
  FiKey, 
  FiTruck 
} from "react-icons/fi";


export default function AddMedicine() {
  const [form, setForm] = useState({
    batch_no: "",
    name: "",
    manufacturer: "",
    manufacture_date: "",
    expiry_date: "",
    scratch_card_no: "",
    distributor: ""
  });

  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const convertToTimestamp = (dateStr) => {
    return Math.floor(new Date(dateStr).getTime() / 1000);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        batch_no: form.batch_no,
        name: form.name,
        manufacturer: form.manufacturer,
        manufacture_date: convertToTimestamp(form.manufacture_date),
        expiry_date: convertToTimestamp(form.expiry_date),
        scratch_card_no: form.scratch_card_no,
        distributor: form.distributor || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      };

      const res = await api.post("/medicines", payload);
      setResponse(res.data);

    } catch (err) {
      setResponse({ error: err.response?.data || err.message });
    }
  };

  // Input Block Component
  const InputBlock = ({ icon, children }) => (
    <div className="bg-[#0f172a] rounded-xl p-4 flex items-center gap-3 border border-gray-700">
      {icon}
      <div className="w-full">{children}</div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">

      {/* HEADING */}
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FiPackage className="text-blue-400" size={28} />
        Add Medicine
      </h2>

      {/* FORM */}
      <div className="space-y-5">

        <InputBlock icon={<FiHash size={20} className="text-blue-400" />}>
          <input
            type="text"
            name="batch_no"
            placeholder="Batch Number"
            value={form.batch_no}
            onChange={handleChange}
            className="bg-transparent outline-none w-full"
          />
        </InputBlock>

        <InputBlock icon={<FiPackage size={20} className="text-blue-400" />}>
          <input
            type="text"
            name="name"
            placeholder="Medicine Name"
            value={form.name}
            onChange={handleChange}
            className="bg-transparent outline-none w-full"
          />
        </InputBlock>

        <InputBlock icon={<FiUser size={20} className="text-blue-400" />}>
          <input
            type="text"
            name="manufacturer"
            placeholder="Manufacturer"
            value={form.manufacturer}
            onChange={handleChange}
            className="bg-transparent outline-none w-full"
          />
        </InputBlock>

        <InputBlock icon={<FiCalendar size={20} className="text-blue-400" />}>
          <input
            type="date"
            name="manufacture_date"
            value={form.manufacture_date}
            onChange={handleChange}
            className="bg-transparent outline-none w-full"
          />
        </InputBlock>

        <InputBlock icon={<FiCalendar size={20} className="text-blue-400" />}>
          <input
            type="date"
            name="expiry_date"
            value={form.expiry_date}
            onChange={handleChange}
            className="bg-transparent outline-none w-full"
          />
        </InputBlock>

        <InputBlock icon={<FiKey size={20} className="text-blue-400" />}>
          <input
            type="text"
            name="scratch_card_no"
            placeholder="Scratch Card Number"
            value={form.scratch_card_no}
            onChange={handleChange}
            className="bg-transparent outline-none w-full"
          />
        </InputBlock>

        <InputBlock icon={<FiTruck size={20} className="text-blue-400" />}>
          <input
            type="text"
            name="distributor"
            placeholder="Distributor Address (optional)"
            value={form.distributor}
            onChange={handleChange}
            className="bg-transparent outline-none w-full"
          />
        </InputBlock>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold"
        >
          Submit
        </button>
      </div>

      {/* RESPONSE BLOCK */}
      {/* SUCCESS DISPLAY */}
{response && (
  <div className="mt-6 bg-[#0d1117] p-6 rounded-xl border border-slate-700">
    <h3 className="text-green-400 text-xl font-semibold mb-3">
      Batch Created Successfully
    </h3>

    {/* BLOCKCHAIN TX */}
    <p className="text-slate-300 text-sm mb-2">
      <span className="font-semibold text-blue-400">Blockchain TX:</span>
      <a
        href="#"
        className="ml-2 text-blue-500 underline break-all"
      >
        {response.blockchain_tx}
      </a>
    </p>

    {/* QR CODE */}
    <div className="mt-4">
      <img
        src={`http://127.0.0.1:5000/${response.qr_code_path}`}
        alt="QR Code"
        className="w-40 h-40 rounded-lg border border-slate-600"
      />
    </div>

    {/* FORMATTED JSON */}
    <div className="relative mt-6">
      <button
        onClick={() => navigator.clipboard.writeText(JSON.stringify(response, null, 2))}
        className="absolute right-3 top-3 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Copy
      </button>

      <pre className="bg-[#0a0f18] text-green-300 p-4 rounded-lg overflow-x-auto text-sm border border-slate-800">
{JSON.stringify(response, null, 2)}
      </pre>
    </div>
  </div>
)}


    </div>
  );
}
