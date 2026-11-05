const APPS = {
  'mab-music': 'https://mab-music.pages.dev',
};

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const m = url.pathname.match(/^\/([a-z0-9-]+)(\/.*)?$/);
  const origin = m && Object.prototype.hasOwnProperty.call(APPS, m[1]) ? APPS[m[1]] : null;
  if (!origin) return next();

  const slug = m[1];
  const rest = m[2];
  if (!rest) {
    url.pathname = `/${slug}/`;
    return Response.redirect(url.toString(), 301);
  }

  const target = origin + rest + url.search;
  const upstream = await fetch(new Request(target, request), { redirect: 'manual' });

  const loc = upstream.headers.get('Location');
  if (loc && upstream.status >= 300 && upstream.status < 400) {
    const u = new URL(loc, target);
    if (u.origin === origin) {
      const res = new Response(null, upstream);
      res.headers.set('Location', `${url.origin}/${slug}${u.pathname}${u.search}${u.hash}`);
      return res;
    }
  }
  return upstream;
}