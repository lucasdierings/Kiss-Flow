import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Next 16 renomeou a convenção `middleware` para `proxy`.
/**
 * Rotas abertas.
 *
 * A lista anterior era `["/", "/login", ...]` conferida com `startsWith`, e
 * TODO caminho começa com "/" — o proxy liberava o site inteiro e nunca
 * redirecionava ninguém. Por isso a raiz é comparada por igualdade, e só
 * prefixos de verdade usam startsWith.
 */
const PUBLIC_EXACT = new Set(["/", "/landing"]);
const PUBLIC_PREFIXES = ["/login", "/signup", "/api/auth"];

/**
 * Redirecionamento otimista, SEM I/O.
 *
 * Só verifica a assinatura do cookie de sessão. Nada de consultar o banco:
 * o matcher dispara também em prefetch de <Link> e em payload RSC, e a
 * versão anterior fazia DUAS queries no Supabase a cada navegação.
 *
 * Isto é conforto de navegação, NÃO fronteira de segurança — a autorização
 * de verdade acontece em cada route handler, via requireUser().
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_EXACT.has(pathname) ||
    PUBLIC_PREFIXES.some((route) => pathname.startsWith(route));

  if (isPublic) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
