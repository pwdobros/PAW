from fastapi import FastAPI
app = FastAPI(title="TaskBoard")
@app.get("/")
def root():
 return {"message": "Hello Web"}
