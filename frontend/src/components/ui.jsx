export function PageHero({ eyebrow, title, subtitle, children, actions }) {
  return (
    <section className="page-hero">
      <div className="page-hero__content">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {actions ? <div className="hero-actions">{actions}</div> : null}
      </div>
      {children ? <aside className="page-hero__aside">{children}</aside> : null}
    </section>
  );
}

export function SectionHeading({ kicker, title, description }) {
  return (
    <div className="section-heading">
      {kicker ? <span className="eyebrow">{kicker}</span> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function MetricGrid({ items }) {
  return (
    <div className="metric-grid">
      {items.map((item) => (
        <article className="metric-card" key={`${item.label}-${item.value}`}>
          <span className="metric-card__value">{item.value}</span>
          <h3>{item.label}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}

export function Panel({ title, description, children, className = '' }) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(title || description) && (
        <header className="panel__header">
          {title ? <h3>{title}</h3> : null}
          {description ? <p>{description}</p> : null}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatusPill({ value }) {
  const tone = getTone(value);

  return <span className={`status-pill status-pill--${tone}`}>{value}</span>;
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function LoadingState({ label = 'Loading experience...' }) {
  return (
    <div className="loading-state">
      <span className="loading-state__dot" />
      <p>{label}</p>
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`button button--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function formatCurrency(value) {
  const amount = typeof value === 'number' ? value : Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getTone(value = '') {
  const normalized = String(value).toLowerCase();

  if (normalized.includes('approved') || normalized.includes('active') || normalized.includes('resolved') || normalized.includes('signed')) {
    return 'positive';
  }

  if (normalized.includes('pending') || normalized.includes('review') || normalized.includes('generated')) {
    return 'warning';
  }

  if (normalized.includes('rejected') || normalized.includes('lapsed') || normalized.includes('flagged') || normalized.includes('high')) {
    return 'danger';
  }

  return 'neutral';
}
