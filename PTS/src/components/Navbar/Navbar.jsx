import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";
import logo from "../../assets/react.svg";

export default function Navbar() {
  const [usersOpen, setUsersOpen] = useState(false);
  const [nomOpen, setNomOpen] = useState(true);

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src={logo} alt="PTS Bulgaria" className="logo" />
        <div className="app-name">SchemeGen</div>
      </div>

      <nav className="menu">
        <NavLink to="/" className={({ isActive }) => "menu-item link " + (isActive ? "active" : "")}>
          <span className="icon">🏠</span>
          <span className="text">Табло</span>
        </NavLink>

        <div className="menu-group">
          <button
            type="button"
            className={"menu-item btn " + (usersOpen ? "open" : "")}
            onClick={() => setUsersOpen(v => !v)}
          >
            <span className="icon">👥</span>
            <span className="text">Потребители</span>
            <span className={"chevron " + (usersOpen ? "chev-open" : "")}>▾</span>
          </button>

          <div className={"submenu " + (usersOpen ? "show" : "")}>
            <NavLink to="/users" className={({ isActive }) => "submenu-item " + (isActive ? "sub-active" : "")}>
              Списък
            </NavLink>
          </div>
        </div>

        <div className="menu-group">
          <button
            type="button"
            className={"menu-item btn " + (nomOpen ? "open" : "")}
            onClick={() => setNomOpen(v => !v)}
          >
            <span className="icon">📄</span>
            <span className="text">Номенклатури</span>
            <span className={"chevron " + (nomOpen ? "chev-open" : "")}>▾</span>
          </button>

          <div className={"submenu " + (nomOpen ? "show" : "")}>
            <NavLink to="/activities" className={({ isActive }) => "submenu-item " + (isActive ? "sub-active" : "")}>Дейности</NavLink>
            <NavLink to="/objects" className={({ isActive }) => "submenu-item " + (isActive ? "sub-active" : "")}>Обекти на РТ схеми</NavLink>
            <NavLink to="/characteristics" className={({ isActive }) => "submenu-item " + (isActive ? "sub-active" : "")}>Характеристики</NavLink>
            <NavLink to="/standards" className={({ isActive }) => "submenu-item " + (isActive ? "sub-active" : "")}>Стандарти</NavLink>
            <NavLink to="/values" className={({ isActive }) => "submenu-item " + (isActive ? "sub-active" : "")}>Величини</NavLink>
            <NavLink to="/subcontractors" className={({ isActive }) => "submenu-item " + (isActive ? "sub-active" : "")}>Подизпълнители</NavLink>
          </div>
        </div>

        <NavLink to="/settings" className={({ isActive }) => "menu-item link " + (isActive ? "active" : "")}>
          <span className="icon">⚙️</span>
          <span className="text">Настройки</span>
        </NavLink>

        <NavLink to="/logout" className="menu-item link logout">
          <span className="icon">⤴</span>
          <span className="text">Изход</span>
        </NavLink>
      </nav>

      <div className="bottom">
        <select className="lang">
          <option>Български</option>
          <option>English</option>
        </select>
      </div>
    </aside>
  );
}
