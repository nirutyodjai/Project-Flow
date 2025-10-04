"""
ทดสอบ Multi-Edit กับ FastAPI
มี endpoints ซ้ำกัน 10 ครั้ง
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Endpoint 1
@app.get("/api/new-endpoint-1")
async def get_new_data_1():
    new_url = "https://new-api.example.com/data1"
    new_timeout = 5000
    new_version = "v2"
    new_status = "active"
    
    return {
        "endpoint": "new-endpoint-1",
        "url": new_url,
        "timeout": new_timeout,
        "version": new_version,
        "status": new_status,
        "message": "This is new endpoint 1"
    }

# Endpoint 2
@app.get("/api/new-endpoint-2")
async def get_new_data_2():
    new_url = "https://new-api.example.com/data2"
    new_timeout = 5000
    new_version = "v2"
    new_status = "active"
    
    return {
        "endpoint": "new-endpoint-2",
        "url": new_url,
        "timeout": new_timeout,
        "version": new_version,
        "status": new_status,
        "message": "This is new endpoint 2"
    }

# Endpoint 3
@app.get("/api/new-endpoint-3")
async def get_new_data_3():
    new_url = "https://new-api.example.com/data3"
    new_timeout = 5000
    new_version = "v2"
    new_status = "active"
    
    return {
        "endpoint": "new-endpoint-3",
        "url": new_url,
        "timeout": new_timeout,
        "version": new_version,
        "status": new_status,
        "message": "This is new endpoint 3"
    }

# Endpoint 4
@app.get("/api/new-endpoint-4")
async def get_new_data_4():
    new_url = "https://new-api.example.com/data4"
    new_timeout = 5000
    new_version = "v2"
    new_status = "active"
    
    return {
        "endpoint": "new-endpoint-4",
        "url": new_url,
        "timeout": new_timeout,
        "version": new_version,
        "status": new_status,
        "message": "This is new endpoint 4"
    }

# Endpoint 5
@app.get("/api/new-endpoint-5")
async def get_new_data_5():
    new_url = "https://new-api.example.com/data5"
    new_timeout = 5000
    new_version = "v2"
    new_status = "active"
    
    return {
        "endpoint": "new-endpoint-5",
        "url": new_url,
        "timeout": new_timeout,
        "version": new_version,
        "status": new_status,
        "message": "This is new endpoint 5"
    }

# Endpoint 6
@app.get("/api/new-endpoint-6")
async def get_new_data_6():
    new_url = "https://new-api.example.com/data6"
    new_timeout = 5000
    new_version = "v2"
    new_status = "active"
    
    return {
        "endpoint": "new-endpoint-6",
        "url": new_url,
        "timeout": new_timeout,
        "version": new_version,
        "status": new_status,
        "message": "This is new endpoint 6"
    }

# Endpoint 7
@app.get("/api/new-endpoint-7")
async def get_new_data_7():
    new_url = "https://new-api.example.com/data7"
    new_timeout = 5000
    new_version = "v2"
    new_status = "active"
    
    return {
        "endpoint": "new-endpoint-7",
        "url": new_url,
        "timeout": new_timeout,
        "version": new_version,
        "status": new_status,
        "message": "This is new endpoint 7"
    }

# Endpoint 8
@app.get("/api/new-endpoint-8")
async def get_new_data_8():
    new_url = "https://new-api.example.com/data8"
    new_timeout = 5000
    new_version = "v2"
    new_status = "active"
    
    return {
        "endpoint": "new-endpoint-8",
        "url": new_url,
        "timeout": new_timeout,
        "version": new_version,
        "status": new_status,
        "message": "This is new endpoint 8"
    }

# Endpoint 9
@app.get("/api/new-endpoint-9")
async def get_new_data_9():
    new_url = "https://new-api.example.com/data9"
    new_timeout = 5000
    new_version = "v2"
    new_status = "active"
    
    return {
        "endpoint": "new-endpoint-9",
        "url": new_url,
        "timeout": new_timeout,
        "version": new_version,
        "status": new_status,
        "message": "This is new endpoint 9"
    }

# Endpoint 10
@app.get("/api/new-endpoint-10")
async def get_new_data_10():
    new_url = "https://new-api.example.com/data10"
    new_timeout = 5000
    new_version = "v2"
    new_status = "active"
    
    return {
        "endpoint": "new-endpoint-10",
        "url": new_url,
        "timeout": new_timeout,
        "version": new_version,
        "status": new_status,
        "message": "This is new endpoint 10"
    }

# Constants
NEW_API_HOST = "0.0.0.0"
NEW_API_PORT = 8000
NEW_DEBUG_MODE = True
NEW_RELOAD_MODE = True
NEW_LOG_LEVEL = "info"
NEW_WORKERS = 1
NEW_CORS_ORIGIN = "http://localhost:3000"
NEW_MAX_UPLOAD_SIZE = 10485760
NEW_REQUEST_TIMEOUT = 30
NEW_KEEPALIVE_TIMEOUT = 5

print(f"NEW_API_HOST: {NEW_API_HOST}")
print(f"NEW_API_PORT: {NEW_API_PORT}")
print(f"NEW_DEBUG_MODE: {NEW_DEBUG_MODE}")
