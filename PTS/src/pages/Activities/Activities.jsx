import { useEffect, useState } from "react";
import "./Activities.css";

const API_URL = "http://localhost:5001/api/activities";

export default function Activities() {
  // Table data (from DB)
  const [items, setItems] = useState([]);

  // Form inputs
  const [bg, setBg] = useState("");
  const [en, setEn] = useState("");

  // Editing state
  const [editId, setEditId] = useState(null);

  // Optional: basic loading / error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function clearForm() {
    setBg("");
    setEn("");
    setEditId(null);
  }

  // GET: load all activities from DB
  async function loadItems() {
    try {
      setError("");
      setLoading(true);

      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to load activities");

      const data = await res.json();

      setItems(
        data.map((item) => ({
          id: item._id,
          bg: item.NameBG,
          en: item.NameЕN,
        }))
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  // POST: create new
  async function addItem() {
    const bgValue = bg.trim();
    const enValue = en.trim();
    if (!bgValue || !enValue) return;

    try {
      setError("");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NameBG: bgValue,
          NameЕN: enValue,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to create activity");
      }

      clearForm();
      loadItems();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  // PUT: update existing
  async function updateItem() {
    const bgValue = bg.trim();
    const enValue = en.trim();
    if (!bgValue || !enValue) return;

    try {
      setError("");

      const res = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NameBG: bgValue,
          NameЕN: enValue,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to update activity");
      }

      clearForm();
      loadItems();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  // DELETE
  async function deleteItem(id) {
    try {
      setError("");

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to delete activity");
      }

      // If we delete the one we were editing, reset form
      if (editId === id) clearForm();

      loadItems();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  // Load row into inputs (no API call)
  function startEdit(item) {
    setBg(item.bg);
    setEn(item.en);
    setEditId(item.id);
  }

  // Save decides add/update
  function handleSave() {
    if (editId === null) addItem();
    else updateItem();
  }

  return (
    <div className="page">
      <h1 className="page-title">Номенклатура на Дейност</h1>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 12, color: "crimson" }}>
          {error}
        </div>
      )}

      {/* FORM */}
      <section className="card">
        <div className="field">
          <label className="label">Наименование (BG)</label>
          <input
            className="input"
            type="text"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label">Наименование (EN)</label>
          <input
            className="input"
            type="text"
            value={en}
            onChange={(e) => setEn(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button
            className="btn-save"
            type="button"
            onClick={handleSave}
            disabled={loading}
          >
            {editId === null ? "Запази" : "Запази промяна"}
          </button>

          {editId !== null && (
            <button
              className="btn-cancel"
              type="button"
              onClick={clearForm}
              disabled={loading}
            >
              Откажи
            </button>
          )}
        </div>
      </section>

      {/* TABLE */}
      <section className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Наименование</th>
              <th className="th-actions">Действия</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td className="empty" colSpan={2}>
                  Зареждане...
                </td>
              </tr>
            )}

            {!loading &&
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="row-title">{item.bg}</div>
                    <div className="row-sub">{item.en}</div>
                  </td>

                  <td className="actions">
                    <button
                      className="icon-btn edit"
                      type="button"
                      onClick={() => startEdit(item)}
                      disabled={loading}
                    >
                      ✎
                    </button>

                    <button
                      className="icon-btn delete"
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      disabled={loading}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td className="empty" colSpan={2}>
                  Няма записи.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
