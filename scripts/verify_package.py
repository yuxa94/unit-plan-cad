"""Verify packaged files using only Python's standard library."""
import argparse
import hashlib
import json
from pathlib import Path


def verify_entries(root: Path, entries: list) -> list[str]:
    root = root.resolve()
    errors = []
    for entry in entries:
        name = entry['path']
        candidate = (root / name).resolve()
        if Path(name).is_absolute() or not candidate.is_relative_to(root):
            errors.append(f'outside package: {name}')
            continue
        if not candidate.is_file():
            errors.append(f'missing file: {name}')
            continue
        raw = candidate.read_bytes()
        if len(raw) != entry['bytes']:
            errors.append(f'length mismatch: {name}')
        if hashlib.sha256(raw).hexdigest().lower() != entry['sha256'].lower():
            errors.append(f'hash mismatch: {name}')
        if candidate.suffix.lower() == '.dwg' and not raw.startswith(b'AC10'):
            errors.append(f'invalid DWG header: {name}')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    manifest = json.loads((args.root / 'package-manifest.json').read_text(encoding='utf-8-sig'))
    errors = verify_entries(args.root, manifest['files'])
    print(json.dumps({'ok': not errors, 'files_checked': len(manifest['files']), 'errors': errors}, ensure_ascii=True, indent=2))
    raise SystemExit(1 if errors else 0)


if __name__ == '__main__':
    main()
