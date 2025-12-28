import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import Settings from "./components/Settings/Settings.jsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
  )
);
