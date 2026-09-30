"""
Stateful Multi-Agent Orchestrator for ResearchOps.
Coordinates the entire lifecycle:
1. Director Plans & Breaks into Tasks
2. Parallel Execution by Domain Specialists
3. Evidence & Claims Recording
4. Adversarial Challenger Attacks
5. Verification Agent Investigates & Adjudicates
6. Judge Rates Epistemic Strength
7. Synthesis Agent Compiles Board-Ready Report
8. Dispatches structured realtime events for UI streaming.
"""

import asyncio
import time
from typing import List, Dict, Any, Callable, Optional

from researchops_core.backend.models.schemas import (
    ResearchSession, ResearchTask, TaskStatus, AgentStatus, MessageType, AgentMessage,
    ClaimStatus, ClaimType, Claim, Source, Evidence, Challenge, Hypothesis
)
from researchops_core.backend.evidence.store import EvidenceStore
from researchops_core.backend.search.provider import UnifiedSearchService
from researchops_core.backend.agents.specialists import (
    ResearchDirectorAgent, SpecialistDomainAgent, AdversarialChallengerAgent,
    VerificationAgent, EvidenceJudgeAgent, SynthesisReportAgent
)

class ResearchOrchestrator:
    def __init__(self, session: ResearchSession, event_emitter: Optional[Callable[[Dict[str, Any]], None]] = None):
        self.session = session
        self.event_emitter = event_emitter or (lambda event: None)
        self.evidence_store = EvidenceStore()
        self.search_service = UnifiedSearchService(mode=session.mode)
        
        # Instantiate Agents
        self.director = ResearchDirectorAgent()
        self.competitor_agent = SpecialistDomainAgent("competitor_agent", "Competitor Agent", "Competitor & Pricing Analysis", "Competitors and pricing")
        self.market_agent = SpecialistDomainAgent("market_agent", "Market Agent", "Market Sizing & Growth Drivers", "Market trends and size")
        self.customer_agent = SpecialistDomainAgent("customer_agent", "Customer Agent", "User Persona & Adoption", "Customer sentiment and friction")
        self.regulation_agent = SpecialistDomainAgent("regulation_agent", "Regulation Agent", "Regulatory & Risk Compliance", "Regulations and operational risks")
        self.challenger = AdversarialChallengerAgent()
        self.verifier = VerificationAgent()
        self.judge = EvidenceJudgeAgent()
        self.synthesis_agent = SynthesisReportAgent()
        
        self.agents_map = {
            "director": self.director,
            "competitor_agent": self.competitor_agent,
            "market_agent": self.market_agent,
            "customer_agent": self.customer_agent,
            "regulation_agent": self.regulation_agent,
            "adversarial": self.challenger,
            "verification": self.verifier,
            "judge": self.judge,
            "synthesis": self.synthesis_agent
        }
        
        self.tasks: Dict[str, ResearchTask] = {}
        self.messages: List[AgentMessage] = []
        self.hypotheses: List[Hypothesis] = []
        self.final_report: str = ""
        self.research_plan: Dict[str, Any] = {}

    def log_message(self, sender: str, recipient: str, msg_type: MessageType, summary: str, content: str = "", related_claim: str = None, related_source: str = None):
        msg = AgentMessage(
            session_id=self.session.id,
            sender=sender,
            recipient=recipient,
            type=msg_type,
            summary=summary,
            content=content,
            related_claim=related_claim,
            related_source=related_source
        )
        self.messages.append(msg)
        self.event_emitter({
            "event": "agent_message",
            "message": msg.dict()
        })
        return msg

    def update_agent_status(self, agent_id: str, status: AgentStatus, current_task: Optional[str] = None):
        if agent_id in self.agents_map:
            ag = self.agents_map[agent_id]
            ag.set_status(status, current_task)
            self.event_emitter({
                "event": "agent_status_changed",
                "agent_id": agent_id,
                "status": status.value,
                "current_task": current_task
            })

    async def run_pipeline(self):
        """
        Executes the full multi-agent research and argumentation workflow.
        """
        self.session.status = "RUNNING"
        self.event_emitter({"event": "session_state", "status": "RUNNING"})
        
        # ----------------------------------------------------------------------
        # STAGE 1: Research Director Scoping & Planning
        # ----------------------------------------------------------------------
        self.update_agent_status("director", AgentStatus.THINKING, "Scoping and problem decomposition")
        self.log_message("user", "director", MessageType.QUESTION, f"Inquiry submitted: {self.session.question}")
        
        await asyncio.sleep(0.6)
        plan = self.director.plan_research(self.session.question, mode=self.session.mode)
        self.research_plan = plan
        
        # Record Hypotheses
        for h in plan.get("hypotheses", []):
            hyp = Hypothesis(
                session_id=self.session.id,
                statement=h.get("statement", ""),
                notes=h.get("notes", "")
            )
            self.hypotheses.append(hyp)
            self.log_message("director", "all_agents", MessageType.HYPOTHESIS_CREATED, f"Formulated hypothesis: {hyp.statement[:70]}...")
            
        # Create Tasks
        created_task_objs = []
        for t_data in plan.get("tasks", []):
            task = ResearchTask(
                session_id=self.session.id,
                agent_id=t_data["agent_id"],
                title=t_data["title"],
                description=t_data["description"],
                dependencies=t_data.get("dependencies", []),
                completion_condition=t_data.get("completion_condition", "Evidence gathered")
            )
            self.tasks[task.id] = task
            created_task_objs.append((task, t_data.get("search_queries", [])))
            self.log_message(
                "director", task.agent_id, MessageType.TASK_ASSIGNED,
                f"Assigned task: {task.title}", content=task.description
            )
            
        self.update_agent_status("director", AgentStatus.WAITING, "Supervising research execution")
        await asyncio.sleep(0.5)

        # ----------------------------------------------------------------------
        # STAGE 2: Parallel Domain Research & Evidence Gathering
        # ----------------------------------------------------------------------
        for task, queries in created_task_objs:
            agent_id = task.agent_id
            self.update_agent_status(agent_id, AgentStatus.RESEARCHING, task.title)
            task.status = TaskStatus.RUNNING
            self.log_message(agent_id, "director", MessageType.TASK_STARTED, f"Commenced research: {task.title}")
            
            # Execute searches across specialized angles
            all_results = []
            for q in queries[:3]:
                results = self.search_service.query(q, max_results=4)
                all_results.extend(results)
                
            # Register sources in EvidenceStore
            for res in all_results:
                src = self.evidence_store.add_source(
                    url=res["url"],
                    title=res["title"],
                    publisher=res.get("publisher", "Web"),
                    raw_snippet=res.get("snippet", ""),
                    independence_group=res.get("independence_group", "General")
                )
                self.agents_map[agent_id].info.source_count += 1
                self.log_message(
                    agent_id, "evidence_store", MessageType.SOURCE_FOUND,
                    f"Archived source: {src.title[:55]}...", related_source=src.id
                )
                
            # Extract structured claims
            specialist = self.agents_map[agent_id]
            extracted_claims = specialist.extract_claims(task, all_results)
            
            for c_info in extracted_claims:
                claim = self.evidence_store.add_claim(
                    session_id=self.session.id,
                    text=c_info.get("claim_text", ""),
                    created_by=agent_id,
                    claim_type=ClaimType.FACT if c_info.get("claim_type") == "FACT" else ClaimType.INFERENCE,
                    confidence=c_info.get("confidence", 0.85)
                )
                specialist.info.claim_count += 1
                
                # Link source evidence
                matching_src = next((s for s in self.evidence_store.sources.values() if s.url == c_info.get("source_url")), None)
                if matching_src:
                    self.evidence_store.link_evidence(claim.id, matching_src.id, "SUPPORTS", c_info.get("excerpt", ""))
                    
                self.log_message(
                    agent_id, "evidence_store", MessageType.CLAIM_FOUND,
                    f"Extracted claim: {claim.text[:65]}...", related_claim=claim.id
                )
                
            task.status = TaskStatus.COMPLETED
            task.completed_at = time.strftime("%H:%M:%S")
            self.update_agent_status(agent_id, AgentStatus.COMPLETED, "Findings filed")
            self.log_message(agent_id, "director", MessageType.TASK_COMPLETED, f"Task completed: {task.title}")
            await asyncio.sleep(0.3)

        # ----------------------------------------------------------------------
        # STAGE 3: Adversarial Challenge & Falsification
        # ----------------------------------------------------------------------
        self.session.status = "ARGUING"
        self.event_emitter({"event": "session_state", "status": "ARGUING"})
        self.update_agent_status("adversarial", AgentStatus.CHALLENGING, "Auditing claims for weaknesses and bias")
        
        all_claims = list(self.evidence_store.claims.values())
        challenges = self.challenger.challenge_claims(all_claims[:6], self.evidence_store.sources)
        
        for ch_data in challenges:
            chl = self.evidence_store.add_challenge(
                claim_id=ch_data["claim_id"],
                challenger_agent="adversarial",
                argument=ch_data["argument"],
                severity=ch_data["severity"],
                requested_action=ch_data["requested_action"]
            )
            self.challenger.info.challenge_count += 1
            claim_target = self.evidence_store.claims.get(ch_data["claim_id"])
            target_agent = claim_target.created_by if claim_target else "all_agents"
            
            self.log_message(
                "adversarial", target_agent, MessageType.CHALLENGE,
                f"Challenged Claim: {ch_data['argument'][:70]}...",
                content=f"Full Argument: {ch_data['argument']}\nRequested Action: {ch_data['requested_action']}",
                related_claim=ch_data["claim_id"]
            )
            await asyncio.sleep(0.4)
            
        self.update_agent_status("adversarial", AgentStatus.WAITING, "Awaiting verification outcomes")

        # ----------------------------------------------------------------------
        # STAGE 4: Verification & Triangulation
        # ----------------------------------------------------------------------
        self.session.status = "VERIFYING"
        self.event_emitter({"event": "session_state", "status": "VERIFYING"})
        self.update_agent_status("verification", AgentStatus.VERIFYING, "Investigating challenged evidence")
        
        for ch_data in challenges:
            claim = self.evidence_store.claims.get(ch_data["claim_id"])
            if not claim:
                continue
                
            self.log_message(
                "adversarial", "verification", MessageType.VERIFICATION_REQUEST,
                f"Requested verification for claim #{claim.id[-4:]}", related_claim=claim.id
            )
            
            ver_result = self.verifier.verify_challenge(claim, ch_data, self.search_service)
            
            # Map string to ClaimStatus
            status_map = {
                "SUPPORTED": ClaimStatus.SUPPORTED,
                "PARTIALLY_SUPPORTED": ClaimStatus.PARTIALLY_SUPPORTED,
                "CONTRADICTED": ClaimStatus.CONTRADICTED,
                "OUTDATED": ClaimStatus.OUTDATED,
                "INSUFFICIENT_EVIDENCE": ClaimStatus.INSUFFICIENT_EVIDENCE
            }
            res_status = status_map.get(ver_result.get("status", "PARTIALLY_SUPPORTED"), ClaimStatus.PARTIALLY_SUPPORTED)
            
            # Record follow up source if available
            fu_src = ver_result.get("follow_up_source")
            if fu_src and isinstance(fu_src, dict):
                src_added = self.evidence_store.add_source(
                    url=fu_src.get("url", "https://verified-industry.org"),
                    title=fu_src.get("title", "Secondary Benchmark Audit"),
                    publisher=fu_src.get("publisher", "Audit Org"),
                    raw_snippet=fu_src.get("snippet", ""),
                    independence_group="verification_third_party"
                )
                self.evidence_store.link_evidence(
                    claim.id, src_added.id,
                    "SUPPORTS" if res_status == ClaimStatus.SUPPORTED else "CONTRADICTS",
                    fu_src.get("snippet", "")
                )
                
            self.evidence_store.verify_claim(
                claim_id=claim.id,
                resolution_status=res_status,
                verification_notes=ver_result.get("notes", ""),
                confidence=ver_result.get("confidence", 0.85)
            )
            
            self.log_message(
                "verification", "adversarial", MessageType.VERIFICATION_RESULT,
                f"Verdict for claim #{claim.id[-4:]}: {res_status.value}",
                content=ver_result.get("notes", ""),
                related_claim=claim.id
            )
            await asyncio.sleep(0.4)
            
        self.update_agent_status("verification", AgentStatus.COMPLETED, "Verification completed")

        # ----------------------------------------------------------------------
        # STAGE 5: Contradiction Engine & Judicial Adjudication
        # ----------------------------------------------------------------------
        self.update_agent_status("judge", AgentStatus.ANALYZING, "Evaluating epistemic certainty and contradictions")
        contradictions = self.evidence_store.detect_contradictions()
        for conf in contradictions:
            self.log_message(
                "evidence_store", "judge", MessageType.CONFLICT_DETECTED,
                f"Contradiction identified on claim #{conf['claim_id'][-4:]}",
                content=f"Supporting: {len(conf['supporting_sources'])} | Contradicting: {len(conf['contradicting_sources'])}"
            )
            
        judicial_assessment = self.judge.adjudicate_evidence(all_claims, contradictions)
        self.log_message(
            "judge", "all_agents", MessageType.FINAL_DECISION,
            f"Adjudication complete. Evidence quality: {judicial_assessment['evidence_quality']}"
        )
        self.update_agent_status("judge", AgentStatus.COMPLETED, "Epistemic rulings delivered")

        # ----------------------------------------------------------------------
        # STAGE 6: Synthesis & Board-Level Report Generation
        # ----------------------------------------------------------------------
        self.update_agent_status("synthesis", AgentStatus.THINKING, "Compiling final strategic intelligence report")
        audit_data = self.evidence_store.get_source_independence_report()
        
        report = self.synthesis_agent.generate_report(
            session=self.session,
            plan=self.research_plan,
            claims=list(self.evidence_store.claims.values()),
            sources=self.evidence_store.sources,
            contradictions=contradictions,
            audit_data=audit_data
        )
        self.final_report = report
        self.session.status = "COMPLETED"
        self.update_agent_status("synthesis", AgentStatus.COMPLETED, "Report published")
        self.update_agent_status("adversarial", AgentStatus.COMPLETED, "Adversarial challenges adjudicated")
        self.update_agent_status("director", AgentStatus.COMPLETED, "Orchestration complete")
        
        # Set aggregate totals for the Director
        self.director.info.source_count = len(self.evidence_store.sources)
        self.director.info.claim_count = len(self.evidence_store.claims)
        self.director.info.challenge_count = len(self.evidence_store.challenges)
        
        self.log_message("synthesis", "user", MessageType.TASK_COMPLETED, "Strategic Intelligence Report finalized and available.")
        
        self.event_emitter({
            "event": "research_completed",
            "report": report,
            "session_id": self.session.id
        })
        return report
