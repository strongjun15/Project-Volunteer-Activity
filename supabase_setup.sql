-- ================================================================
-- 멘토링 사이트 — Supabase 초기 설정 SQL
-- Supabase 대시보드 → SQL Editor 에 전체를 붙여넣고 Run 하면 끝.
-- ================================================================

-- 1) 학생 진도 테이블 (1차시 페이지 위치 + 퀴즈 점수)
create table if not exists progress (
  student_key  text primary key,          -- 이름 또는 익명 키
  student_name text default '',
  a_page       int  default 0,            -- 1차시에서 보고 있던 페이지 (0부터)
  quiz_correct int  default 0,
  quiz_total   int  default 0,
  updated_at   timestamptz default now()
);

-- 2) 학생 갤러리 테이블 (배포한 사이트 주소)
create table if not exists student_sites (
  id         bigint generated always as identity primary key,
  name       text not null,
  subject    text not null,               -- physics/chemistry/.../math/english
  site_type  text not null,               -- flashcard/quiz/wrongnote/planner/vocab
  url        text not null check (url like 'https://%'),
  created_at timestamptz default now()
);

-- 3) RLS(행 수준 보안) — 교육용 데모 정책
--    수업용이라 익명(anon) 읽기/쓰기를 허용한다.
--    실제 서비스라면 인증을 붙여야 한다는 점을 학생들에게 설명해주세요.
alter table progress      enable row level security;
alter table student_sites enable row level security;

create policy "progress 공개 읽기"  on progress      for select using (true);
create policy "progress 공개 쓰기"  on progress      for insert with check (true);
create policy "progress 공개 수정"  on progress      for update using (true);
create policy "갤러리 공개 읽기"    on student_sites for select using (true);
create policy "갤러리 공개 등록"    on student_sites for insert with check (true);
-- 삭제(delete)는 아무에게도 허용하지 않음 → 장난 방지.
-- 잘못 등록된 항목은 선생님이 대시보드(Table Editor)에서 직접 지우면 됩니다.
