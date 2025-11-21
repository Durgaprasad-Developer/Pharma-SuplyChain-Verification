import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name || !role) return alert("Enter all fields");
    login(name, role);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="pharma-card w-[350px]">
        <h2 className="text-2xl mb-4 font-bold">Login</h2>

        <input
          className="w-full p-3 rounded bg-[#1e293b] mb-3"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="w-full p-3 rounded bg-[#1e293b] mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="manufacturer">Manufacturer</option>
          <option value="distributor">Distributor</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="customer">Customer</option>
        </select>

        <button onClick={submit} className="pharma-btn w-full">
          Continue
        </button>
      </div>
    </div>
  );
}
