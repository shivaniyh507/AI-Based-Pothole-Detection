"""
RoadSafe AI — Development Server Launcher
Launches FastAPI backend server on http://localhost:8000
"""

import os
import sys
import subprocess

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "Backend")
VENV_PYTHON = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")

if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = sys.executable

def main():
    print("=" * 65)
    print("🚀 Starting RoadSafe AI FastAPI Backend Server...")
    print("   API Docs: http://localhost:8000/docs")
    print("   API Root: http://localhost:8000/")
    print("=" * 65)

    cmd = [
        VENV_PYTHON, "-m", "uvicorn", "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ]

    try:
        subprocess.run(cmd, cwd=BACKEND_DIR)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user.")

if __name__ == "__main__":
    main()
