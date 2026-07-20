import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '../lib/api';
import { Button, LoadingState, MetricGrid, Panel, PageHero, SectionHeading, StatusPill } from '../components/ui';

export default function ControlTower() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busyGrievanceId, setBusyGrievanceId] = useState(null);

  useEffect(() => {
    loadTower();
  }, []);

  async function loadTower() {
    try {
      const response = await apiGet('/api/experience/control-tower');
      setData(response);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function resolveGrievance(grievanceId) {
    setBusyGrievanceId(grievanceId);
    try {
      await apiPut(`/api/grievances/${grievanceId}/status`, 'RESOLVED');
      await loadTower();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyGrievanceId(null);
    }
  }

  if (error && !data) {
    return <Panel title="Unable to open control tower" description={error} />;
  }

  if (!data) {
    return <LoadingState label="Loading executive control tower..." />;
  }

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Executive Visibility"
        title="Board-ready metrics for portfolio health, product mix, and service governance"
        subtitle="The control tower gives operational leaders a single view of portfolio health, service risk, and intervention priorities."
      >
        <Panel title="Leadership focus" description="This layer is meant for management reviews, operational intervention, and service governance.">
          <ul className="feature-list">
            {data.complianceAlerts.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </PageHero>

      <MetricGrid items={data.heroMetrics} />

      <section className="split-section">
        <Panel title="Product mix" description="A simple but effective way to show portfolio composition by category.">
          <div className="stack-list">
            {data.productMix.map((item) => (
              <article className="stack-item" key={`${item.category}-${item.planName}`}>
                <div className="stack-item__row">
                  <h3>{item.category}</h3>
                  <span className="table-count">{item.count}</span>
                </div>
                <p>{item.planName}</p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Branch and desk network" description="Service feels more realistic when the platform has an operating footprint.">
          <div className="stack-list">
            {data.branchNetwork.map((branch) => (
              <article className="stack-item" key={branch.name}>
                <h3>{branch.name}</h3>
                <p>{branch.focus}</p>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeading
          kicker="Service Governance"
          title="Grievance queue with closure actions"
          description="This gives the project a customer-service operations angle, not just policy administration."
        />
        <Panel>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.grievanceQueue.map((item) => (
                  <tr key={item.id}>
                    <td>{item.customer}</td>
                    <td>{item.type}</td>
                    <td><StatusPill value={item.priority} /></td>
                    <td><StatusPill value={item.status} /></td>
                    <td>{item.description}</td>
                    <td>
                      <Button
                        disabled={busyGrievanceId === item.id}
                        onClick={() => resolveGrievance(item.id)}
                        type="button"
                        variant="secondary"
                      >
                        {busyGrievanceId === item.id ? 'Updating...' : 'Mark resolved'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </div>
  );
}
