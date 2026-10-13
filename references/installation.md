# 설치와 연결

공개판에는 실제 프로젝트 도면이 없습니다. 아래 설치는 도구와 지침을 준비하며, 도면 스타일은 [로컬 참조 프로파일](project-profile.md)로 추가합니다.

## 요구 환경

Windows, Codex, Windows Python 3.10+, 일반 AutoCAD. 이 패키지의 COM 도우미는 일반 AutoCAD용이며 LT에서는 검증하지 않았습니다. 동봉 MCP 자체의 LT 설명과 구분하세요. 최초 의존성 설치에는 네트워크가 필요할 수 있습니다.

## 교육 실습: 완성 스킬 설치 없이 MCP 연결

일반적인 수업 시작에서는 저장소 폴더에서 다음만 실행합니다.

```powershell
python scripts/verify_package.py
python scripts/setup_mcp.py
```

저장소 안의 .runtime과 .setup을 준비하며 사용자 스킬 폴더에는 설치하지 않습니다. 아래 MCP 설정 반영과 APPLOAD 절차를 따라 연결합니다. [교육 지침](../AGENTS.md)을 먼저 적용하고, 일반 CAD 실습 요청에 동봉 완성 스킬을 자동 사용하지 않습니다.

## 선택 설치: 사용자가 완성 스킬 설치를 명시한 경우

저장소를 복제하거나 ZIP을 폴더 전체로 풉니다. 저장소 폴더에서 실행합니다.

```powershell
python scripts/verify_package.py
powershell -File scripts/Install.ps1 -PythonPath "C:\path\to\python.exe"
```

설치 후에도 agents/openai.yaml의 allow_implicit_invocation은 false입니다. 사용자가 `$unit-plan-cad` 또는 완성 스킬 사용을 직접 명시한 요청에서만 적용합니다.

설치기는 CODEX_HOME/skills/unit-plan-cad 또는 사용자 .codex/skills/unit-plan-cad에 파일을 복사합니다. 기존 동일 스킬을 덮어쓰지 않습니다. 이미 설치되어 있으면 명시적인 업그레이드 계획을 세우거나 -DestinationRoot로 별도 경로를 사용하세요. 현재 Codex에서 스킬이 발견되는지 확인하고 필요한 경우 경로로 SKILL.md를 직접 지정합니다.

설치된 폴더의 .runtime에 의존성을 준비합니다. .setup/mcp-config.generated.toml의 실제 경로를 기존 Codex MCP 설정에 병합합니다. 이미 연결된 AutoCAD 서버와 중복 등록하지 마세요. 기존 설정을 자동으로 덮어쓰지는 않습니다. 작동하는 동일 MCP가 이미 있으면 -SkipMcp로 설치하고 현재 연결의 호환성을 확인할 수 있습니다.

## AutoCAD APPLOAD

1. 작업할 도면을 활성화합니다.
2. 명령창에 APPLOAD를 입력합니다.
3. 설치 폴더의 .setup/load-unit-plan.lsp를 로드합니다. dispatcher와 cad-guard가 함께 로드됩니다.
4. MCP status/get_backend에서 file_ipc, DWGNAME/DWGPREFIX에서 전체 경로를 확인합니다.

새 DWG 문서에서는 dispatcher가 준비되었는지 다시 확인합니다. 전역 보안 설정을 해제하지 마세요. 이 legacy 전송은 C:/temp와 한 PC의 직렬 CAD 호출을 사용합니다. Python과 LISP 양쪽 IPC 경로가 같아야 합니다.

## 연결 시험

작업 폴더와 outputs/operations를 설치 폴더 밖에 만듭니다. New-JobDrawing.ps1 -OutputPath로 존재하지 않는 새 DWG를 생성하고 그 문서에서 APPLOAD와 경로 확인을 반복합니다. 잘못된 expected path가 쓰기를 막는지 확인하세요.

cad-smoke.lsp의 up:smoke는 사용자가 별도로 제공한 작은 DWG 부품 경로를 요구합니다. 공개판에는 부품 DWG가 없으므로 로컬 참조를 준비한 뒤 실행합니다. 빈 실습 도면에서 한글·실제 부품·1000 치수·해치를 생성하고 저장본을 읽어 확인합니다. 같은 operation ID를 반복해도 객체가 추가되지 않아야 합니다. 자세한 호출은 [실행 계약](cad-execution.md)을 따릅니다.

패키지 파일 검사와 연결 시험은 프로젝트 스타일·출력 품질 시험을 대체하지 않습니다. 다른 PC의 실제 연결은 그 PC에서 확인해야 합니다.
