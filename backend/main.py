from datetime import date, time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI(title="AI CRM Backend")

class InteractionBase(BaseModel):
    hcp_name: str = Field(..., title="HCP Name")
    interaction_type: str = Field(..., title="Interaction Type")
    date: str = Field(..., title="Interaction Date")
    time: str = Field(..., title="Interaction Time")
    attendees: Optional[str] = ""
    topics_discussed: Optional[str] = ""
    outcomes: Optional[str] = ""
    follow_up_actions: Optional[str] = ""
    materials_shared: List[str] = []
    samples_distributed: List[str] = []
    sentiment: str = "Neutral"

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(InteractionBase):
    pass

class InteractionResponse(BaseModel):
    id: int
    interaction: InteractionBase
    ai: Optional[dict] = None

class AiResponse(BaseModel):
    summary: str
    next_best_action: str
    sentiment: str
    follow_ups: List[str]

class InteractionExtractResponse(BaseModel):
    fields: dict
    ai: AiResponse

interactions = []
next_id = 1

@app.get("/interactions")
async def list_interactions():
    return {"interactions": interactions}

@app.post("/interactions")
async def create_interaction(payload: InteractionCreate):
    global next_id
    item = payload.dict()
    entry = {
        "id": next_id,
        **item,
        "ai_summary": f"Summary for {item['hcp_name']}",
        "ai_follow_ups": ["Schedule follow-up", "Share product brochure"],
        "ai_next_best_action": "Confirm availability for next meeting.",
    }
    interactions.insert(0, entry)
    next_id += 1
    return {"interaction": entry, "ai": {"summary": entry["ai_summary"], "next_best_action": entry["ai_next_best_action"], "sentiment": entry["sentiment"], "follow_ups": entry["ai_follow_ups"]}}

@app.put("/interactions/{interaction_id}")
async def update_interaction(interaction_id: int, payload: InteractionUpdate):
    for idx, interaction in enumerate(interactions):
        if interaction["id"] == interaction_id:
            updated = {"id": interaction_id, **payload.dict()}
            updated["ai_summary"] = interaction.get("ai_summary", "Updated AI summary")
            updated["ai_follow_ups"] = interaction.get("ai_follow_ups", ["Follow up as needed"])
            updated["ai_next_best_action"] = interaction.get("ai_next_best_action", "Confirm next step")
            interactions[idx] = updated
            return {"interaction": updated, "ai": {"summary": updated["ai_summary"], "next_best_action": updated["ai_next_best_action"], "sentiment": updated["sentiment"], "follow_ups": updated["ai_follow_ups"]}}
    raise HTTPException(status_code=404, detail="Interaction not found")

@app.post("/ai/hcp-assist")
async def ai_assist(payload: InteractionCreate):
    return {
        "summary": f"AI suggested summary for {payload.hcp_name}.",
        "next_best_action": "Follow up with requested study data.",
        "sentiment": payload.sentiment,
        "follow_ups": ["Send clinical study reprint", "Book next review call"],
    }

@app.post("/ai/extract-interaction")
async def extract_interaction(payload: dict):
    current = payload.get("current_interaction", {})
    message = payload.get("message", "")
    fields = {
        "topics_discussed": message,
        "outcomes": "Captured from note.",
        "follow_up_actions": "Review with HCP in two weeks.",
    }
    return {
        "fields": fields,
        "ai": {
            "summary": "Extracted summary from chat note.",
            "next_best_action": "Compile follow-up materials.",
            "sentiment": current.get("sentiment", "Neutral"),
            "follow_ups": ["Share product brochure", "Send meeting notes"],
        },
    }
