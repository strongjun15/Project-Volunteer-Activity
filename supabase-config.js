/* ================================================================
   Supabase 연결 설정 — 선생님(운영자)만 수정하는 파일
   ================================================================
   1. https://supabase.com 에서 무료 프로젝트를 만든다
   2. supabase_setup.sql 내용을 SQL Editor에 붙여넣어 실행한다
   3. Project Settings → API 에서 아래 두 값을 복사해 붙여넣는다
      - url     : Project URL  (예: https://abcd1234.supabase.co)
      - anonKey : anon public 키

   두 값이 비어 있으면 사이트는 저장 기능 없이(localStorage만)
   그대로 동작한다. 갤러리 탭에는 안내 문구가 표시된다.

   ⚠️ anon 키는 공개되어도 되는 키다. 단, service_role 키는
      절대로 이 파일에 넣으면 안 된다!
   ================================================================ */
window.SUPABASE_CONFIG = {
  url: '',
  anonKey: ''
};
