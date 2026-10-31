import { useEffect, useReducer, useState } from 'react';
import { subscribe, t, tEn, type TFn } from './index';

/**
 * Hook terjemahan untuk komponen React.
 * Render pertama = Inggris (cocok dengan HTML server, tanpa hydration error),
 * setelah mount memakai bahasa aktif dan ikut berubah saat bahasa diganti.
 */
export function useT(): TFn {
  const [live, setLive] = useState(false);
  const [, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    setLive(true);
    return subscribe(bump);
  }, []);
  return live ? t : tEn;
}
