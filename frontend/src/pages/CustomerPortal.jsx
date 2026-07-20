import { useEffect, useState } from 'react';
import { apiGet, apiPut, getApiBase } from '../lib/api';
import { Button, EmptyState, LoadingState, MetricGrid, Panel, PageHero, SectionHeading, StatusPill, formatCurrency, formatDate, formatDateTime } from '../components/ui';

export default function CustomerPortal() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busyPolicyId, setBusyPolicyId] = useState(null);

  useEffect(() => {
    loadCustomer();
  }, []);

  async function loadCustomer() {
    try {
      const response = await apiGet('/api/experience/customer');
      setData(response);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleRenew(policyId) {
    setBusyPolicyId(policyId);
    try {
      await apiPut(`/api/policies/renew/${policyId}`);
      await loadCustomer();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyPolicyId(null);
    }
  }

  function handleDownload(policyId) {
    window.open(`${getApiBase()}/api/policies/${policyId}/download`, '_blank', 'noopener,noreferrer');
  }

  if (error && !data) {
    return <Panel title="Unable to open customer portal" description={error} />;
  }

  if (!data) {
    return <LoadingState label="Loading customer portfolio..." />;
  }

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Policyholder Experience"
        title={`${data.customer.name}'s digital insurance workspace`}
        subtitle="This page packages policy servicing, claims visibility, document downloads, appointment support, and next-best actions into one cleaner customer portal."
      >
        <Panel title="Portfolio Health Score" description="A unique InsurAI metric that turns policy quality, claims backlog, and service friction into one score.">
          <div className="score-orb">
            <strong>{data.summary.portfolioHealthScore}</strong>
            <span>out of 100</span>
          </div>
        </Panel>
      </PageHero>

      <MetricGrid items={data.heroMetrics} />

      <section className="split-section">
        <Panel title="Next best actions" description="What the customer should do first based on renewals, pending claims, and service requests.">
          <div className="stack-list">
            {data.nextActions.map((item) => (
              <article className="stack-item" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="callout-link">{item.cta}</span>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Recommendations" description="Practical portfolio advice powered by the live insurance data.">
          <ul className="feature-list">
            {data.recommendations.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section>
        <SectionHeading
          kicker="Policy Vault"
          title="Policy management with renewal and document actions"
          description="This is where the LIC-style service experience becomes more enterprise-grade through richer policy context and direct servicing actions."
        />
        <Panel>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Coverage</th>
                  <th>Premium</th>
                  <th>Renewal date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.policies.map((policy) => (
                  <tr key={policy.policyId}>
                    <td>
                      <strong>{policy.planName}</strong>
                      <span>{policy.policyNumber}</span>
                    </td>
                    <td>{formatCurrency(policy.coverageAmount)}</td>
                    <td>{formatCurrency(policy.premiumPaid)}</td>
                    <td>{formatDate(policy.endDate)}</td>
                    <td><StatusPill value={policy.status} /></td>
                    <td>
                      <div className="table-actions">
                        <Button onClick={() => handleDownload(policy.policyId)} variant="ghost" type="button">
                          Download
                        </Button>
                        <Button
                          disabled={busyPolicyId === policy.policyId}
                          onClick={() => handleRenew(policy.policyId)}
                          type="button"
                        >
                          {busyPolicyId === policy.policyId ? 'Renewing...' : 'Renew'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="split-section">
        <Panel title="Claims snapshot" description="Customers can track claim progression without leaving the servicing workspace.">
          {data.claims.length ? (
            <div className="stack-list">
              {data.claims.map((claim) => (
                <article className="stack-item" key={claim.claimId}>
                  <div className="stack-item__row">
                    <h3>{claim.planName}</h3>
                    <StatusPill value={claim.status} />
                  </div>
                  <p>{claim.reason}</p>
                  <div className="meta-row">
                    <span>{formatCurrency(claim.claimAmount)}</span>
                    <span>{formatDate(claim.incidentDate)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No claims yet" description="Once a claim is filed, it will appear here with status updates." />
          )}
        </Panel>

        <Panel title="Document vault" description="Digital fingerprints and generated policy artifacts create a stronger trust layer.">
          <div className="stack-list">
            {data.documents.map((document) => (
              <article className="stack-item" key={document.policyNumber}>
                <div className="stack-item__row">
                  <h3>{document.policyNumber}</h3>
                  <StatusPill value={document.status} />
                </div>
                <p>{document.hash}</p>
                <span>{formatDateTime(document.createdAt)}</span>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <section className="split-section">
        <Panel title="Advisor appointments" description="Hybrid service matters, especially for assisted renewals and claims support.">
          <div className="stack-list">
            {data.appointments.map((appointment) => (
              <article className="stack-item" key={appointment.appointmentId}>
                <div className="stack-item__row">
                  <h3>{appointment.advisor}</h3>
                  <StatusPill value={appointment.status} />
                </div>
                <p>{formatDate(appointment.date)} at {appointment.time}</p>
                <span>{appointment.meetingLink}</span>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Amendment queue" description="Track nominee, address, or servicing changes through a visible workflow.">
          <div className="stack-list">
            {data.amendments.map((amendment) => (
              <article className="stack-item" key={amendment.id}>
                <div className="stack-item__row">
                  <h3>{amendment.changeType}</h3>
                  <StatusPill value={amendment.status} />
                </div>
                <p>{amendment.newValue}</p>
                <span>{formatDateTime(amendment.requestedAt)}</span>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeading
          kicker="Activity Feed"
          title="Timeline-based servicing makes the product feel alive"
          description="This stitched timeline shows the system remembering everything that happened across the customer journey."
        />
        <Panel>
          <div className="timeline">
            {data.timeline.map((item, index) => (
              <article className="timeline__item" key={`${item.title}-${index}`}>
                <div className="timeline__dot" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span>{formatDateTime(item.timestamp)}</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
