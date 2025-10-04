"""
FastAPI Demo - สร้าง API สำหรับวิเคราะห์โครงการ
รัน: uvicorn fastapi-demo:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import random

app = FastAPI(
    title="Project Analysis API",
    description="API สำหรับวิเคราะห์โครงการประมูล",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Project(BaseModel):
    projectName: str
    organization: str
    budget: float
    closingDate: str
    projectType: str

class BOQItem(BaseModel):
    no: str
    description: str
    unit: str
    quantity: float
    materialCost: Optional[float] = 0
    laborCost: Optional[float] = 0

class TORAnalysisRequest(BaseModel):
    projectName: str
    budget: float
    workItems: List[dict]

class BOQAnalysisRequest(BaseModel):
    projectName: str
    totalBudget: float
    items: List[BOQItem]

class Notification(BaseModel):
    message: str

# Mock Material Data
MATERIAL_DB = {
    "สายไฟ THW 2.5 sq.mm": [
        { "supplier": "SCC", "price": 11, "unit": "เมตร", "discount": 40, "stock": "มีสินค้า", "delivery": "1-2 วัน", "rating": 4.8 },
        { "supplier": "Global House", "price": 13, "unit": "เมตร", "discount": 35, "stock": "มีสินค้า", "delivery": "2-3 วัน", "rating": 4.5 },
        { "supplier": "HomePro", "price": 15, "unit": "เมตร", "discount": 30, "stock": "มีสินค้า", "delivery": "1 วัน", "rating": 4.7 },
        { "supplier": "Thai Watsadu", "price": 14, "unit": "เมตร", "discount": 32, "stock": "สินค้าน้อย", "delivery": "3-5 วัน", "rating": 4.3 },
    ],
    "ท่อ PVC 2 นิ้ว": [
        { "supplier": "ตราช้าง", "price": 80, "unit": "เส้น", "discount": 10, "stock": "มีสินค้า", "delivery": "1-2 วัน", "rating": 4.9 },
        { "supplier": "ท่อน้ำไทย", "price": 75, "unit": "เส้น", "discount": 8, "stock": "มีสินค้า", "delivery": "2-3 วัน", "rating": 4.7 },
    ]
}

for material, suppliers in MATERIAL_DB.items():
    for supplier in suppliers:
        supplier['netPrice'] = supplier['price'] * (1 - supplier['discount'] / 100)

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Routes
@app.get("/")
def read_root():
    return {
        "message": "Project Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "projects": "/api/projects",
            "analyze_tor": "/api/analyze-tor",
            "analyze_boq": "/api/analyze-boq",
            "scrape_egp": "/api/scrape-egp",
        }
    }

@app.get("/api/projects")
def get_projects(keyword: Optional[str] = "", limit: int = 30):
    """ดึงรายการโครงการ"""
    # Mock data with status and type
    project_types = ['ก่อสร้าง', 'ไฟฟ้า', 'ตกแต่ง', 'ประปา']
    statuses = ['won', 'lost', 'pending']
    projects = []
    for i in range(1, limit + 1):
        p_type = project_types[i % len(project_types)]
        status = statuses[i % len(statuses)]
        budget = (10 + i) * 1000000
        projects.append({
            "id": f"PROJECT-{i}",
            "projectName": f"โครงการ{p_type} {i}",
            "organization": "หน่วยงานทดสอบ",
            "budget": budget,
            "closingDate": f"2025-10-{15 + (i%10)}",
            "wonDate": f"2025-0{i%5+1}-{(i%28)+1}" if status == 'won' else None,
            "projectType": p_type,
            "status": status,
            "profit": budget * (0.10 + (i%10)/100) if status == 'won' else 0
        })
    
    return {
        "success": True,
        "total": len(projects),
        "projects": projects,
        "source": "FastAPI"
    }

@app.post("/api/analyze-tor")
def analyze_tor(request: TORAnalysisRequest):
    """วิเคราะห์ TOR และคำนวณกำไร"""
    
    # คำนวณต้นทุน
    total_cost = sum(
        item.get('materialCost', 0) + item.get('laborCost', 0) 
        for item in request.workItems
    )
    
    # คำนวณกำไร
    profit = request.budget - total_cost
    profit_percent = (profit / request.budget) * 100
    
    return {
        "success": True,
        "analysis": {
            "projectName": request.projectName,
            "budget": request.budget,
            "totalCost": total_cost,
            "profit": profit,
            "profitPercent": profit_percent,
            "recommendation": "✅ แนะนำยื่นข้อเสนอ" if profit_percent > 10 else "⚠️ พิจารณาอย่างรอบคอบ"
        }
    }

@app.post("/api/analyze-boq")
def analyze_boq(request: BOQAnalysisRequest):
    """วิเคราะห์ BOQ และถอดรายการ"""
    
    # คำนวณต้นทุนรวม
    total_material = sum(item.materialCost or 0 for item in request.items)
    total_labor = sum(item.laborCost or 0 for item in request.items)
    total_direct = total_material + total_labor
    
    # ต้นทุนทางอ้อม
    overhead = total_direct * 0.10
    management = total_direct * 0.07
    tax = (total_direct + management) * 0.07
    
    total_cost = total_direct + overhead + management + tax
    profit = request.totalBudget - total_cost
    profit_percent = (profit / request.totalBudget) * 100
    
    return {
        "success": True,
        "analysis": {
            "projectName": request.projectName,
            "totalBudget": request.totalBudget,
            "summary": {
                "totalMaterialCost": total_material,
                "totalLaborCost": total_labor,
                "totalDirectCost": total_direct,
                "overheadCost": overhead,
                "managementCost": management,
                "taxCost": tax,
                "totalCost": total_cost,
                "profit": profit,
                "profitPercent": profit_percent,
            }
        }
    }

@app.get("/api/health")
def health_check():
    """ตรวจสอบสถานะ API"""
    return {
        "status": "healthy",
        "message": "FastAPI is running"
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/analytics/win-rate")
def get_win_rate_analytics():
    """คำนวณและส่งข้อมูล Win Rate Analytics"""
    
    # Get all projects from mock data
    all_projects = get_projects(limit=50)['projects']
    
    # Overview
    total_bids = len(all_projects)
    won_projects = [p for p in all_projects if p['status'] == 'won']
    lost_projects = [p for p in all_projects if p['status'] == 'lost']
    pending_projects = [p for p in all_projects if p['status'] == 'pending']
    
    total_value = sum(p['budget'] for p in all_projects)
    won_value = sum(p['budget'] for p in won_projects)
    total_profit = sum(p['profit'] for p in won_projects)

    overview = {
        "totalBids": total_bids,
        "won": len(won_projects),
        "lost": len(lost_projects),
        "pending": len(pending_projects),
        "winRate": (len(won_projects) / total_bids) * 100 if total_bids > 0 else 0,
        "totalValue": total_value,
        "wonValue": won_value,
        "avgProfit": (total_profit / won_value) * 100 if won_value > 0 else 0,
    }

    # By Category
    by_category = {}
    for p in all_projects:
        cat = p['projectType']
        if cat not in by_category:
            by_category[cat] = {"total": 0, "won": 0, "value": 0}
        by_category[cat]['total'] += 1
        by_category[cat]['value'] += p['budget']
        if p['status'] == 'won':
            by_category[cat]['won'] += 1
    
    category_stats = [
        {
            "category": cat,
            "total": data['total'],
            "won": data['won'],
            "winRate": (data['won'] / data['total']) * 100 if data['total'] > 0 else 0,
            "value": data['value']
        }
        for cat, data in by_category.items()
    ]

    # By Month (mock for now)
    by_month = [
        { "month": 'ม.ค.', "won": 2, "lost": 1, "winRate": 67 },
        { "month": 'ก.พ.', "won": 3, "lost": 2, "winRate": 60 },
        { "month": 'มี.ค.', "won": 4, "lost": 1, "winRate": 80 },
        { "month": 'เม.ย.', "won": 2, "lost": 3, "winRate": 40 },
        { "month": 'พ.ค.', "won": 4, "lost": 3, "winRate": 57 },
    ]

    return {
        "overview": overview,
        "byCategory": category_stats,
        "byMonth": by_month
    }

@app.get("/api/materials/compare")
def compare_materials(q: Optional[str] = ""):
    """เปรียบเทียบราคาวัสดุจากซัพพลายเออร์ต่างๆ"""
    if not q:
        return []
    
    # Find matching material
    best_match = None
    for material_name in MATERIAL_DB.keys():
        if q.lower() in material_name.lower():
            best_match = material_name
            break
    
    if best_match:
        return MATERIAL_DB[best_match]
    
    # If no match, return some random data for demo
    suppliers = ["Supplier A", "Supplier B", "Supplier C"]
    results = []
    base_price = random.randint(50, 200)
    for s in suppliers:
        price = base_price + random.randint(-10, 10)
        discount = random.randint(5, 20)
        results.append({
            "supplier": s,
            "price": price,
            "unit": "หน่วย",
            "discount": discount,
            "netPrice": price * (1 - discount / 100),
            "stock": "สอบถาม",
            "delivery": "3-5 วัน",
            "rating": round(random.uniform(3.5, 4.9), 1)
        })
    return results

@app.post("/api/notify")
async def notify(notification: Notification):
    """Endpoint สำหรับทดสอบส่ง Notification"""
    await manager.broadcast(notification.message)
    return {"status": "notification sent"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
