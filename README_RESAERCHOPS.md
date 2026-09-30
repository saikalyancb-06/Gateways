# ResearchOps: The Autonomous Enterprise Research Agent

A full-fledged, multi-agent enterprise research system designed for **Domain 1 — Enterprise & Business Operations**. 

Unlike conventional chatbots that simply prompt an LLM for an answer, **ResearchOps** deploys a team of specialized autonomous agents that independently research a question, exchange structured messages, challenge each other's claims, verify conflicting data, and synthesize a board-ready, source-grounded intelligence report.

---

## 🏗️ Architecture & Specialized Agents

```text
                         USER QUESTION
                               |
                               v
                    +---------------------+
                    |  RESEARCH DIRECTOR  |
                    |  Scope + Planning   |
                    +----------+----------+
                               |
                  Research Plan / Task Graph
                               |
           +-------------------+-------------------+
           |                   |                   |
           v                   v                   v
   +---------------+   +---------------+   +---------------+
   | COMPETITOR    |   | MARKET        |   | CUSTOMER      |
   | RESEARCH AGENT|   | RESEARCH AGENT|   | RESEARCH AGENT|
   +-------+-------+   +-------+-------+   +-------+-------+
           |                   |                   |
           +-------------------+-------------------+
                               |
                               v
                    +---------------------+
                    |   EVIDENCE STORE    |
                    | Claims + Sources    |
                    | Context + Clusters  |
                    +----------+----------+
                               |
                               v
                    +---------------------+
                    | ADVERSARIAL AGENT   |
                    | Stress-test claims  |
                    +----------+----------+
                               |
                               v
                    +---------------------+
                    | VERIFICATION AGENT  |
                    | Re-research claims  |
                    +----------+----------+
                               |
                               v
                    +---------------------+
                    | EVIDENCE JUDGE      |
                    | Epistemic Rulings   |
                    +----------+----------+
                               |
                               v
                    +---------------------+
                    | SYNTHESIS AGENT     |
                    | Final Board Report  |
                    +---------------------+
```

### Specialized Agents:
1. **Research Director Agent:** Scopes inquiries, defines timeframes and geography, establishes research requirements, and assigns tasks.
2. **Competitor Research Agent:** Investigates players, business models, and pricing structures.
3. **Market Research Agent:** Quantifies market size, growth drivers, and adoption tailwinds.
4. **Customer Research Agent:** Dissects user personas, willingness to pay, and friction points.
5. **Regulation & Risk Agent:** Audits legal compliance (e.g., DPDP Act 2023) and operational hazards.
6. **Adversarial Challenger Agent:** Falsifies overstatements, attacks weak assumptions, and demands counter-evidence.
7. **Verification Agent:** Triangulates sources, checks dates, and updates claim status.
8. **Evidence Judge Agent:** Classifies claims into FACT, INFERENCE, and HYPOTHESIS, detecting contradictions.
9. **Synthesis Agent:** Compiles board-ready Markdown reports with verifiable citations.

---

## 🚀 Running ResearchOps

### Fast Master Launch:
Double-click:
```bat
D:\webman_researchops\start_researchops.bat
```
This automatically boots:
- **Local Ollama Model Server** (`qwen3.5:9b`)
- **FastAPI Multi-Agent Backend Server** on `http://127.0.0.1:8000`
- **React + TypeScript Frontend** on `http://127.0.0.1:5173`

---

## 💻 UI Modes & Tabs

- **Tab 1: ResearchOps Workspace:** Real-time multi-agent network graph, live agent communication event feed, and progress metrics.
- **Tab 2: Evidence Explorer:** Board-ready strategic report with an interactive claim-to-source traceability matrix.
- **Tab 3: Research Lab:** Source independence analysis and automated red-team audit.
- **Tab 4: Evidence Court (Lawyer Simulation):** Forensic courtroom debate between Prosecution, Defense, Evidence Clerk, and Presiding Judge.

---

## 🔒 Isolated Sandbox Notice
`D:\webman` was kept 100% untouched. All code, agents, and UI run strictly inside `D:\webman_researchops`.
