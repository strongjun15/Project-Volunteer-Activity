# 멘토링 연구 프로젝트 — 옥쌤과 아이들

중학생 대상 바이브 코딩 입문 멘토링 자료 모음입니다. 아래 순서대로 진행하도록 설계되어 있어요.

## 파일 구성 (2026-07 리팩터링 반영)

| 파일 | 용도 |
|---|---|
| `index.html` | **단일 소스.** 학생/멘토 콘텐츠가 모두 들어 있고, 기본은 학생 화면 |
| `index.html?mode=mentor` | 같은 파일을 멘토 모드로 — 멘토 노트 9개 + MENTOR MODE 배지 표시 |
| `student.html` / `mentor.html` | 예전 링크 호환용 리다이렉트 스텁 (각각 index.html / index.html?mode=mentor로 이동) |
| `script.js` / `style.css` | 공용 로직·스타일 |
| `index_old_backup.html` | 리팩터링 전 index.html 백업 (확인 후 삭제 가능) |
| `supabase-config.js` | Supabase 연결 설정 — 값을 넣으면 진도 저장·갤러리가 켜짐 |
| `supabase_setup.sql` | Supabase SQL Editor에 붙여넣는 테이블·정책 생성 스크립트 |
| `DEPLOY.md` | Supabase 연결 + Vercel 배포 절차 (15분 소요) |

**외부 라이브러리/빌드 과정이 필요 없습니다.** 파일을 더블클릭해서 브라우저로 열면 바로 실행되고, 코드를 수정한 뒤에도 저장하고 새로고침만 하면 바로 반영돼요.

콘텐츠를 수정할 때는 이제 **index.html 한 곳만** 고치면 됩니다. 멘토 전용 내용은 `class="mentor-panel"` 블록 안에 쓰면 학생 화면에서는 자동으로 숨겨져요.

진도(보던 탭·페이지), 다크모드, 작성한 CLAUDE.md는 localStorage에 저장되어 새로고침해도 이어집니다.

## 진행 순서 (제안)

1. `OT_바이브코딩.pptx`로 오프닝
2. `mentoring_site.html`에서 개념 체험 (규칙 실험실 → 비교 체험 → 나만의 규칙)
3. `study_site_full_guide.html`에서 실제 제작 — 터미널에서 Claude Code를 켜는 것부터 CLAUDE.md 작성, Plan Mode, Hook, Supabase 연결, Vercel 배포까지 8단계

## `study_site_full_guide.html` 진행 단계 (STEP1~8)

| STEP | 내용 | 하네스 축 |
|---|---|---|
| 1 | Git 설치 → PowerShell 재실행 → Git 경로 등록 → Claude Code·Superpowers 순차 설치 | 구조 |
| 2 | CLAUDE.md 파일 작성 (전역 vs 프로젝트 규칙 구조) | 맥락 |
| 3 | Plan Mode(`/plan`)로 먼저 설계 — AI가 질문하고, 승인 후 실행 | 계획 |
| 4 | 결과 확인 + 구체적 피드백 + 기능 단계적 추가 | 실행·검증 |
| 5 | Hook으로 안전장치 만들기 (비밀키 노출 자동 차단) | 구조 심화 |
| 6 | Supabase를 MCP로 연결해 실제 테이블·데이터 생성 | 맥락 확장 |
| 7 | Vercel CLI로 실제 배포 | 개선 |
| 8 | 하네스 6축 총정리 + 카파시 4원칙 + 다음 과제 | 마무리 |

과목(물리/화학/생명과학/지구과학/정보/수학/영어) × 사이트 종류(암기카드/문제풀이/오답노트/공부계획+타이머/단어장) 조합에 따라 CLAUDE.md 내용, Plan Mode 프롬프트, Supabase 테이블/데이터가 전부 자동으로 채워집니다. STEP 2·3·5·7 끝에는 이해도 확인용 체크 퀴즈가 들어 있어요.

파일 안에 크게 두 화면이 있어요.

- `#selectScreen` — 이름 입력 + 과목(물리/화학/생명과학/지구과학/정보/수학/영어) + 사이트 종류(암기카드/문제풀이/오답노트/공부계획+타이머/단어장) 선택
- `#guideScreen` — 선택한 조합에 맞춰 STEP1~8이 채워지는 화면

콘텐츠는 JS의 두 데이터 객체가 전부 관리합니다. 코드 안에 상세 주석을 달아뒀어요.

```js
const SUBJECTS = { physics: {...}, chemistry: {...}, ... }  // 과목별 콘텐츠 (카드/문제/할일/아이디어)
const TYPES    = { flashcard: {...}, quiz: {...}, ... }     // 사이트 종류별 프롬프트 + DB 테이블 정의
```

**새 과목을 추가하고 싶다면** → `SUBJECTS`에 항목 추가 + `<div class="subject-grid">`에 카드 하나 추가
**새 사이트 종류를 추가하고 싶다면** → `TYPES`에 항목 추가(`dbTable`/`dbColumns` 포함) + `startGuide()` 안의 STEP6 분기(`if(pickedType === ...)`)에 미리보기·DB 프롬프트 로직 추가 + `<div class="type-grid">`에 카드 하나 추가

디자인 토큰(색상 등)은 파일 상단 `:root` CSS 변수에 모여 있어요. 과목을 고르면 `--accent`/`--accent-light`가 JS로 바뀌면서 테마 색이 바뀌는 구조입니다.

## 배포 (STEP7에서 학생들이 실제로 하는 것)

Claude Code에게 "Vercel로 배포해줘"라고 부탁하면 CLI 설치부터 로그인, 배포까지 알아서 진행해서 실제 `.vercel.app` 주소가 생성됩니다. 별도 프로그램 설치나 회원가입 절차를 미리 준비해두면 좋아요.

## 함께 작업하기 (Git)

이 폴더는 git 저장소로 초기화되어 있어요. 팀원이 이어서 작업하려면:

1. 이 폴더 전체를 압축 파일로 받거나, GitHub 저장소로 올려서 공유
2. GitHub에 올리는 경우:
   ```bash
   git remote add origin <팀 저장소 주소>
   git push -u origin main
   ```
3. 이후로는 각자 수정하고 `git add . && git commit -m "설명" && git push`로 반영
4. 충돌 없이 함께 작업하려면 기능별로 브랜치를 나눠서 작업하는 걸 추천해요 (예: `feature/새과목-추가`)

## 오늘까지의 변경 이력

`git log`로 지금까지의 작업 단위를 확인할 수 있어요.
