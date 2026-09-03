import os
import shutil
import subprocess
import tempfile

repo_dir = os.path.join(tempfile.gettempdir(), 'remote_factsight')
ws_root = os.path.abspath('.')

def run_cmd(cmd, cwd=repo_dir):
    print(f"\n[RUNNING] {cmd} (in {cwd})")
    res = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if res.stdout:
        print(res.stdout.strip())
    if res.stderr:
        print("[STDERR]:", res.stderr.strip())
    if res.returncode != 0:
        raise RuntimeError(f"Command failed with exit code {res.returncode}")

print("=" * 65)
print("PUSHING FRONTEND AND BACKEND BRANCHES TO GITHUB")
print("=" * 65)

# -------------------------------------------------------------
# 1. PUSH FRONTEND BRANCH
# -------------------------------------------------------------
print("\n>>> PREPARING FRONTEND BRANCH...")
run_cmd("git checkout -B Frontend origin/Frontend")

# Copy updated frontend files
src_frontend = os.path.join(ws_root, "frontend")
dst_frontend = os.path.join(repo_dir, "frontend")

for root, dirs, files in os.walk(src_frontend):
    rel = os.path.relpath(root, src_frontend)
    target_dir = dst_frontend if rel == "." else os.path.join(dst_frontend, rel)
    os.makedirs(target_dir, exist_ok=True)
    for f in files:
        shutil.copy2(os.path.join(root, f), os.path.join(target_dir, f))

# Copy extension
src_ext = os.path.join(ws_root, "extension")
if os.path.exists(src_ext):
    dst_ext = os.path.join(repo_dir, "extension")
    os.makedirs(dst_ext, exist_ok=True)
    for f in os.listdir(src_ext):
        shutil.copy2(os.path.join(src_ext, f), os.path.join(dst_ext, f))

run_cmd("git add frontend extension")
run_cmd('git commit -m "feat(frontend): connect live Pure RAG API, 5-modality verification hub, and Tailwind 4"')
run_cmd("git push origin Frontend")
print(">>> FRONTEND BRANCH PUSHED SUCCESSFULLY!")

# -------------------------------------------------------------
# 2. PUSH BACKEND BRANCH
# -------------------------------------------------------------
print("\n>>> PREPARING BACKEND BRANCH...")
run_cmd("git checkout -B Backend origin/Backend")

# Copy backend files
src_backend = os.path.join(ws_root, "backend")
dst_backend = os.path.join(repo_dir, "backend")

for root, dirs, files in os.walk(src_backend):
    rel = os.path.relpath(root, src_backend)
    target_dir = dst_backend if rel == "." else os.path.join(dst_backend, rel)
    os.makedirs(target_dir, exist_ok=True)
    for f in files:
        # Don't copy SQLite database files or temp caches
        if f.endswith((".db", ".sqlite", ".pyc")):
            continue
        shutil.copy2(os.path.join(root, f), os.path.join(target_dir, f))

# Copy ml files if present
src_ml = os.path.join(ws_root, "ml")
if os.path.exists(src_ml):
    dst_ml = os.path.join(repo_dir, "ml")
    os.makedirs(dst_ml, exist_ok=True)
    for root, dirs, files in os.walk(src_ml):
        rel = os.path.relpath(root, src_ml)
        target_dir = dst_ml if rel == "." else os.path.join(dst_ml, rel)
        os.makedirs(target_dir, exist_ok=True)
        for f in files:
            if not f.endswith((".pyc", ".pt", ".bin")):
                shutil.copy2(os.path.join(root, f), os.path.join(target_dir, f))

run_cmd("git add backend ml")
run_cmd('git commit -m "feat(backend): complete Pure RAG architecture with ChromaDB vector store, Dual-DB system, and 44 automated tests"')
run_cmd("git push origin Backend")
print(">>> BACKEND BRANCH PUSHED SUCCESSFULLY!")

print("\n" + "=" * 65)
print("ALL BRANCHES PUSHED SUCCESSFULLY TO https://github.com/Heerd08/FactSight")
print("=" * 65)
