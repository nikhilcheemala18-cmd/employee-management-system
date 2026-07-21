import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";

function AppShell({
  title,
  subtitle,
  navItems,
  activeItem,
  onNavItemClick,
  onLogout,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (item) => {
    onNavItemClick(item);
    setMobileOpen(false);
  };

  return (
    <div className="app-shell">
      {mobileOpen && <div className="modal-backdrop show d-lg-none" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <div className="sidebar__mark">AS</div>
            {!collapsed && (
              <div>
                <p className="sidebar__title">AS HRM</p>
                <p className="sidebar__subtitle">Management Suite</p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="app-button app-button--ghost d-none d-lg-inline-flex"
            onClick={() => setCollapsed((value) => !value)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar__item ${isActive ? "sidebar__item--active" : ""}`}
                onClick={() => handleNavClick(item)}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={19} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <button type="button" className="sidebar__item" onClick={onLogout}>
            <LogOut size={19} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="shell-main">
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              className="app-button app-button--soft d-lg-none mb-2"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
              Menu
            </button>
            <h1 className="topbar__title">{title}</h1>
            {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
          </div>
          <div className="topbar__actions">
            <span className="status-badge status-badge--active">Online</span>
          </div>
        </header>
        <section className="content-area">{children}</section>
      </main>
    </div>
  );
}

export default AppShell;
