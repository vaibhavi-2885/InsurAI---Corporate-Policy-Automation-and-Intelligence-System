import { useState } from 'react';
import { apiPost } from '../lib/api';
import { Button, Panel, PageHero, SectionHeading } from '../components/ui';

const promptIdeas = [
  'How should we prioritize renewals this month?',
  'What is the biggest claims risk in this portfolio?',
  'How many cases need underwriting review?',
  'Where is the service backlog building up?',
];

export default function CopilotPage() {
  const [persona, setPersona] = useState('Portfolio Advisor');
  const [question, setQuestion] = useState(promptIdeas[0]);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await apiPost('/api/experience/copilot', {
        persona,
        question,
      });
      setResponse(result);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHero
        eyebrow="Contextual AI"
        title="A copilot that answers from the actual insurance portfolio instead of generic prompts"
        subtitle="The copilot turns operational portfolio data into targeted questions and next actions for insurance teams."
      >
        <Panel title="Copilot framing" description="The response is generated from live portfolio data and tuned for common insurance operations questions.">
          <div className="prompt-list">
            {promptIdeas.map((idea) => (
              <button className="prompt-chip" key={idea} onClick={() => setQuestion(idea)} type="button">
                {idea}
              </button>
            ))}
          </div>
        </Panel>
      </PageHero>

      <section className="split-section split-section--forms">
        <Panel title="Ask InsurAI Copilot" description="Switch persona and ask about renewals, claims, underwriting, or service operations." className="panel--glass">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Persona
              <select value={persona} onChange={(event) => setPersona(event.target.value)}>
                <option>Portfolio Advisor</option>
                <option>Claims Lead</option>
                <option>Operations Manager</option>
                <option>Executive Sponsor</option>
              </select>
            </label>

            <label className="form-grid__full">
              Question
              <textarea rows="5" value={question} onChange={(event) => setQuestion(event.target.value)} />
            </label>

            <Button disabled={isLoading} type="submit">
              {isLoading ? 'Thinking...' : 'Generate insight'}
            </Button>
          </form>
        </Panel>

        <Panel title="Response" description="The answer includes suggested actions and the portfolio concepts it relied on.">
          {response ? (
            <div className="copilot-response">
              <span className="eyebrow">{response.persona}</span>
              <h2>{response.answer}</h2>
              <p>Confidence score: {response.confidence}</p>

              <SectionHeading kicker="Actions" title="Recommended next steps" />
              <div className="prompt-list">
                {response.actions.map((action) => (
                  <span className="prompt-chip prompt-chip--static" key={action}>
                    {action}
                  </span>
                ))}
              </div>

              <SectionHeading kicker="References" title="What the answer used" />
              <ul className="feature-list">
                {response.references.map((reference) => (
                  <li key={reference}>{reference}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="muted-copy">Ask a question to see portfolio-aware AI guidance.</p>
          )}
        </Panel>
      </section>
    </div>
  );
}
