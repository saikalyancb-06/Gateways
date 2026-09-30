"""
FastAPI Server for ResearchOps Multi-Agent Research System.
Provides REST and WebSocket endpoints for:
- Research Session lifecycle (/api/research/start, /api/research/{id})
- Live Agent event stream via WebSockets (/ws/research/{session_id})
- Graph data, claims, sources, challenges, hypotheses
- Research Court / Lawyer Simulation (/api/court/run)
- Preloaded instant demo scenarios
"""

import os
import json
import asyncio
from typing import Dict, Any, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from researchops_core.backend.models.schemas import ResearchSession, CourtSimulation
from researchops_core.backend.orchestration.orchestrator import ResearchOrchestrator
from researchops_core.backend.court.simulator import CourtSimulator
from researchops_core.backend.demo.scenarios import PRELOADED_SCENARIOS

app = FastAPI(title="ResearchOps Autonomous Agent API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active sessions and orchestrators
ACTIVE_SESSIONS: Dict[str, ResearchSession] = {}
ACTIVE_ORCHESTRATORS: Dict[str, ResearchOrchestrator] = {}
ACTIVE_SOCKETS: Dict[str, List[WebSocket]] = {}

class StartResearchRequest(BaseModel):
    question: str
    scope: str = "Market & Technology Landscape"
    geography: str = "India"
    time_range: str = "2024 - 2026"
    research_depth: str = "Comprehensive (Multi-Agent Argued)"
    mode: str = "LIVE" # LIVE or DEMO

class RunCourtRequest(BaseModel):
    claim_id: str
    claim_text: str
    supporting_points: List[str] = []
    contradicting_points: List[str] = []
    mode: str = "DEMO"

@app.get("/api/health")
def health():
    return {"status": "ok", "app": "ResearchOps Autonomous Research Agent"}

@app.get("/api/scenarios")
def get_preloaded_scenarios():
    return list(PRELOADED_SCENARIOS.values())

@app.post("/api/research/start")
async def start_research(req: StartResearchRequest):
    session = ResearchSession(
        question=req.question,
        scope=req.scope,
        geography=req.geography,
        time_range=req.time_range,
        research_depth=req.research_depth,
        mode=req.mode
    )
    ACTIVE_SESSIONS[session.id] = session
    
    # Event broadcast handler
    def broadcast_event(evt: Dict[str, Any]):
        sockets = ACTIVE_SOCKETS.get(session.id, [])
        for ws in sockets:
            asyncio.create_task(ws.send_text(json.dumps(evt)))
            
    orch = ResearchOrchestrator(session, event_emitter=broadcast_event)
    ACTIVE_ORCHESTRATORS[session.id] = orch
    
    # Launch in background task
    asyncio.create_task(orch.run_pipeline())
    
    return {
        "session_id": session.id,
        "status": "INITIALIZED",
        "question": session.question,
        "mode": session.mode
    }

@app.get("/api/research/{session_id}")
def get_session(session_id: str):
    orch = ACTIVE_ORCHESTRATORS.get(session_id)
    if not orch:
        # Check preloaded
        for sc in PRELOADED_SCENARIOS.values():
            if sc["id"] == session_id:
                return sc
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {
        "session": orch.session.dict(),
        "plan": orch.research_plan,
        "agents": [a.info.dict() for a in orch.agents_map.values()],
        "tasks": [t.dict() for t in orch.tasks.values()],
        "claims_count": len(orch.evidence_store.claims),
        "sources_count": len(orch.evidence_store.sources),
        "challenges_count": len(orch.evidence_store.challenges),
        "report": orch.final_report
    }

@app.get("/api/research/{session_id}/messages")
def get_messages(session_id: str):
    orch = ACTIVE_ORCHESTRATORS.get(session_id)
    if not orch:
        return []
    return [m.dict() for m in orch.messages]

@app.get("/api/research/{session_id}/graph")
def get_graph(session_id: str):
    orch = ACTIVE_ORCHESTRATORS.get(session_id)
    if not orch:
        return {"nodes": [], "edges": []}
    return orch.evidence_store.get_graph_data()

@app.get("/api/research/{session_id}/claims")
def get_claims(session_id: str):
    orch = ACTIVE_ORCHESTRATORS.get(session_id)
    if not orch:
        return []
    return [c.dict() for c in orch.evidence_store.claims.values()]

@app.get("/api/research/{session_id}/sources")
def get_sources(session_id: str):
    orch = ACTIVE_ORCHESTRATORS.get(session_id)
    if not orch:
        return []
    return [s.dict() for s in orch.evidence_store.sources.values()]

@app.get("/api/research/{session_id}/audit")
def get_audit(session_id: str):
    orch = ACTIVE_ORCHESTRATORS.get(session_id)
    if not orch:
        return {}
    return {
        "independence": orch.evidence_store.get_source_independence_report(),
        "contradictions": orch.evidence_store.detect_contradictions(),
        "hypotheses": [h.dict() for h in orch.hypotheses]
    }

class RunAutopsyRequest(BaseModel):
    question: str = ""
    claims: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    agents: List[Dict[str, Any]] = []
    messages: List[Dict[str, Any]] = []
    final_report: str = ""
    mode: str = "FULL AUTOPSY"
    version: str = "AUTOPSY-001"

@app.post("/api/autopsy/run")
def run_autopsy(req: RunAutopsyRequest):
    from researchops_core.backend.autopsy.orchestrator import AutopsyOrchestrator
    orchestrator = AutopsyOrchestrator(mode=req.mode, version=req.version)
    result = orchestrator.run_autopsy(
        question=req.question,
        claims=req.claims,
        sources=req.sources,
        agents=req.agents,
        messages=req.messages,
        final_report=req.final_report
    )
    return result

class PlannerRequest(BaseModel):
    question: str = ""
    claims: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    agents: List[Dict[str, Any]] = []
    mode: str = "AUTONOMOUS"
    current_round: int = 2
    action: str = "INITIALIZE"

@app.post("/api/planner/state")
def get_planner_state(req: PlannerRequest):
    from researchops_core.backend.planner.engine import ResearchPlannerEngine
    engine = ResearchPlannerEngine(mode=req.mode)
    return engine.generate_plan(
        question=req.question,
        claims=req.claims,
        sources=req.sources,
        agents=req.agents,
        current_round=req.current_round,
        action=req.action
    )

class MemoryStateRequest(BaseModel):
    question: str = ""

@app.post("/api/memory/state")
def get_memory_state(req: MemoryStateRequest = MemoryStateRequest()):
    from researchops_core.backend.memory.engine import ResearchMemoryEngine
    q = req.question if req else ""
    return ResearchMemoryEngine().get_memory_state(current_question=q)

@app.post("/api/court/run")
def run_court(req: RunCourtRequest):
    sim = CourtSimulator(mode=req.mode)
    court_res = sim.run_court_session(
        claim_text=req.claim_text,
        claim_id=req.claim_id,
        supporting_evidence=req.supporting_points,
        contradicting_evidence=req.contradicting_points
    )
    return court_res.dict()

@app.websocket("/ws/research/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    if session_id not in ACTIVE_SOCKETS:
        ACTIVE_SOCKETS[session_id] = []
    ACTIVE_SOCKETS[session_id].append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # client ping/ack
    except WebSocketDisconnect:
        ACTIVE_SOCKETS[session_id].remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
