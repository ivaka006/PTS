import { useEffect, useMemo, useState } from "react";
import "./Quantities.css";

const Q_API_URL = "http://localhost:5001/api/quantities";
const PT_API_URL = "http://localhost:5001/api/ptschemeobjects";
const A_API_URL = "http://localhost:5001/api/activities";

// ✅ only this activity should be included in dropdown
const ALLOWED_ACTIVITY = "Калибриране";

export default function Quantities() {
  // dropdown data (we need objects + activities to filter by activity)
  const [ptObjects, setPtObjects] = useState([]);
  const [activities, setActivities] = useState([]);

  // table data
  const [items, setItems] = useState([]);

  // state
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

      const [qRes, ptRes, aRes] = await Promise.all([
        fetch(Q_API_URL),
        fetch(PT_API_URL),
        fetch(A_API_URL),
      ]);

      if (!qRes.ok) throw new Error("Failed to load quantities");
      if (!ptRes.ok) throw new Error("Failed to load PT scheme objects");
      if (!aRes.ok) throw new Error("Failed to load activities");

      const qData = await qRes.json();
      const ptData = await ptRes.json();
      const aData = await aRes.json();

      const qArr = Array.isArray(qData) ? qData : [];
      const ptArr = Array.isArray(ptData) ? ptData : [];
      const aArr = Array.isArray(aData) ? aData : [];

      setPtObjects(ptArr);
      setActivities(aArr);

      const mapped = qArr.map((x) => ({
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

  const activityNameById = useMemo(() => {
    const m = new Map();
    activities.forEach((a) => m.set(a._id, a.NameBG || ""));
    return m;
  }, [activities]);

  const ptById = useMemo(() => {
    const m = new Map();
    ptObjects.forEach((o) =>
      m.set(o._id, {
        nameBg: o.NameBG || "",
        activityId: o.ActivityId || "",
      })
    );
    return m;
  }, [ptObjects]);

  // ✅ Dropdown options (filtered): only objects whose activity is "Калибриране"
  // Label format: "Обект – Дейност"
  const filteredPtOptions = useMemo(() => {
    return ptObjects
      .filter((o) => (activityNameById.get(o.ActivityId) || "") === ALLOWED_ACTIVITY)
      .map((o) => ({
        id: o._id,
        label: `${o.NameBG || ""} – ${activityNameById.get(o.ActivityId) || "—"}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "bg"));
  }, [ptObjects, activityNameById]);

  function objectActivityLabel(ptObjectIdValue) {
    const o = ptById.get(ptObjectIdValue);
    if (!o) return "—";
    const actName = activityNameById.get(o.activityId) || "—";
    return `${o.nameBg} – ${actName}`;
  }

  async function addItem() {
    const bg = nameBg.trim();
    const en = nameEn.trim();
    const u = unit.trim();
    if (!bg || !en || !u || !ptObjectId) return;

    try {
      setError("");

      const res = await fetch(Q_API_URL, {
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
        throw new Error(errData?.message || "Failed to create quantity");
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

      const res = await fetch(`${Q_API_URL}/${editingId}`, {
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
        throw new Error(errData?.message || "Failed to update quantity");
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

      const res = await fetch(`${Q_API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to delete quantity");
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

  return (
    <div className="q-page">
      <h1 className="q-title">Величини</h1>

      {error && <div className="q-error">{error}</div>}

      <div className="q-card">
        <form className="q-form" onSubmit={onSubmit}>
          <div className="q-field">
            <label className="q-label">Наименование (BG)</label>
            <input
              className="q-input"
              value={nameBg}
              onChange={(e) => setNameBg(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="q-field">
            <label className="q-label">Наименование (EN)</label>
            <input
              className="q-input"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="q-field">
            <label className="q-label">Единица</label>
            <input
              className="q-input"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* ✅ label must be "Характеристики" and dropdown only for "Калибриране" */}
          <div className="q-field">
            <label className="q-label">Характеристики</label>
            <select
              className="q-select"
              value={ptObjectId}
              onChange={(e) => setPtObjectId(e.target.value)}
              disabled={loading}
            >
              <option value="" disabled>
                Изберете обект
              </option>
              {filteredPtOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="q-btn" type="submit" disabled={loading}>
              Запази
            </button>

            {editingId && (
              <button
                type="button"
                className="q-btn secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Откажи
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="q-table-card">
        <table className="q-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Наименование</th>
              <th>Единица</th>
              <th>Обект - Дейност</th>
              <th className="q-actions-col">Действия</th>
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
                    <div className="q-sub">{x.nameEn}</div>
                  </td>
                  <td>{x.unit}</td>
                  <td>{objectActivityLabel(x.ptObjectId)}</td>
                  <td className="q-actions">
                    <button
                      type="button"
                      className="q-icon q-edit"
                      onClick={() => startEdit(x)}
                      disabled={loading}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="q-icon q-delete"
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
                  Няма добавени величини
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
