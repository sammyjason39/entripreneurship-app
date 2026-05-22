import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession() reads the JWT locally — getUser() calls Supabase Auth on every request (~100–300ms).
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/auth');
  const isApiRoute = path.startsWith('/api/');
  const isPublicApi =
    path.startsWith('/api/health') ||
    path.startsWith('/api/auth/whatsapp/') ||
    path.startsWith('/_next') ||
    path.startsWith('/icons');

  // API routes return JSON 401 from route handlers — never redirect to login HTML
  if (!user && !isAuthRoute && !isApiRoute && !isPublicApi && path !== '/offline') {
    const hasStatic =
      path.endsWith('.png') ||
      path.endsWith('.json') ||
      path.endsWith('.ico') ||
      path.startsWith('/manifest');
    if (!hasStatic) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
  }

  if (user && isAuthRoute && path !== '/auth/callback') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
