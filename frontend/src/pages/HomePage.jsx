import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';
import { Button, LoadingState, MetricGrid, Panel, PageHero, SectionHeading, formatCurrency } from '../components/ui';

const initialQuoteForm = {
  planId: '',
  age: 32,
  smokerStatus: 'NO',
  termYears: 20,
};

const initialCallbackForm = {
  fullName: '',
  email: '',
  serviceType: 'Portfolio review',
  preferredWindow: '11:30 AM',
};

export default function HomePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [quoteForm, setQuoteForm] = useState(initialQuoteForm);
  const [quoteResult, setQuoteResult] = useState(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [callbackForm, setCallbackForm] = useState(initialCallbackForm);
  const [callbackResult, setCallbackResult] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    apiGet('/api/experience/home')
      .then((response) => {
        setData(response);
        if (response.featuredPlans?.length) {
          setQuoteForm((current) => ({
            ...current,
            planId: String(response.featuredPlans[0].id),
          }));
        }
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const selectedPlan = useMemo(
    () => data?.featuredPlans?.find((plan) => String(plan.id) === quoteForm.planId),
    [data, quoteForm.planId],
  );

  async function handleQuoteSubmit(event) {
    event.preventDefault();
    setIsQuoting(true);
    setQuoteResult(null);

    try {
      const premium = await apiPost('/api/quote', {
        planId: Number(quoteForm.planId),
        age: Number(quoteForm.age),
        smokerStatus: quoteForm.smokerStatus,
        termYears: Number(quoteForm.termYears),
      });

      setQuoteResult({
        premium,
        planName: selectedPlan?.name,
      });
    } catch (requestError) {
      setQuoteResult({
        error: requestError.message || 'Unable to calculate quote right now.',
      });
    } finally {
      setIsQuoting(false);
    }
  }

  async function handleCallbackSubmit(event) {
    event.preventDefault();
    setIsScheduling(true);
    setCallbackResult(null);

    try {
      const response = await apiPost('/api/experience/callback', callbackForm);
      setCallbackResult(response);
      setCallbackForm(initialCallbackForm);
    } catch (requestError) {
      setCallbackResult({
        error: requestError.message || 'Unable to book callback right now.',
      });
    } finally {
      setIsScheduling(false);
    }
  }

  if (error) {
    return <Panel title="Unable to load InsurAI" description={error} />;
  }

  if (!data) {
    return <LoadingState label="Loading the InsurAI home experience..." />;
  }

  return (
    <div className="page-stack">
      <PageHero
        eyebrow={data.hero.eyebrow}
        title={data.hero.title}
        subtitle={data.hero.subtitle}
        actions={(
          <>
            <Link className="button button--primary" to="/customer">
              Open Customer Portal
            </Link>
            <Link className="button button--secondary" to="/operations">
              Explore Operations Hub
            </Link>
          </>
        )}
      >
        <Panel title="Why this build stands out" description={data.hero.benchmark} className="panel--highlight">
          <ul className="feature-list">
            {data.differentiators.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </PageHero>

      <MetricGrid items={data.heroStats} />

      <section className="split-section">
        <div>
          <SectionHeading
            kicker="LIC-Inspired Services"
            title="Designed around the service expectations people already trust"
            description="Premium collection, policy service, claims support, document vault access, and assisted advisor journeys all live inside one digital platform."
          />
          <div className="card-grid card-grid--two">
            {data.serviceRail.map((item) => (
              <Panel key={item.title} title={item.title} description={item.description}>
                <span className="callout-link">{item.cta}</span>
              </Panel>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading
            kicker="Global Platform DNA"
            title="Enterprise modules you would expect from serious insurance software"
            description="InsurAI combines customer servicing with the policy, billing, claims, underwriting, and analytics patterns seen across modern insurance core systems."
          />
          <div className="stack-list">
            {data.platformModules.map((item) => (
              <article className="stack-item" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          kicker="Product Shelf"
          title="A richer insurance catalog than a basic insurance landing page"
          description="These products are pulled from the live MySQL catalog and span protection, health, investment, travel, mobility, and liability use cases."
        />
        <div className="card-grid card-grid--three">
          {data.featuredPlans.map((plan) => (
            <Panel key={plan.id} title={plan.name} description={plan.description} className="plan-card">
              <div className="plan-card__meta">
                <span>{plan.category}</span>
                <strong>{formatCurrency(plan.basePremium)}</strong>
              </div>
              <p className="plan-card__coverage">{formatCurrency(plan.coverageAmount)} coverage</p>
              <ul className="feature-list">
                {plan.featureBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      </section>

      <section className="split-section split-section--forms">
        <Panel
          title="Premium Estimator"
          description="A fast pricing interaction similar to public insurance calculators, upgraded with demographic risk factors."
          className="panel--glass"
        >
          <form className="form-grid" onSubmit={handleQuoteSubmit}>
            <label>
              Plan
              <select
                value={quoteForm.planId}
                onChange={(event) => setQuoteForm((current) => ({ ...current, planId: event.target.value }))}
              >
                {data.featuredPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Age
              <input
                min="18"
                type="number"
                value={quoteForm.age}
                onChange={(event) => setQuoteForm((current) => ({ ...current, age: event.target.value }))}
              />
            </label>

            <label>
              Smoker status
              <select
                value={quoteForm.smokerStatus}
                onChange={(event) => setQuoteForm((current) => ({ ...current, smokerStatus: event.target.value }))}
              >
                <option value="NO">No</option>
                <option value="YES">Yes</option>
              </select>
            </label>

            <label>
              Term years
              <input
                min="5"
                type="number"
                value={quoteForm.termYears}
                onChange={(event) => setQuoteForm((current) => ({ ...current, termYears: event.target.value }))}
              />
            </label>

            <Button disabled={isQuoting} type="submit">
              {isQuoting ? 'Calculating...' : 'Generate Quote'}
            </Button>
          </form>

          {quoteResult ? (
            <div className={`result-card ${quoteResult.error ? 'is-danger' : 'is-success'}`}>
              {quoteResult.error ? (
                <p>{quoteResult.error}</p>
              ) : (
                <>
                  <p className="result-card__eyebrow">Estimated yearly premium</p>
                  <h3>{formatCurrency(quoteResult.premium)}</h3>
                  <p>{quoteResult.planName}</p>
                </>
              )}
            </div>
          ) : null}
        </Panel>

        <Panel
          title="Advisor Callback"
          description="This gives the product a real assisted-service motion, which is important for an LIC-style experience."
          className="panel--glass"
        >
          <form className="form-grid" onSubmit={handleCallbackSubmit}>
            <label>
              Full name
              <input
                type="text"
                value={callbackForm.fullName}
                onChange={(event) => setCallbackForm((current) => ({ ...current, fullName: event.target.value }))}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={callbackForm.email}
                onChange={(event) => setCallbackForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>

            <label>
              Service type
              <select
                value={callbackForm.serviceType}
                onChange={(event) => setCallbackForm((current) => ({ ...current, serviceType: event.target.value }))}
              >
                <option>Portfolio review</option>
                <option>Renewal support</option>
                <option>Claims help</option>
                <option>Corporate product advisory</option>
              </select>
            </label>

            <label>
              Preferred time
              <select
                value={callbackForm.preferredWindow}
                onChange={(event) => setCallbackForm((current) => ({ ...current, preferredWindow: event.target.value }))}
              >
                <option>11:30 AM</option>
                <option>2:00 PM</option>
                <option>4:30 PM</option>
              </select>
            </label>

            <Button disabled={isScheduling} type="submit" variant="secondary">
              {isScheduling ? 'Scheduling...' : 'Book callback'}
            </Button>
          </form>

          {callbackResult ? (
            <div className={`result-card ${callbackResult.error ? 'is-danger' : 'is-success'}`}>
              {callbackResult.error ? (
                <p>{callbackResult.error}</p>
              ) : (
                <>
                  <p className="result-card__eyebrow">{callbackResult.reference}</p>
                  <h3>{callbackResult.advisor}</h3>
                  <p>
                    {callbackResult.date} at {callbackResult.time}
                  </p>
                </>
              )}
            </div>
          ) : null}
        </Panel>
      </section>

      <section>
        <SectionHeading
          kicker="Support Network"
          title="Digital-first, but still grounded in service desks and advisor hubs"
          description="The branch and service structure helps the product feel closer to how real insurers balance self-service with human support."
        />
        <div className="card-grid card-grid--three">
          {data.branches.map((branch) => (
            <Panel key={branch.name} title={branch.name} description={branch.focus} />
          ))}
        </div>
      </section>
    </div>
  );
}
