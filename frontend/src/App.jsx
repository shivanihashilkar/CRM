import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  extractInteractionFromChat,
  fetchInteractions,
  clearEditing,
  loadInteractionForEdit,
  requestAiAssist,
  saveInteraction,
  setAssistantPrompt,
  toggleArrayItem,
  updateInteraction,
  updateField,
} from "./features/hcpInteractionSlice";
import "./App.css";

const materialOptions = [
  "Product efficacy brochure",
  "Patient support program",
  "Clinical study reprint",
  "Dosing guide",
];

const sampleOptions = ["Starter sample", "Demo device", "Patient leaflet"];

function App() {
  const dispatch = useDispatch();
  const { ai, assistantPrompt, editingInteractionId, form, interactions, isLoading, status } = useSelector(
    (state) => state.hcpInteraction
  );

  const notePreview = useMemo(
    () =>
      [
        form.hcp_name,
        form.interaction_type,
        form.topics_discussed,
        form.outcomes,
        form.follow_up_actions,
      ]
        .filter(Boolean)
        .join(" | "),
    [form]
  );

  useEffect(() => {
    dispatch(fetchInteractions());
  }, [dispatch]);

  const onUpdateField = (field, value) => {
    dispatch(updateField({ field, value }));
  };

  const onToggleArrayItem = (field, value) => {
    dispatch(toggleArrayItem({ field, value }));
  };

  const onAiAssist = () => {
    dispatch(requestAiAssist(form));
  };

  const onSaveInteraction = async () => {
    const action = editingInteractionId
      ? updateInteraction({ id: editingInteractionId, form })
      : saveInteraction(form);
    const result = await dispatch(action);
    if (saveInteraction.fulfilled.match(result) || updateInteraction.fulfilled.match(result)) {
      dispatch(fetchInteractions());
    }
  };

  const onAssistantSubmit = () => {
    const message = assistantPrompt.trim();
    if (!message) return;
    dispatch(extractInteractionFromChat({ message, form }));
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">AI-First CRM</p>
          <h1>Log HCP Interaction</h1>
        </div>
        <button className="secondary-button" onClick={() => dispatch(fetchInteractions())}>
          Refresh
        </button>
      </header>

      <section className="workspace">
        <form className="interaction-panel" onSubmit={(event) => event.preventDefault()}>
          <div className="section-heading">
            <div>
              <h2>{editingInteractionId ? "Edit Interaction" : "Interaction Details"}</h2>
              {editingInteractionId && <p className="edit-context">Updating saved log #{editingInteractionId}</p>}
            </div>
            <span>{form.sentiment}</span>
          </div>

          <div className="form-grid">
            <label>
              HCP Name
              <select value={form.hcp_name} onChange={(e) => onUpdateField("hcp_name", e.target.value)}>
                <option>Dr. Meera Shah</option>
                <option>Dr. Arjun Rao</option>
                <option>Dr. Kavita Iyer</option>
                <option>Dr. R. Srinivasan</option>
              </select>
            </label>

            <label>
              Interaction Type
              <select
                value={form.interaction_type}
                onChange={(e) => onUpdateField("interaction_type", e.target.value)}
              >
                <option>Meeting</option>
                <option>Call</option>
                <option>Email</option>
                <option>Conference</option>
              </select>
            </label>

            <label>
              Date
              <input type="date" value={form.date} onChange={(e) => onUpdateField("date", e.target.value)} />
            </label>

            <label>
              Time
              <input type="time" value={form.time} onChange={(e) => onUpdateField("time", e.target.value)} />
            </label>
          </div>

          <label>
            Attendees
            <input
              value={form.attendees}
              onChange={(e) => onUpdateField("attendees", e.target.value)}
              placeholder="Enter names or search..."
            />
          </label>

          <label>
            Topics Discussed
            <textarea
              value={form.topics_discussed}
              onChange={(e) => onUpdateField("topics_discussed", e.target.value)}
              placeholder="Enter key discussion points..."
            />
          </label>

          <button className="inline-action" type="button" onClick={onAiAssist} disabled={isLoading}>
            Summarize from Voice Note
          </button>

          <div className="choice-group">
            <div className="choice-title">Materials Shared</div>
            <div className="chips">
              {materialOptions.map((item) => (
                <button
                  className={form.materials_shared.includes(item) ? "chip active" : "chip"}
                  key={item}
                  onClick={() => onToggleArrayItem("materials_shared", item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="choice-group">
            <div className="choice-title">Samples Distributed</div>
            <div className="chips">
              {sampleOptions.map((item) => (
                <button
                  className={form.samples_distributed.includes(item) ? "chip active" : "chip"}
                  key={item}
                  onClick={() => onToggleArrayItem("samples_distributed", item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="sentiment-row">
            <span>Observed HCP Sentiment</span>
            {["Positive", "Neutral", "Negative"].map((sentiment) => (
              <label className="radio-label" key={sentiment}>
                <input
                  checked={form.sentiment === sentiment}
                  name="sentiment"
                  onChange={() => onUpdateField("sentiment", sentiment)}
                  type="radio"
                />
                {sentiment}
              </label>
            ))}
          </div>

          <label>
            Outcomes
            <textarea
              value={form.outcomes}
              onChange={(e) => onUpdateField("outcomes", e.target.value)}
              placeholder="Key outcomes or agreements..."
            />
          </label>

          <label>
            Follow-up Actions
            <textarea
              value={form.follow_up_actions}
              onChange={(e) => onUpdateField("follow_up_actions", e.target.value)}
              placeholder="Enter next steps or tasks..."
            />
          </label>

          <div className="suggestions">
            <h3>AI Suggested Follow-ups</h3>
            {(ai?.follow_ups || ["Schedule follow-up meeting in 2 weeks", "Send clinical brochure"]).map((item) => (
              <button
                key={item}
                onClick={() => onUpdateField("follow_up_actions", item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="form-actions">
            {editingInteractionId && (
              <button className="secondary-button" type="button" onClick={() => dispatch(clearEditing())}>
                Cancel Edit
              </button>
            )}
            <button className="secondary-button" type="button" onClick={onAiAssist} disabled={isLoading}>
              AI Assist
            </button>
            <button className="primary-button" type="button" onClick={onSaveInteraction} disabled={isLoading}>
              {editingInteractionId ? "Update Interaction" : "Log Interaction"}
            </button>
          </div>
        </form>

        <aside className="assistant-panel">
          <div className="assistant-card">
            <div className="assistant-title">
              <span className="assistant-icon">AI</span>
              <div>
                <h2>AI Assistant</h2>
                <p>Log interaction via chat</p>
              </div>
            </div>

            <div className="prompt-box">
              Met Dr. Shah today at 3 PM with Sales rep, discussed efficacy brochure and patient support. She requested study data. Follow up in 2 weeks.
            </div>

            <div className="ai-output">
              <h3>Summary</h3>
              <p>{ai?.summary || "AI summary will appear here after you request assistance."}</p>

              <h3>Next Best Action</h3>
              <p>{ai?.next_best_action || "Prepare a clear next step before logging."}</p>

              <h3>Current Note</h3>
              <p>{notePreview || "Start entering interaction details."}</p>
            </div>

            <div className="assistant-input">
              <textarea
                value={assistantPrompt}
                onChange={(e) => dispatch(setAssistantPrompt(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onAssistantSubmit();
                }}
                placeholder="Type or paste the interaction note..."
              />
              <button type="button" onClick={onAssistantSubmit} disabled={isLoading}>
                Fill Form
              </button>
            </div>
          </div>

          <div className="recent-panel">
            <h2>Recent Logs</h2>
            {interactions.length === 0 ? (
              <p className="empty-state">No saved interactions yet.</p>
            ) : (
              interactions.slice(0, 4).map((interaction) => (
                <article className="recent-item" key={interaction.id}>
                  <div className="recent-item-header">
                    <strong>{interaction.hcp_name}</strong>
                    <button type="button" onClick={() => dispatch(loadInteractionForEdit(interaction))}>
                      Edit
                    </button>
                  </div>
                  <span>{interaction.interaction_type} | {interaction.date}</span>
                  <p>{interaction.ai_summary || interaction.topics_discussed}</p>
                </article>
              ))
            )}
          </div>
        </aside>
      </section>

      {status && <div className="status-bar">{status}</div>}
    </main>
  );
}

export default App;
