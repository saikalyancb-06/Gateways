"""
Centralized Evidence Store and Claim Lifecycle Registry.
Manages:
- Claim creation & evolution (HYPOTHESIS -> DISCOVERED -> CHALLENGED -> VERIFIED)
- Source independence grouping and deduplication
- Contradiction detection engine
- Evidence grounding linkages
"""

import time
import uuid
from typing import List, Dict, Any, Optional
from researchops_core.backend.models.schemas import (
    Source, Claim, Evidence, Challenge, ClaimStatus, ClaimType
)

class EvidenceStore:
    def __init__(self):
        self.sources: Dict[str, Source] = {}
        self.claims: Dict[str, Claim] = {}
        self.evidence_links: Dict[str, Evidence] = {}
        self.challenges: Dict[str, Challenge] = {}
        self.independence_clusters: Dict[str, List[str]] = {}
        
    def add_source(self, url: str, title: str, publisher: str, raw_snippet: str = "", independence_group: str = "default") -> Source:
        # Check if already present by URL
        for s in self.sources.values():
            if s.url.strip().lower() == url.strip().lower():
                return s
                
        src = Source(
            url=url,
            title=title,
            publisher=publisher,
            independence_group=independence_group,
            raw_snippet=raw_snippet
        )
        self.sources[src.id] = src
        
        # Track independence
        grp = independence_group or "independent_single"
        if grp not in self.independence_clusters:
            self.independence_clusters[grp] = []
        self.independence_clusters[grp].append(src.id)
        
        return src

    def add_claim(self, session_id: str, text: str, created_by: str, claim_type: ClaimType = ClaimType.FACT, confidence: float = 0.85) -> Claim:
        clm = Claim(
            session_id=session_id,
            text=text,
            type=claim_type,
            status=ClaimStatus.DISCOVERED,
            confidence=confidence,
            created_by=created_by
        )
        self.claims[clm.id] = clm
        return clm

    def link_evidence(self, claim_id: str, source_id: str, support_type: str = "SUPPORTS", excerpt: str = "", relevance: float = 0.95) -> Evidence:
        evi = Evidence(
            claim_id=claim_id,
            source_id=source_id,
            support_type=support_type,
            excerpt=excerpt,
            relevance=relevance
        )
        self.evidence_links[evi.id] = evi
        
        claim = self.claims.get(claim_id)
        if claim:
            if support_type == "SUPPORTS" and source_id not in claim.supporting_source_ids:
                claim.supporting_source_ids.append(source_id)
                if claim.status == ClaimStatus.DISCOVERED:
                    claim.status = ClaimStatus.SUPPORTED
            elif support_type == "CONTRADICTS" and source_id not in claim.contradicting_source_ids:
                claim.contradicting_source_ids.append(source_id)
            claim.updated_at = time.strftime("%H:%M:%S")
        return evi

    def add_challenge(self, claim_id: str, challenger_agent: str, argument: str, severity: str = "MEDIUM", requested_action: str = "") -> Challenge:
        chl = Challenge(
            claim_id=claim_id,
            challenger_agent=challenger_agent,
            argument=argument,
            severity=severity,
            requested_action=requested_action,
            status="OPEN"
        )
        self.challenges[chl.id] = chl
        
        claim = self.claims.get(claim_id)
        if claim:
            claim.challenge_ids.append(chl.id)
            claim.status = ClaimStatus.CHALLENGED
            claim.confidence = max(0.4, claim.confidence - 0.2)
            claim.updated_at = time.strftime("%H:%M:%S")
        return chl

    def verify_claim(self, claim_id: str, resolution_status: ClaimStatus, verification_notes: str, confidence: float):
        claim = self.claims.get(claim_id)
        if claim:
            claim.status = resolution_status
            claim.verification_notes = verification_notes
            claim.confidence = confidence
            claim.updated_at = time.strftime("%H:%M:%S")
            
            # Resolve related challenges
            for ch_id in claim.challenge_ids:
                ch = self.challenges.get(ch_id)
                if ch:
                    ch.status = "RESOLVED"

    def detect_contradictions(self) -> List[Dict[str, Any]]:
        """
        Scans for claims that have both supporting and contradicting evidence attached,
        or where confidence drops below threshold.
        """
        conflicts = []
        for clm in self.claims.values():
            if len(clm.contradicting_source_ids) > 0 or clm.status in [ClaimStatus.CHALLENGED, ClaimStatus.CONTRADICTED, ClaimStatus.PARTIALLY_SUPPORTED]:
                sup_sources = [self.sources.get(sid) for sid in clm.supporting_source_ids if sid in self.sources]
                con_sources = [self.sources.get(sid) for sid in clm.contradicting_source_ids if sid in self.sources]
                conflicts.append({
                    "claim_id": clm.id,
                    "claim_text": clm.text,
                    "status": clm.status,
                    "supporting_sources": [s.title for s in sup_sources if s],
                    "contradicting_sources": [s.title for s in con_sources if s],
                    "verification_notes": clm.verification_notes
                })
        return conflicts

    def get_source_independence_report(self) -> Dict[str, Any]:
        """
        Evaluates source diversity and whether sources cluster to single publisher domains.
        """
        total_sources = len(self.sources)
        unique_groups = len(self.independence_clusters)
        is_independent = unique_groups >= max(2, total_sources * 0.6)
        
        clusters_summary = []
        for grp, sids in self.independence_clusters.items():
            titles = [self.sources[sid].title for sid in sids if sid in self.sources]
            clusters_summary.append({
                "group_name": grp,
                "count": len(sids),
                "titles": titles
            })
            
        return {
            "total_sources": total_sources,
            "unique_independence_clusters": unique_groups,
            "independence_ratio": round(unique_groups / max(1, total_sources), 2),
            "is_sufficiently_independent": is_independent,
            "clusters": clusters_summary
        }

    def get_graph_data(self) -> Dict[str, Any]:
        """
        Generates nodes and edges for the Evidence Graph visualization.
        """
        nodes = []
        edges = []
        
        for c in self.claims.values():
            nodes.append({
                "id": c.id,
                "type": "claim",
                "label": c.text[:60] + "..." if len(c.text) > 60 else c.text,
                "full_text": c.text,
                "status": c.status.value,
                "confidence": c.confidence,
                "claim_type": c.type.value,
                "verification_notes": c.verification_notes
            })
            
        for s in self.sources.values():
            nodes.append({
                "id": s.id,
                "type": "source",
                "label": s.title[:45] + "...",
                "full_text": s.title,
                "url": s.url,
                "publisher": s.publisher,
                "group": s.independence_group
            })
            
        for ch in self.challenges.values():
            nodes.append({
                "id": ch.id,
                "type": "challenge",
                "label": f"Challenge: {ch.argument[:45]}...",
                "full_text": ch.argument,
                "severity": ch.severity,
                "status": ch.status
            })
            edges.append({
                "id": f"e_ch_{ch.id}_{ch.claim_id}",
                "source": ch.id,
                "target": ch.claim_id,
                "label": "CHALLENGES",
                "style": "dashed",
                "color": "#EF4444"
            })
            
        for e in self.evidence_links.values():
            is_support = e.support_type == "SUPPORTS"
            edges.append({
                "id": f"e_{e.id}",
                "source": e.source_id,
                "target": e.claim_id,
                "label": e.support_type,
                "style": "solid",
                "color": "#10B981" if is_support else "#F59E0B"
            })
            
        return {"nodes": nodes, "edges": edges}
