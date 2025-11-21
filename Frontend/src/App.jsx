import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AddMedicine from "./pages/AddMedicine";
import Verify from "./pages/Verify";
import Transfer from "./pages/Transfer";
import Debug from "./pages/Debug";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AuditTrail from "./pages/AuditTrail";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/add"
          element={
            <ProtectedRoute roles={["manufacturer"]}>
              <AddMedicine />
            </ProtectedRoute>
          }
        />

        <Route path="/verify" element={<Verify />} />

        <Route
          path="/transfer"
          element={
            <ProtectedRoute roles={["distributor", "pharmacy"]}>
              <Transfer />
            </ProtectedRoute>
          }
        />

        <Route path="/debug" element={<Debug />} />

        <Route path="/audit" element={<AuditTrail />} />

      </Routes>
    </>
  );
}
