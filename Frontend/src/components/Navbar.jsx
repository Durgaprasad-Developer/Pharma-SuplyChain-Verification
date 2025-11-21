import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-[#0f1729] p-4 flex justify-between text-white">
      <h1 className="text-xl font-bold">PharmaChain</h1>

      <div className="flex gap-4 items-center">
        {user.role === "manufacturer" && <Link to="/add">Add Medicine</Link>}
        <Link to="/verify">Verify</Link>
        <Link to="/transfer">Transfer</Link>
        <Link to="/debug">Debug</Link>
        <Link to="/audit">Audit Trail</Link>
        <button onClick={logout} className="pharma-btn">Logout</button>
      </div>
    </nav>
  );
}
