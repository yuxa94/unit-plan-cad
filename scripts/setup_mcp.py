"""Set up this package's MCP runtime without editing existing Codex settings."""
import argparse
import json
from pathlib import Path
import subprocess
import sys
import venv


def write_config(root: Path, python: Path) -> Path:
    setup = root / '.setup'
    setup.mkdir(exist_ok=True)
    # JSON basic strings are compatible with TOML basic string escaping here.
    quoted = lambda p: json.dumps(str(p), ensure_ascii=False)
    snippet = ('[mcp_servers.unit_plan_autocad]\n'
               f'command = {quoted(python)}\nargs = ["-m", "autocad_mcp"]\n'
               '[mcp_servers.unit_plan_autocad.env]\n'
               f'PYTHONPATH = {quoted(root / "mcp/autocad-mcp/src")}\n'
               'AUTOCAD_MCP_BACKEND = "file_ipc"\n'
               'AUTOCAD_MCP_IPC_DIR = "C:/temp"\n'
               'AUTOCAD_MCP_IPC_TIMEOUT = "30"\n')
    path = setup / 'mcp-config.generated.toml'
    path.write_text(snippet, encoding='utf-8')
    load = lambda p: '(load ' + json.dumps(p.as_posix(), ensure_ascii=False) + ')'
    bootstrap = '\n'.join([load(root / 'mcp/autocad-mcp/lisp-code/mcp_dispatch.lsp'), load(root / 'scripts/cad-guard.lsp'), '(princ "\\nUnit-plan MCP loaded for this document.")', '(princ)'])
    (setup / 'load-unit-plan.lsp').write_text(bootstrap, encoding='utf-8')
    return path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config-only', action='store_true', help='Use current Python; do not install dependencies.')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    if sys.platform != 'win32':
        raise SystemExit('This live CAD setup requires Windows regular AutoCAD.')
    python = Path(sys.executable)
    if not args.config_only:
        env = root / '.runtime'
        if not (env / 'Scripts/python.exe').is_file():
            venv.EnvBuilder(with_pip=True).create(env)
        python = env / 'Scripts/python.exe'
        subprocess.run([str(python), '-m', 'pip', 'install', '-e', str(root / 'mcp/autocad-mcp')], check=True)
        subprocess.run([str(python), '-c', 'import mcp, win32gui, ezdxf, PIL, structlog'], check=True)
    print(write_config(root, python))
    print('Merge this new server block into Codex config only if it is not already present; no settings were overwritten. Load .setup/load-unit-plan.lsp using APPLOAD in the intended CAD document.')


if __name__ == '__main__':
    main()
