import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPostForm, apiPut } from '../lib/api';
import { Button, LoadingState, MetricGrid, Panel, PageHero, SectionHeading, StatusPill, formatCurrency, formatDate } from '../components/ui';

const initialClaimForm = {
  policyId: '',
  incidentDate: '',
  reason: '',
  claimAmount: '',
};

export default function ClaimsStudio() {
  const [data, setData] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');
  const [claimForm, setClaimForm] = useState(initialClaimForm);
  const [inspectionForm, setInspectionForm] = useState({
    file: null,
    description: '',
  });
  const [inspectionResult, setInspectionResult] = useState(null);
  const [busyClaimId, setBusyClaimId] = useState(null);

  useEffect(() => {
    Promise.all([apiGet('/api/experience/claims'), apiGet('/api/experience/customer')])
      .then(([claimsResponse, customerResponse]) => {
        setData(claimsResponse);
        setCustomer(customerResponse);
        if (customerResponse.policies?.length) {
          setClaimForm((current) => ({
            ...current,
            policyId: String(customerResponse.policies[0].policyId),
          }));
        }
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  async function refreshClaims() {
    const response = await apiGet('/api/experience/claims');
    setData(response);
  }

  async function handleClaimSubmit(event) {
    event.preventDefault();

    try {
      await apiPost('/api/claims/file', {
        policyId: Number(claimForm.policyId),
        incidentDate: claimForm.incidentDate,
        reason: claimForm.reason,
        claimAmount: Number(claimForm.claimAmount),
      });

      setClaimForm((current) => ({
        ...initialClaimForm,
        policyId: current.policyId,
      }));
      await refreshClaims();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleStatusUpdate(claimId, status) {
    setBusyClaimId(claimId);

    try {
      await apiPut(`/api/claims/${claimId}/status`, status);
      await refreshClaims();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyClaimId(null);
    }
  }

  async function handleInspectionSubmit(event) {
    event.preventDefault();

    if (!inspectionForm.file) {
      setInspectionResult({ error: 'Please choose a file to inspect.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', inspectionForm.file);
    formData.append('description', inspectionForm.description);

    try {
      const response = await apiPostForm('/api/v1/claims/inspect', formData);
      setInspectionResult(response);
      await refreshClaims();
    } catch (requestError) {
      setInspectionResult({ error: requestError.message });
    }
  }

  if (error && !data) {
    return <Panel title="Unable to open claims studio" description={error} />;
  }

  if (!data || !customer) {
    return <LoadingState label="Loading claims studio..." />;
  }

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Claims Operations"
        title="A claims workspace with intake, triage, and AI-assisted evidence review"
        subtitle="This part of the product goes beyond standard insurance CRUD by combining first notice, analyst decisions, and automated inspection signals."
      >
        <Panel title="Why this matters" description="Claims is where insurance experience becomes real. Strong claim operations make the whole platform more believable.">
          <ul className="feature-list">
            {data.playbooks.map((item) => (
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
        <Panel title="File a claim" description="Create a first notice of loss directly from an active customer policy." className="panel--glass">
          <form className="form-grid" onSubmit={handleClaimSubmit}>
            <label>
              Policy
              <select
                value={claimForm.policyId}
                onChange={(event) => setClaimForm((current) => ({ ...current, policyId: event.target.value }))}
              >
                {customer.policies.map((policy) => (
                  <option key={policy.policyId} value={policy.policyId}>
                    {policy.planName} ({policy.policyNumber})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Incident date
              <input
                type="date"
                value={claimForm.incidentDate}
                onChange={(event) => setClaimForm((current) => ({ ...current, incidentDate: event.target.value }))}
              />
            </label>

            <label className="form-grid__full">
              Reason
              <textarea
                rows="3"
                value={claimForm.reason}
                onChange={(event) => setClaimForm((current) => ({ ...current, reason: event.target.value }))}
              />
            </label>

            <label>
              Claim amount
              <input
                type="number"
                value={claimForm.claimAmount}
                onChange={(event) => setClaimForm((current) => ({ ...current, claimAmount: event.target.value }))}
              />
            </label>

            <Button type="submit">Submit claim</Button>
          </form>
        </Panel>

        <Panel title="Claim Vision" description="Upload claim evidence and a description for automated inspection support." className="panel--glass">
          <form className="form-grid" onSubmit={handleInspectionSubmit}>
            <label className="form-grid__full">
              Evidence file
              <input
                type="file"
                onChange={(event) => setInspectionForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
              />
            </label>

            <label className="form-grid__full">
              Description
              <textarea
                rows="3"
                value={inspectionForm.description}
                onChange={(event) => setInspectionForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>

            <Button type="submit" variant="secondary">Inspect evidence</Button>
          </form>

          {inspectionResult ? (
            <div className={`result-card ${inspectionResult.error ? 'is-danger' : 'is-success'}`}>
              {inspectionResult.error ? (
                <p>{inspectionResult.error}</p>
              ) : (
                <>
                  <p className="result-card__eyebrow">{inspectionResult.claimNumber}</p>
                  <h3>{inspectionResult.aiStatus}</h3>
                  <p>{inspectionResult.message}</p>
                  <p>Confidence: {inspectionResult.confidence}</p>
                </>
              )}
            </div>
          ) : null}
        </Panel>
      </section>

      <section>
        <SectionHeading
          kicker="Claims Board"
          title="Analyst-friendly claims review"
          description="This board supports both customer-facing visibility and internal operational decisioning."
        />
        <Panel>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Incident</th>
                  <th>Status</th>
                  <th>SLA</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {data.claimsBoard.map((claim) => (
                  <tr key={claim.claimId}>
                    <td>{claim.customer}</td>
                    <td>{claim.planName}</td>
                    <td>{formatCurrency(claim.claimAmount)}</td>
                    <td>{formatDate(claim.incidentDate)}</td>
                    <td><StatusPill value={claim.status} /></td>
                    <td>{claim.sla}</td>
                    <td>
                      <div className="table-actions">
                        <Button
                          disabled={busyClaimId === claim.claimId}
                          onClick={() => handleStatusUpdate(claim.claimId, 'APPROVED')}
                          type="button"
                          variant="secondary"
                        >
                          Approve
                        </Button>
                        <Button
                          disabled={busyClaimId === claim.claimId}
                          onClick={() => handleStatusUpdate(claim.claimId, 'REJECTED')}
                          type="button"
                          variant="ghost"
                        >
                          Reject
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

      <section>
        <SectionHeading
          kicker="Inspection Signals"
          title="Evidence review outputs"
          description="Inspection results are recorded against the claim workflow for analyst review."
        />
        <div className="card-grid card-grid--two">
          {data.inspectionSignals.map((item) => (
            <Panel key={item.claimNumber} title={item.claimNumber} description={item.description}>
              <div className="meta-row">
                <StatusPill value={item.assessment} />
                <span>{item.confidence}% confidence</span>
              </div>
              <p className="plan-card__coverage">{formatCurrency(item.estimatedPayout)} estimated payout</p>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  );
}
