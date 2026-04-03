"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Com Magic Link, nao precisa de pagina de signup separada.
// O Magic Link cria conta automaticamente se o email nao existe.
export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
