import { useEffect, useMemo, useState } from "react";
import "./PtSchemeObjects.css";

const ACTIVITIES_API_URL = "http://localhost:5001/api/activities";
const PT_API_URL = "http://localhost:5001/api/ptschemeobjects";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PtSchemeObjects() {
  // activities dropdown
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState("");

  // table from DB
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // error
  const [error, setError] = useState("");

  // form
  const [objBg, setObjBg] = useState("");
  const [objEn, setObjEn] = useState("");
  const [activityId, setActivityId] = useState("");
  const [file, setFile] = useState(null);

  // edit
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setObjBg("");
    setObjEn("");
    setActivityId("");
    setFile(null);
    setEditingId(null);
  }

  async function loadActivities() {
    try {
      setActivitiesError("");
      setActivitiesLoading(true);

      const res = await fetch(ACTIVITIES_API_URL);
      if (!res.ok) throw new Error("Failed to load activities");

      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (e) {
      setActivitiesError(e?.message || "Error");
    } finally {
      setActivitiesLoading(false);
    }
  }

  async function loadItems() {
    try {
      setError("");
      setItemsLoading(true);

      const res = await fetch(PT_API_URL);
      if (!res.ok) throw new Error("Failed to load PT scheme objects");

      const data = await res.json();
      const mapped = (Array.isArray(data) ? data : []).map((x) => ({
        id: x._id,
        bg: x.NameBG || "",
        en: x.NameEN || "",
        activityId: x.ActivityId || "",
        imageBase64: x.ImageBase64 || "",
      }));

      setItems(mapped);
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setItemsLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
    loadItems();
  }, []);

  const activityOptions = useMemo(
    () =>
      [...activities]
        .map((a) => ({
          id: a._id,
          bg: a?.NameBG || "",
        }))
        .sort((a, b) => a.bg.localeCompare(b.bg, "bg")),
    [activities]
  );

  const activityNameById = useMemo(() => {
    const m = new Map();
    activityOptions.forEach((a) => m.set(a.id, a.bg));
    return m;
  }, [activityOptions]);

  async function addItem() {
    const bg = objBg.trim();
    const en = objEn.trim();
    if (!bg || !en || !activityId) return;

    try {
      setError("");

      // ✅ block huge images (2MB max)
      if (file && file.size > 2 * 1024 * 1024) {
        setError("Файлът е твърде голям (макс 2MB снимка).");
        return;
      }

      const imageBase64 = file ? await fileToBase64(file) : "";

      const res = await fetch(PT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NameBG: bg,
          NameEN: en,
          ActivityId: activityId,
          ImageBase64: imageBase64,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to create PT scheme object");
      }

      resetForm();
      loadItems();
    } catch (e) {
      setError(e?.message || "Error");
    }
  }

  async function updateItem() {
    const bg = objBg.trim();
    const en = objEn.trim();
    if (!bg || !en || !activityId || !editingId) return;

    try {
      setError("");

      // ✅ block huge images (2MB max) - only if user picked a new file
      if (file && file.size > 2 * 1024 * 1024) {
        setError("Файлът е твърде голям (макс 2MB).");
        return;
      }

      // if user chose new image -> send it, otherwise keep old image in DB
      const imageBase64 = file ? await fileToBase64(file) : undefined;

      const payload = {
        NameBG: bg,
        NameEN: en,
        ActivityId: activityId,
      };
      if (typeof imageBase64 === "string") payload.ImageBase64 = imageBase64;

      const res = await fetch(`${PT_API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to update PT scheme object");
      }

      resetForm();
      loadItems();
    } catch (e) {
      setError(e?.message || "Error");
    }
  }

  async function deleteItem(id) {
    try {
      setError("");

      const res = await fetch(`${PT_API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to delete PT scheme object");
      }

      if (editingId === id) resetForm();
      loadItems();
    } catch (e) {
      setError(e?.message || "Error");
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setObjBg(item.bg);
    setObjEn(item.en);
    setActivityId(item.activityId);
    setFile(null);
  }

  function handleSave(e) {
    e.preventDefault();
    if (editingId) updateItem();
    else addItem();
  }

  return (
    <div className="pt-page">
      <h1 className="pt-title">Обекти на РТ схеми</h1>

      {(activitiesError || error) && (
        <div className="pt-error">{activitiesError || error}</div>
      )}

      {/* FORM */}
      <div className="pt-card">
        <form className="pt-form" onSubmit={handleSave}>
          <div className="pt-field">
            <label className="pt-label">Наименование (BG)</label>
            <input
              className="pt-input"
              value={objBg}
              onChange={(e) => setObjBg(e.target.value)}
              disabled={itemsLoading}
            />
          </div>

          <div className="pt-field">
            <label className="pt-label">Наименование (EN)</label>
            <input
              className="pt-input"
              value={objEn}
              onChange={(e) => setObjEn(e.target.value)}
              disabled={itemsLoading}
            />
          </div>

          <div className="pt-field">
            <label className="pt-label">Дейност</label>
            <select
              className="pt-select"
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              disabled={activitiesLoading || itemsLoading}
            >
              <option value="" disabled>
                {activitiesLoading ? "Зареждане..." : "Изберете дейност"}
              </option>
              {activityOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bg}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-field">
            <label className="pt-label">Снимка</label>
            <input
              className="pt-file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={itemsLoading}
            />
            <div className="pt-sub">Макс размер на снимка: 2MB</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="pt-btn" type="submit" disabled={itemsLoading}>
              {editingId ? "Запази" : "Добави"}
            </button>

            {editingId && (
              <button
                type="button"
                className="pt-btn secondary"
                onClick={resetForm}
                disabled={itemsLoading}
              >
                Откажи
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE */}
      <div className="pt-table-card">
        <table className="pt-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Снимка</th>
              <th>Наименование</th>
              <th>Дейност</th>
              <th className="pt-actions-col">Действия</th>
            </tr>
          </thead>

          <tbody>
            {itemsLoading && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 18 }}>
                  Зареждане...
                </td>
              </tr>
            )}

            {!itemsLoading &&
              items.map((x, idx) => (
                <tr key={x.id}>
                  <td>{idx + 1}</td>
                  <td>
                    {x.imageBase64 ? (
                      <img className="pt-img" src={x.imageBase64} alt="" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <div>{x.bg}</div>
                    <div className="pt-sub">{x.en}</div>
                  </td>
                  <td>{activityNameById.get(x.activityId) || "—"}</td>
                  <td className="pt-actions">
                    <button
                      type="button"
                      className="pt-icon pt-edit"
                      onClick={() => startEdit(x)}
                      disabled={itemsLoading}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="pt-icon pt-delete"
                      onClick={() => deleteItem(x.id)}
                      disabled={itemsLoading}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}

            {!itemsLoading && items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 18 }}>
                  Няма добавени обекти
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
