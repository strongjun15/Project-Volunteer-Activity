# 배포 가이드 — 이 사이트를 진짜 인터넷 주소로 올리기

학생들에게 가르치는 STEP 6(Supabase)·STEP 7(Vercel)을 이 교재 사이트 자체에 적용하는 절차입니다.
소요 시간은 처음 해도 15분 정도예요.

## 1. Supabase 연결 (진도 저장 + 갤러리 켜기)

1. https://supabase.com 에서 무료 계정 생성 → **New project**
2. 왼쪽 메뉴 **SQL Editor** → `supabase_setup.sql` 파일 내용 전체를 붙여넣고 **Run**
3. **Project Settings → API** 에서 두 값을 복사
   - Project URL (예: `https://abcd1234.supabase.co`)
   - `anon` `public` 키
4. 이 폴더의 `supabase-config.js` 를 열어 두 값을 붙여넣고 저장

```js
window.SUPABASE_CONFIG = {
  url: 'https://abcd1234.supabase.co',
  anonKey: 'eyJhbGci...'
};
```

5. `index.html` 을 새로고침 → **(C) 갤러리** 탭에서 안내 문구가 사라지고 등록 폼이 보이면 성공

연결되면 자동으로 켜지는 것:
- 학생별 진도·퀴즈 점수가 2초 간격으로 저장됨
- 멘토 모드(`index.html?mode=mentor`)의 갤러리 탭에 **학생 진도 현황판** 표시
- 학생들이 배포한 사이트 주소를 갤러리에 등록·구경 가능

⚠️ `service_role` 키는 절대 `supabase-config.js` 에 넣지 마세요. `anon` 키만 공개 가능합니다.

## 2. Vercel 배포

터미널에서 이 폴더로 이동한 뒤:

```bash
npm install -g vercel
vercel login          # 이메일 인증
vercel --prod         # 질문에는 전부 엔터(기본값)로 답해도 됨
```

끝나면 `https://<프로젝트명>.vercel.app` 주소가 출력됩니다.
이후 파일을 수정했을 때는 `vercel --prod` 한 번이면 재배포됩니다.

정적 사이트라 빌드 설정이 필요 없습니다 (Framework Preset: **Other**).

## 3. 배포 후 확인 체크리스트

- [ ] `https://…vercel.app` 접속 → 학생 화면이 뜨나?
- [ ] `https://…vercel.app/?mode=mentor` → MENTOR MODE 배지 + 멘토 노트가 보이나?
- [ ] (C) 갤러리 탭 → 등록 폼이 보이나? (안내 문구가 보이면 Supabase 설정 확인)
- [ ] 시크릿 창에서 접속해 퀴즈 하나 풀기 → Supabase 대시보드 Table Editor의 `progress` 테이블에 행이 생기나?

## 문제 해결

| 증상 | 원인·해결 |
|---|---|
| 갤러리에 "저장소가 연결되지 않았어요" | `supabase-config.js` 의 url/anonKey 미입력 또는 오타 |
| 등록 시 "등록에 실패했어요" | SQL Editor에서 `supabase_setup.sql` 을 실행했는지 확인 (RLS 정책 포함) |
| 진도 현황판이 비어 있음 | 학생이 아직 접속 전이거나, 멘토 모드가 아님 (`?mode=mentor` 확인) |
