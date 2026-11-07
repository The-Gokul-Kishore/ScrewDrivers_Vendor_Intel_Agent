import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Overview } from "./pages/Overview";
import { Invoices } from "./pages/Invoices";
import { InvoiceDetail } from "./pages/InvoiceDetail";
import { Exceptions } from "./pages/Exceptions";
import { ExceptionDetail } from "./pages/ExceptionDetail";
import { Vendors } from "./pages/Vendors";
import { VendorDetail } from "./pages/VendorDetail";
import { Approvals } from "./pages/Approvals";
import { Learning } from "./pages/Learning";
import { Audit } from "./pages/Audit";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="exceptions" element={<Exceptions />} />
          <Route path="exceptions/:id" element={<ExceptionDetail />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/:id" element={<VendorDetail />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="learning" element={<Learning />} />
          <Route path="audit" element={<Audit />} />
          <Route
            path="*"
            element={
              <div className="page">
                <div className="card">
                  <div className="empty">Page not found.</div>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
