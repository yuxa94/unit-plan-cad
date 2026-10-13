# Unit Plan CAD

CAD MCP로 조닝을 읽고 단위세대 상세 평면을 작성·수정하는 **로컬 에이전트용 스킬 공개판**입니다.

## 포함 범위

- SKILL.md와 입력 해석·상세 작성·수정·검토 절차
- AutoCAD MCP 소스와 LISP dispatcher, 연결·새 문서·작업 guard 도구
- 실 배치, 조절점 크기 변경, 레이어 순서, 겹침 차감이 가능한 오프라인 HTML 편집기
- 실제 프로젝트와 무관한 가상 조닝 DXF/JSON 8종
- 설치 및 검증 스크립트

**실제 프로젝트 DWG/XREF, 추출 부품, 원본 형상 덤프, 도면 스크린샷, 작업 결과와 개인 경로는 공개하지 않습니다.** 자동 설계 엔진이나 시공용 도면 생성의 완성 인증이 아닙니다. 자신의 참조 자료와 설계 검토가 필요합니다.

## 빠른 시작

```powershell
git clone https://github.com/yuxa94/unit-plan-cad.git
cd unit-plan-cad
python scripts/verify_package.py
powershell -File scripts/Install.ps1 -PythonPath "C:\path\to\python.exe"
```

기존 unit-plan-cad 설치본은 덮어쓰지 않습니다. 같은 이름의 MCP 서버를 중복 연결하지 마세요. [설치 안내](references/installation.md)에 따라 생성된 MCP 설정을 반영하고 AutoCAD의 APPLOAD로 .setup/load-unit-plan.lsp를 로드합니다. 일반 AutoCAD의 Windows COM 도우미 기준이며 LT와 다른 PC의 연결은 별도 검증이 필요합니다.

## 사용 흐름

1. [조닝 편집기](assets/examples/zoning-editor/index.html)를 로컬에서 열어 실을 배치하고 JSON을 저장합니다. GitHub 파일 뷰에서는 실행되지 않으므로 저장소를 내려받으세요.
2. [자신의 참조 DWG 프로파일](references/project-profile.md)을 준비합니다. 이 공개판에는 특정 프로젝트 스타일이 설정되어 있지 않습니다.
3. Codex에 조닝을 첨부하고 아래처럼 요청합니다.

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
