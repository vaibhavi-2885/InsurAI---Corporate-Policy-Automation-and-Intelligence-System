import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';
import { Button, LoadingState, MetricGrid, Panel, PageHero, SectionHeading, StatusPill, formatCurrency, formatDateTime } from '../components/ui';

const initialRiskForm = {
  age: '',
  healthHistory: '',
  occupation: '',
};

export default function OperationsHub() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [riskForm, setRiskForm] = useState(initialRiskForm);
  const [riskResult, setRiskResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    apiGet('/api/experience/operations')
      .then(setData)
      .catch((requestError) => setError(requestError.message));
  }, []);

  async function handleEvaluate(event) {
    event.preventDefault();
    setIsEvaluating(true);
    setRiskResult(null);

    try {
      const response = await apiPost('/api/v1/underwriting/evaluate', {
        age: Number(riskForm.age),
        healthHistory: riskForm.healthHistory,
        occupation: riskForm.occupation,
      });
      setRiskResult(response);
    } catch (requestError) {
      setRiskResult({ error: requestError.message });
    } finally {
      setIsEvaluating(false);
    }
  }

  if (error && !data) {
    return <Panel title="Unable to load operations hub" description={error} />;
  }

  if (!data) {
    return <LoadingState label="Loading operations intelligence..." />;
  }

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Operations and Underwriting"
        title="Back-office automation with renewal radar, advisor capacity, and pricing intelligence"
        subtitle="This workspace is inspired by the kinds of modules global insurance platforms emphasize, but presented in a cleaner and more portfolio-aware way."
      >
        <Panel title="Operational thesis" description="InsurAI treats renewals, underwriting, service recovery, and advisor scheduling as one connected operating system instead of separate admin screens.">
          <ul className="feature-list">
            {data.benchmarkNotes.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </PageHero>

      <MetricGrid items={data.heroMetrics} />

      <section className="split-section split-section--forms">
        <Panel title="Underwriting simulator" description="A working rule-based evaluator that logs risk decisions for auditability." className="panel--glass">
          <form className="form-grid" onSubmit={handleEvaluate}>
            <label>
              Age
              <input
                type="number"
                value={riskForm.age}
                onChange={(event) => setRiskForm((current) => ({ ...current, age: event.target.value }))}
              />
            </label>

            <label className="form-grid__full">
              Health history
              <textarea
                rows="3"
                value={riskForm.healthHistory}
                onChange={(event) => setRiskForm((current) => ({ ...current, healthHistory: event.target.value }))}
              />
            </label>

            <label className="form-grid__full">
              Occupation
              <input
                type="text"
                value={riskForm.occupation}
                onChange={(event) => setRiskForm((current) => ({ ...current, occupation: event.target.value }))}
              />
            </label>

            <Button disabled={isEvaluating} type="submit">
              {isEvaluating ? 'Evaluating...' : 'Run evaluation'}
            </Button>
          </form>

          {riskResult ? (
            <div className={`result-card ${riskResult.error ? 'is-danger' : 'is-success'}`}>
              {riskResult.error ? (
                <p>{riskResult.error}</p>
              ) : (
                <>
                  <p className="result-card__eyebrow">Underwriting decision</p>
                  <h3>{riskResult.decision}</h3>
                  <p>Risk score: {riskResult.riskScore}</p>
                  <p>Estimated monthly premium: {formatCurrency(riskResult.estimatedMonthlyPremium)}</p>
                  <p>Evaluation reference: {riskResult.evaluationReference}</p>
                  <p>Ruleset: {riskResult.ruleVersion}</p>
                  <p>{riskResult.manualReviewRequired ? 'An underwriter must review this application before a final outcome.' : 'This application is eligible for straight-through processing.'}</p>
                  <ul className="feature-list">
                    {riskResult.reasons?.map((reason) => <li key={reason}>{reason}</li>)}
                  </ul>
                </>
              )}
            </div>
          ) : null}
        </Panel>

        <Panel title="Automation playbooks" description="Each playbook turns raw insurance operations into a repeatable workflow.">
          <div className="stack-list">
            {data.automationPlaybooks.map((item) => (
              <article className="stack-item" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="callout-link">{item.cta}</span>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <section className="split-section">
        <Panel title="Renewal radar" description="Prioritise retention campaigns around premiums and days remaining.">
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Premium</th>
                  <th>Days left</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.renewalRadar.map((item) => (
                  <tr key={item.policyId}>
                    <td>{item.customer}</td>
                    <td>{item.planName}</td>
                    <td>{formatCurrency(item.premiumPaid)}</td>
                    <td>{item.daysRemaining}</td>
                    <td>{item.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Advisor capacity" description="A practical capacity view makes the platform feel like a real assisted-service operation.">
          <div className="stack-list">
            {data.agentCapacity.map((item) => (
              <article className="stack-item" key={item.agent}>
                <div className="stack-item__row">
                  <h3>{item.agent}</h3>
                  <StatusPill value={item.utilization} />
                </div>
                <p>{item.daysConfigured} availability days configured</p>
                <div className="meta-row">
                  <span>{item.appointments} appointments</span>
                  <span>{item.nextAvailable}</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeading
          kicker="Risk Queue"
          title="Audit-ready underwriting history"
          description="Every evaluation gets logged, which lets you tell a stronger story about governance, transparency, and explainability."
        />
        <Panel>
          <div className="stack-list">
            {data.underwritingQueue.map((item) => (
              <article className="stack-item" key={`${item.email}-${item.createdAt}`}>
                <div className="stack-item__row">
                  <h3>{item.email}</h3>
                  <StatusPill value={item.decision} />
                </div>
                <p>{item.reason}</p>
                <div className="meta-row">
                  <span>Risk score {item.riskScore}</span>
                  <span>{formatDateTime(item.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
