"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";


export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@example.com");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabaseConfigured = isSupabaseConfigured();

  function continueToDemo() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("trading-partner-email", email);
    }
    router.push("/onboarding");
  }

  async function continueWithMagicLink() {
    if (!supabaseConfigured) {
      continueToDemo();
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      continueToDemo();
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    setIsSubmitting(false);
    if (error) {
      setMessage("매직 링크 요청에 실패했습니다. Supabase 설정 또는 허용된 리디렉션 URL을 확인해주세요.");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("trading-partner-email", email);
    }
    setMessage("메일로 로그인 링크를 보냈습니다. 링크를 확인한 뒤 다시 돌아오면 됩니다.");
  }

  async function continueWithGoogle() {
    if (!supabaseConfigured) {
      continueToDemo();
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      continueToDemo();
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      setIsSubmitting(false);
      setMessage("Google 로그인 시작에 실패했습니다. Supabase OAuth 설정을 확인해주세요.");
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <div className="eyebrow">auth</div>
        <h1 className="section-title" style={{ marginTop: 18 }}>이메일 링크 또는 Google로 시작</h1>
        <p className="muted">
          {supabaseConfigured
            ? "Supabase 자격정보가 감지되어 실제 이메일 링크 / Google 로그인을 시작할 수 있습니다."
            : "현재 워크스페이스에서는 Supabase 자격정보가 없어 데모 세션 진입 흐름으로 동작합니다."}
        </p>
        <div className="form-grid" style={{ marginTop: 24 }}>
          <div className="field">
            <label htmlFor="email">이메일</label>
            <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <button className="primary-button" type="button" onClick={continueWithMagicLink} disabled={isSubmitting}>
            {supabaseConfigured ? "이메일 링크 보내기" : "데모 세션으로 계속"}
          </button>
          <button className="secondary-button" type="button" onClick={continueWithGoogle} disabled={isSubmitting}>
            {supabaseConfigured ? "Google로 계속" : "Google 데모 진입"}
          </button>
          <Link className="ghost-button" href="/">랜딩으로 돌아가기</Link>
          {message && <p className="muted">{message}</p>}
        </div>
      </section>
    </main>
  );
}
