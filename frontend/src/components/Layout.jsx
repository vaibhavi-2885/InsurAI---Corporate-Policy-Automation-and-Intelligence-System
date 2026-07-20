import { NavLink } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Home' },
  { to: '/customer', label: 'Customer Portal' },
  { to: '/operations', label: 'Operations Hub' },
  { to: '/claims', label: 'Claims Studio' },
  { to: '/control-tower', label: 'Control Tower' },
  { to: '/copilot', label: 'AI Copilot' },
];

function navClass({ isActive }) {
  return isActive ? 'site-nav__link is-active' : 'site-nav__link';
}

export default function Layout({ children }) {
  return (
    <div className="site-shell">
      <div className="site-shell__glow site-shell__glow--left" />
      <div className="site-shell__glow site-shell__glow--right" />

      <header className="site-header">
        <div className="site-header__brand">
          <div className="brand-mark">IA</div>
          <div>
            <div className="brand-name">InsurAI</div>
            <p className="brand-tagline">Corporate Policy Automation and Intelligence System</p>
          </div>
        </div>

        <nav className="site-nav" aria-label="Primary">
          {navigation.map((item) => (
            <NavLink key={item.to} className={navClass} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__pill">
          Live Data
          <span>MySQL Portfolio</span>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <p>InsurAI is designed as a production-style insurance platform with LIC-inspired servicing and AI-first operations.</p>
        <p>Frontend: React + Vite. Backend: Spring Boot + MySQL-backed insurance workflows.</p>
      </footer>
    </div>
  );
}
