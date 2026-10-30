/** Bangun URL yang aman terhadap `base` Astro (mis. jika suatu hari dipasang di sub-path). */
export const withBase = (path = ''): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
