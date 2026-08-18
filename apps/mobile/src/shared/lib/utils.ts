import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 웹 `shared/lib/utils` 와 같다. NativeWind 도 className 문자열을 받으므로 그대로 쓴다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
