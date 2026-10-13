"""Refresh the public package manifest after reviewing source changes."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
EXCLUDED={'.git','.runtime','.setup','.venv','__pycache__','private-assets','profiles','jobs','dist'}
files=[]
for p in sorted(ROOT.rglob('*')):
 rel=p.relative_to(ROOT)
 if not p.is_file() or any(s in EXCLUDED for s in rel.parts) or p.name=='package-manifest.json' or p.suffix=='.pyc':continue
 raw=p.read_bytes()
 files.append({'path':rel.as_posix(),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
(ROOT/'package-manifest.json').write_text(json.dumps({'version':'0.3.1-education','files':files},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'files':len(files)}))
