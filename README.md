# Unit Plan CAD

CAD MCP 연결, 자연어 작도, 도면 분석, 스킬 제작·튜닝을 실습하는 **교육용 저장소**입니다. 완성된 단위세대 작성 스킬은 비교·참고용으로 동봉되어 있습니다.

## 교육 모드가 기본입니다

GPT/Codex는 패키지의 완성 스킬을 임의로 사용하지 않습니다. [AGENTS.md](AGENTS.md)에 실습 진행 규칙을 두고, `agents/openai.yaml`에 `allow_implicit_invocation: false`를 설정했습니다.

- MCP 연결과 일반 작도 요청은 완성 스킬 없이 진행합니다.
- 스킬 제작 실습은 수강생의 분석 자료로 새 작업본을 만듭니다.
- 사용자가 직접 `$unit-plan-cad`를 호출하거나 완성 스킬 사용을 명시한 경우에만 적용합니다.
- 완성 스킬의 읽기·비교와 실제 작도 적용을 구분합니다.

이 설정은 Codex의 스킬 호출 정책과 에이전트 지침입니다. 다른 클라이언트에서는 해당 정책·AGENTS.md를 읽도록 구성해야 하며, 모든 GPT 실행 환경을 기술적으로 차단하는 권한 장치는 아닙니다.

## 포함 범위

- SKILL.md와 입력 해석·상세 작성·수정·검토 절차
- AutoCAD MCP 소스와 LISP dispatcher, 연결·새 문서·작업 guard 도구
- 실 배치, 조절점 크기 변경, 레이어 순서, 겹침 차감이 가능한 오프라인 HTML 편집기
- 실제 프로젝트와 무관한 가상 조닝 DXF/JSON 8종
- 설치 및 검증 스크립트

**실제 프로젝트 DWG/XREF, 추출 부품, 원본 형상 덤프, 도면 스크린샷, 작업 결과와 개인 경로는 공개하지 않습니다.** 자동 설계 엔진이나 시공용 도면 생성의 완성 인증이 아닙니다. 자신의 참조 자료와 설계 검토가 필요합니다.

## 수업 시작 — MCP만 연결

```powershell
git clone https://github.com/yuxa94/unit-plan-cad.git
cd unit-plan-cad
python scripts/verify_package.py
python scripts/setup_mcp.py
```

`setup_mcp.py`는 저장소의 런타임과 연결 설정을 준비하며 완성 스킬을 사용자 스킬 폴더에 설치하지 않습니다. 생성된 `.setup/mcp-config.generated.toml`을 기존 설정에 중복 없이 반영하고 AutoCAD의 APPLOAD로 `.setup/load-unit-plan.lsp`를 로드합니다. 일반 AutoCAD의 Windows COM 도우미 기준이며 LT와 다른 PC의 연결은 별도 검증이 필요합니다.

자연어 도형·치수 → PDF 재작성 → 실제 DWG 분석 → 수강생 스킬 제작·시험 → 질문으로 튜닝 → 변경 확인 → HTML 조닝 작도·수정 → 폴더 정리 순서로 실습합니다.

## 완성 스킬 사용 — 사용자가 명시적으로 선택한 경우

완성 스킬을 설치할 필요가 있을 때만 [설치 안내](references/installation.md)의 선택 설치 절차를 사용합니다. 설치 후에도 자동 호출은 꺼져 있으며 기존 설치본은 덮어쓰지 않습니다.

1. [조닝 편집기](assets/examples/zoning-editor/index.html)를 로컬에서 열어 실을 배치하고 JSON을 저장합니다. GitHub 파일 뷰에서는 실행되지 않으므로 저장소를 내려받으세요.
2. [자신의 참조 DWG 프로파일](references/project-profile.md)을 준비합니다. 이 공개판에는 특정 프로젝트 스타일이 설정되어 있지 않습니다.
3. **완성 스킬을 사용하기로 선택한 경우에만** Codex에 조닝을 첨부하고 아래처럼 직접 요청합니다. 이 문서의 예문 자체는 실행 요청이 아닙니다.

```text
$unit-plan-cad
첨부한 조닝과 내가 지정한 로컬 참조 DWG로 새 단위세대 도면을 작성해줘.
먼저 단위, 경계 의미, 현관과 고정 요소, 벽·단열·창호·레벨 조건을 확인해줘.
스키마1.1이면 room_regions의 outer minus holes를 최종 경계로 써줘.
선택한 조건으로 새 DWG에 상세 작성하고 실제 객체·저장본·화면 검토 결과를 남겨줘.
```

4. 차이를 검토해 스킬 규칙을 수정하고 새 조닝에서 다시 시험합니다. 출력과 검토 기록은 설치 폴더 밖의 jobs에 보관합니다.

## 문서와 검사

- [실제 CAD 자료 안내](CAD-FILES.md)
- [입력 계약](references/input-contract.md) · [작성과 수정](references/workflow.md)
- [CAD 실행 계약](references/cad-execution.md) · [검증 절차](references/benchmark.md)
- [공개판 변경 사항](CHANGELOG.md) · [출처와 라이선스 범위](THIRD_PARTY_NOTICES.md)

```powershell
python scripts/verify_package.py
python scripts/validate_public.py
node tests/test-geometry.cjs
```

검사는 파일/링크/공개 범위와 조닝 계산을 확인합니다. 새 PC의 live CAD 연결, 참조 상세 일치와 인쇄 품질은 이 검사로 확인되지 않습니다.
