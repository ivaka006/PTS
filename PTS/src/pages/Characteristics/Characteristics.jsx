import { useEffect, useMemo, useState } from "react";
import "./Characteristics.css";

const ACTIVITIES_API_URL = "http://localhost:5001/api/activities";
const PT_API_URL = "http://localhost:5001/api/ptschemeobjects";
const CH_API_URL = "http://localhost:5001/api/characteristics";

export default function Characteristics() {
  // dropdown data
  const [activities, setActivities] = useState([]);
  const [ptObjects, setPtObjects] = useState([]);

  // table data
  const [items, setItems] = useState([]);

  // loading/error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // form
  const [nameBg, setNameBg] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [unit, setUnit] = useState("");
  const [ptObjectId, setPtObjectId] = useState("");

  // edit
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setNameBg("");
    setNameEn("");
    setUnit("");
    setPtObjectId("");
    setEditingId(null);
  }

  async function loadAll() {
    try {
      setError("");
      setLoading(true);

      const [aRes, ptRes, chRes] = await Promise.all([
        fetch(ACTIVITIES_API_URL),
        fetch(PT_API_URL),
        fetch(CH_API_URL),
      ]);

      if (!aRes.ok) throw new Error("Failed to load activities");
      if (!ptRes.ok) throw new Error("Failed to load PT scheme objects");
      if (!chRes.ok) throw new Error("Failed to load characteristics");

      const aData = await aRes.json();
      const ptData = await ptRes.json();
      const chData = await chRes.json();

      setActivities(Array.isArray(aData) ? aData : []);
      setPtObjects(Array.isArray(ptData) ? ptData : []);

      const mapped = (Array.isArray(chData) ? chData : []).map((x) => ({
        id: x._id,
        nameBg: x.NameBG || "",
        nameEn: x.NameEN || "",
        unit: x.Unit || "",
        ptObjectId: x.PtSchemeObjectId || "",
      }));

      setItems(mapped);
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // maps for labels
  const activityNameById = useMemo(() => {
    const m = new Map();
    activities.forEach((a) => m.set(a._id, a.NameBG || ""));
    return m;
  }, [activities]);

  const ptObjectById = useMemo(() => {
    const m = new Map();
    ptObjects.forEach((o) =>
      m.set(o._id, {
        nameBg: o.NameBG || "",
        activityId: o.ActivityId || "",
      })
    );
    return m;
  }, [ptObjects]);

  // dropdown options: "Object – Activity"
  const ptOptions = useMemo(() => {
    return [...ptObjects]
      .map((o) => {
        const actName = activityNameById.get(o.ActivityId) || "—";
        return {
          id: o._id,
          label: `${o.NameBG || ""} – ${actName}`,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, "bg"));
  }, [ptObjects, activityNameById]);

  async function addItem() {
    const bg = nameBg.trim();
    const en = nameEn.trim();
    const u = unit.trim();
    if (!bg || !en || !u || !ptObjectId) return;

    try {
      setError("");

      const res = await fetch(CH_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NameBG: bg,
          NameEN: en,
          Unit: u,
          PtSchemeObjectId: ptObjectId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to create characteristic");
      }

      resetForm();
      loadAll();
    } catch (e) {
      setError(e?.message || "Error");
    }
  }

  async function updateItem() {
    const bg = nameBg.trim();
    const en = nameEn.trim();
    const u = unit.trim();
    if (!bg || !en || !u || !ptObjectId || !editingId) return;

    try {
      setError("");

      const res = await fetch(`${CH_API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NameBG: bg,
          NameEN: en,
          Unit: u,
          PtSchemeObjectId: ptObjectId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to update characteristic");
      }

      resetForm();
      loadAll();
    } catch (e) {
      setError(e?.message || "Error");
    }
  }

  async function deleteItem(id) {
    try {
      setError("");

      const res = await fetch(`${CH_API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to delete characteristic");
      }

      if (editingId === id) resetForm();
      loadAll();
    } catch (e) {
      setError(e?.message || "Error");
    }
  }

  function startEdit(row) {
    setEditingId(row.id);
    setNameBg(row.nameBg);
    setNameEn(row.nameEn);
    setUnit(row.unit);
    setPtObjectId(row.ptObjectId);
  }

  function onSubmit(e) {
    e.preventDefault();
    if (editingId) updateItem();
    else addItem();
  }

  function objectActivityLabel(id) {
    const obj = ptObjectById.get(id);
    if (!obj) return "—";
    const actName = activityNameById.get(obj.activityId) || "—";
    return `${obj.nameBg} – ${actName}`;
  }

  return (
    <div className="ch-page">
      <h1 className="ch-title">Характеристики</h1>

      {error && <div className="ch-error">{error}</div>}

      <div className="ch-card">
        <form className="ch-form" onSubmit={onSubmit}>
          <div className="ch-field">
            <label className="ch-label">Наименование (BG)</label>
            <input
              className="ch-input"
              value={nameBg}
              onChange={(e) => setNameBg(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="ch-field">
            <label className="ch-label">Наименование (EN)</label>
            <input
              className="ch-input"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="ch-field">
            <label className="ch-label">Единица</label>
            <input
              className="ch-input"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="ch-field">
            <label className="ch-label">Обект</label>
            <select
              className="ch-select"
              value={ptObjectId}
              onChange={(e) => setPtObjectId(e.target.value)}
              disabled={loading}
            >
              <option value="" disabled>
                Изберете обект
              </option>
              {ptOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="ch-btn" type="submit" disabled={loading}>
              {editingId ? "Запази" : "Запази"}
            </button>

            {editingId && (
              <button
                type="button"
                className="ch-btn secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Откажи
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="ch-table-card">
        <table className="ch-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Наименование</th>
              <th>Единица</th>
              <th>Обект - Дейност</th>
              <th className="ch-actions-col">Действия</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 18 }}>
                  Зареждане...
                </td>
              </tr>
            )}

            {!loading &&
                items.map((x, index) => (
                    <tr key={x.id}>
                        <td>{index + 1}</td>
                  <td>
                    <div>{x.nameBg}</div>
                    <div className="ch-sub">{x.nameEn}</div>
                  </td>
                  <td>{x.unit}</td>
                  <td>{objectActivityLabel(x.ptObjectId)}</td>
                  <td className="ch-actions">
                    <button
                      type="button"
                      className="ch-icon ch-edit"
                      onClick={() => startEdit(x)}
                      disabled={loading}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="ch-icon ch-delete"
                      onClick={() => deleteItem(x.id)}
                      disabled={loading}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 18 }}>
                  Няма добавени характеристики
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
