import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Settings from "./pages/Settings/Settings.jsx";
import Activities from "./pages/Activities/Activities.jsx";
import PtSchemeObjects from "./pages/PtSchemeObjects/PtSchemeObjects.jsx";
import Characteristics from "./pages/Characteristics/Characteristics.jsx";
import Standards from "./pages/Standards/Standards.jsx";
import Quantities from "./pages/Quantities/Quantities.jsx";
import Subcontractors from "./pages/Subcontractors/Subcontractors.jsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="activities" element={<Activities />} />
      <Route path="ptschemeobjects" element={<PtSchemeObjects />} />
      <Route path="characteristics" element={<Characteristics />} />
      <Route path="standards" element={<Standards />} />
      <Route path="values" element={<Quantities />} />
      <Route path="subcontractors" element={<Subcontractors />} />
    </Route>
  )
);
