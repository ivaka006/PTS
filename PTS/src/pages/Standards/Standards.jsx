import { useEffect, useMemo, useState } from "react";
import "./Standards.css";

const CH_API_URL = "http://localhost:5001/api/characteristics";
const ST_API_URL = "http://localhost:5001/api/standards";

// ✅ allow only these "main" activities for the dropdown
const ALLOWED_ACTIVITIES = ["Вземане на проба", "Изпитване"];

export default function Standards() {
  // dropdown data
  const [characteristics, setCharacteristics] = useState([]);

  // ✅ needed for filtering by activity
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
  const [characteristicId, setCharacteristicId] = useState("");

  // edit
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setNameBg("");
    setNameEn("");
    setCharacteristicId("");
    setEditingId(null);
  }

  async function loadAll() {
    try {
      setError("");
      setLoading(true);

      // ✅ load everything needed for filtering:
      // characteristics -> ptSchemeObjects -> activities
      const [chRes, stRes, ptRes, aRes] = await Promise.all([
        fetch(CH_API_URL),
        fetch(ST_API_URL),
        fetch("http://localhost:5001/api/ptschemeobjects"),
        fetch("http://localhost:5001/api/activities"),
      ]);

      if (!chRes.ok) throw new Error("Failed to load characteristics");
      if (!stRes.ok) throw new Error("Failed to load standards");
      if (!ptRes.ok) throw new Error("Failed to load PT scheme objects");
      if (!aRes.ok) throw new Error("Failed to load activities");

      const chData = await chRes.json();
      const stData = await stRes.json();
      const ptData = await ptRes.json();
      const aData = await aRes.json();

      const chArr = Array.isArray(chData) ? chData : [];
      const stArr = Array.isArray(stData) ? stData : [];
      const ptArr = Array.isArray(ptData) ? ptData : [];
      const aArr = Array.isArray(aData) ? aData : [];

      setCharacteristics(chArr);
      setPtObjects(ptArr);
      setActivities(aArr);

      const mapped = stArr.map((x) => ({
        id: x._id,
        nameBg: x.NameBG || "",
        nameEn: x.NameEN || "",
        characteristicId: x.CharacteristicId || "",
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

  // characteristics map (for table columns)
  const characteristicById = useMemo(() => {
    const m = new Map();
    characteristics.forEach((c) =>
      m.set(c._id, {
        nameBg: c.NameBG || "",
        unit: c.Unit || "",
      })
    );
    return m;
  }, [characteristics]);

  // ✅ maps to filter characteristics by allowed activities
  const ptById = useMemo(() => {
    const m = new Map();
    ptObjects.forEach((o) => m.set(o._id, o));
    return m;
  }, [ptObjects]);

  const activityNameById = useMemo(() => {
    const m = new Map();
    activities.forEach((a) => m.set(a._id, a.NameBG || ""));
    return m;
  }, [activities]);

  // dropdown options: "Характеристика (Единица)"
  // ✅ FILTERED: only characteristics whose PtSchemeObject activity is allowed
  const characteristicOptions = useMemo(() => {
    return characteristics
      .filter((c) => {
        const ptObj = ptById.get(c.PtSchemeObjectId);
        if (!ptObj) return false;

        const activityName = activityNameById.get(ptObj.ActivityId) || "";
        return ALLOWED_ACTIVITIES.includes(activityName);
      })
      .map((c) => ({
        id: c._id,
        label: `${c.NameBG || ""} (${c.Unit || ""})`.trim(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "bg"));
  }, [characteristics, ptById, activityNameById]);

  function characteristicLabel(id) {
    const c = characteristicById.get(id);
    return c?.nameBg || "—";
  }

  function characteristicUnit(id) {
    const c = characteristicById.get(id);
    return c?.unit || "—";
  }

  async function addItem() {
    const bg = nameBg.trim();
    const en = nameEn.trim();
    if (!bg || !en || !characteristicId) return;

    try {
      setError("");

      const res = await fetch(ST_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NameBG: bg,
          NameEN: en,
          CharacteristicId: characteristicId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to create standard");
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
    if (!bg || !en || !characteristicId || !editingId) return;

    try {
      setError("");

      const res = await fetch(`${ST_API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NameBG: bg,
          NameEN: en,
          CharacteristicId: characteristicId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to update standard");
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

      const res = await fetch(`${ST_API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to delete standard");
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
    setCharacteristicId(row.characteristicId);
  }

  function onSubmit(e) {
    e.preventDefault();
    if (editingId) updateItem();
    else addItem();
  }

  return (
    <div className="st-page">
      <h1 className="st-title">Номенклатура – Стандарти</h1>

      {error && <div className="st-error">{error}</div>}

      <div className="st-card">
        <form className="st-form" onSubmit={onSubmit}>
          <div className="st-field">
            <label className="st-label">Наименование (BG)</label>
            <input
              className="st-input"
              value={nameBg}
              onChange={(e) => setNameBg(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="st-field">
            <label className="st-label">Наименование (EN)</label>
            <input
              className="st-input"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="st-field">
            <label className="st-label">Характеристика</label>
            <select
              className="st-select"
              value={characteristicId}
              onChange={(e) => setCharacteristicId(e.target.value)}
              disabled={loading}
            >
              <option value="" disabled>
                Изберете характеристика
              </option>
              {characteristicOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="st-btn" type="submit" disabled={loading}>
              {editingId ? "Запази" : "Запази"}
            </button>

            {editingId && (
              <button
                type="button"
                className="st-btn secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Откажи
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="st-table-card">
        <table className="st-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Наименование (BG)</th>
              <th>Характеристика</th>
              <th>Единица</th>
              <th className="st-actions-col">Действия</th>
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
                    <div className="st-sub">{x.nameEn}</div>
                  </td>
                  <td>{characteristicLabel(x.characteristicId)}</td>
                  <td>{characteristicUnit(x.characteristicId)}</td>
                  <td className="st-actions">
                    <button
                      type="button"
                      className="st-icon st-edit"
                      onClick={() => startEdit(x)}
                      disabled={loading}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="st-icon st-delete"
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
                  Няма добавени стандарти
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
