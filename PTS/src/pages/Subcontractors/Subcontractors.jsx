import { useEffect, useMemo, useRef, useState } from "react";
import "./Subcontractors.css";

const SUB_API_URL = "http://localhost:5001/api/subcontractors";
const PT_API_URL = "http://localhost:5001/api/ptschemeobjects";
const A_API_URL = "http://localhost:5001/api/activities";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Simple MultiSelect Dropdown (no libs)
 * - shows selected labels in the input
 * - opens a dropdown with checkboxes
 */
function MultiSelectDropdown({ label, options, valueIds, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const selectedLabels = useMemo(() => {
    const set = new Set(valueIds);
    return options.filter(o => set.has(o.id)).map(o => o.label);
  }, [options, valueIds]);

  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function toggle(id) {
    const set = new Set(valueIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange(Array.from(set));
  }

  return (
    <div className="sub-field" ref={boxRef}>
      <label className="sub-label">{label}</label>

      <button
        type="button"
        className="sub-multi"
        onClick={() => setOpen((s) => !s)}
        disabled={disabled}
      >
        <span className="sub-multi-text">
          {selectedLabels.length ? selectedLabels.join(", ") : "Изберете РТ схеми"}
        </span>
        <span className="sub-caret">▾</span>
      </button>

      {open && !disabled && (
        <div className="sub-dropdown">
          {options.length === 0 && (
            <div className="sub-dd-empty">Няма налични РТ схеми</div>
          )}

          {options.map((o) => (
            <label key={o.id} className="sub-dd-item">
              <input
                type="checkbox"
                checked={valueIds.includes(o.id)}
                onChange={() => toggle(o.id)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Subcontractors() {
  // dropdown sources
  const [ptObjects, setPtObjects] = useState([]);
  const [activities, setActivities] = useState([]);

  // table
  const [items, setItems] = useState([]);

  // state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // form
  const [nameBg, setNameBg] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [file, setFile] = useState(null);
  const [ptIds, setPtIds] = useState([]); // multi

  // edit
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setNameBg("");
    setNameEn("");
    setFile(null);
    setPtIds([]);
    setEditingId(null);
  }

  async function loadAll() {
    try {
      setError("");
      setLoading(true);

      const [subRes, ptRes, aRes] = await Promise.all([
        fetch(SUB_API_URL),
        fetch(PT_API_URL),
        fetch(A_API_URL),
      ]);

      if (!subRes.ok) throw new Error("Failed to load subcontractors");
      if (!ptRes.ok) throw new Error("Failed to load PT scheme objects");
      if (!aRes.ok) throw new Error("Failed to load activities");

      const subData = await subRes.json();
      const ptData = await ptRes.json();
      const aData = await aRes.json();

      setPtObjects(Array.isArray(ptData) ? ptData : []);
      setActivities(Array.isArray(aData) ? aData : []);

      const mapped = (Array.isArray(subData) ? subData : []).map((x) => ({
        id: x._id,
        nameBg: x.NameBG || "",
        nameEn: x.NameEN || "",
        logoBase64: x.LogoBase64 || "",
        ptIds: Array.isArray(x.PtSchemeObjectIds) ? x.PtSchemeObjectIds : [],
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

  const ptLabelById = useMemo(() => {
    const m = new Map();
    ptObjects.forEach((o) => {
      const actName = activityNameById.get(o.ActivityId) || "—";
      m.set(o._id, `${o.NameBG || ""} — ${actName}`.trim());
    });
    return m;
  }, [ptObjects, activityNameById]);

  // ✅ dropdown options come from PtSchemeObjects
  const ptOptions = useMemo(() => {
    return [...ptObjects]
      .map((o) => ({
        id: o._id,
        label: ptLabelById.get(o._id) || (o.NameBG || ""),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "bg"));
  }, [ptObjects, ptLabelById]);

  function rowPtText(ids) {
    if (!ids || ids.length === 0) return "—";
    return ids.map((id) => ptLabelById.get(id) || "—").join(", ");
  }

  async function addItem() {
    const bg = nameBg.trim();
    const en = nameEn.trim();
    if (!bg || !en || ptIds.length === 0) return;

    try {
      setError("");

      // 2MB limit
      if (file && file.size > 2 * 1024 * 1024) {
        setError("Файлът е твърде голям (макс 2MB).");
        return;
      }

      const logoBase64 = file ? await fileToBase64(file) : "";

      const res = await fetch(SUB_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NameBG: bg,
          NameEN: en,
          LogoBase64: logoBase64,
          PtSchemeObjectIds: ptIds,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to create subcontractor");
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
    if (!bg || !en || ptIds.length === 0 || !editingId) return;

    try {
      setError("");

      if (file && file.size > 2 * 1024 * 1024) {
        setError("Файлът е твърде голям (макс 2MB).");
        return;
      }

      const logoBase64 = file ? await fileToBase64(file) : undefined;

      const payload = {
        NameBG: bg,
        NameEN: en,
        PtSchemeObjectIds: ptIds,
      };
      if (typeof logoBase64 === "string") payload.LogoBase64 = logoBase64;

      const res = await fetch(`${SUB_API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to update subcontractor");
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

      const res = await fetch(`${SUB_API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to delete subcontractor");
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
    setPtIds(row.ptIds || []);
    setFile(null);
  }

  function onSubmit(e) {
    e.preventDefault();
    if (editingId) updateItem();
    else addItem();
  }

  return (
    <div className="sub-page">
      <h1 className="sub-title">Номенклатура – Подизпълнители</h1>

      {error && <div className="sub-error">{error}</div>}

      <div className="sub-card">
        <form className="sub-form" onSubmit={onSubmit}>
          <div className="sub-grid2">
            <div className="sub-field">
              <label className="sub-label">Наименование (BG)</label>
              <input
                className="sub-input"
                value={nameBg}
                onChange={(e) => setNameBg(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="sub-field">
              <label className="sub-label">Наименование (EN)</label>
              <input
                className="sub-input"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="sub-grid2">
            <div className="sub-field">
              <label className="sub-label">Лого</label>
              <input
                className="sub-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
              />
              <div className="sub-hint">Избери изображение (PNG/JPG/WebP, ? 2MB)</div>
            </div>

            {/* ✅ dropdown from PtSchemeObjects */}
            <MultiSelectDropdown
              label="РТ схеми"
              options={ptOptions}
              valueIds={ptIds}
              onChange={setPtIds}
              disabled={loading}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="sub-btn" type="submit" disabled={loading}>
              Запази
            </button>

            {editingId && (
              <button
                type="button"
                className="sub-btn secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Откажи
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="sub-table-card">
        <table className="sub-table">
          <thead>
            <tr>
              <th>Лого</th>
              <th>Наименование (BG)</th>
              <th>Наименование (EN)</th>
              <th>РТ схеми</th>
              <th className="sub-actions-col">Действия</th>
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
              items.map((x) => (
                <tr key={x.id}>
                  <td>
                    {x.logoBase64 ? (
                      <img className="sub-logo" src={x.logoBase64} alt="" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{x.nameBg}</td>
                  <td>{x.nameEn}</td>
                  <td className="sub-ptcell">{rowPtText(x.ptIds)}</td>
                  <td className="sub-actions">
                    <button
                      type="button"
                      className="sub-icon sub-edit"
                      onClick={() => startEdit(x)}
                      disabled={loading}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="sub-icon sub-delete"
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
                  Няма добавени подизпълнители
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
