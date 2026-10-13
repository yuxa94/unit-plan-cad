"""Check public package links and exclusions without printing sensitive matches."""
from pathlib import Path
import json,re,sys
from urllib.parse import unquote
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'package-manifest.json').read_text(encoding='utf-8'))
errors=[]; checked=0
for e in manifest['files']:
 rel=e['path'];p=ROOT/rel;checked+=1
 if p.suffix.lower() in {'.dwg','.bak','.pdf','.png','.jpg','.zip','.pyc'}:errors.append('excluded file type: '+rel)
 if any(s in {'private-assets','profiles','jobs','.setup','.runtime','.git','a31'} for s in Path(rel).parts):errors.append('excluded directory: '+rel)
 try:t=p.read_text(encoding='utf-8-sig')
 except UnicodeError:errors.append('unreviewed binary: '+rel);continue
 if re.search(r'C:[/\\]+Users[/\\]+(?!YOUR_USER|example|<)',t,re.I):errors.append('personal path: '+rel)
 if re.search(r'(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{35,}|sk-proj-[A-Za-z0-9_-]{25,})',t):errors.append('credential pattern: '+rel)
 if re.search(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',t):errors.append('private key: '+rel)
 if p.suffix=='.md':
  for link in re.findall(r'\]\(([^)]+)\)',t):
   if link.startswith(('http:','https:','mailto:','#')):continue
   target=unquote(link.split('#')[0].strip('<>'))
   if target and not (p.parent/target).exists():errors.append('broken local link: '+rel+' -> '+target)
print(json.dumps({'ok':not errors,'files_checked':checked,'errors':errors},ensure_ascii=False,indent=2))
sys.exit(bool(errors))
