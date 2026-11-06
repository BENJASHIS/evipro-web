'use client'
import { useSyncExternalStore } from 'react'
import { BOTTLE_PATH, memberReturnPath } from './member-return'

const subscribe = (notify: () => void) => {
  window.addEventListener('popstate', notify)
  return () => window.removeEventListener('popstate', notify)
}
export function useAuthSearch() {
  return useSyncExternalStore(subscribe, () => window.location.search, () => '')
}
export function useBottleEntry() {
  const search = useAuthSearch()
  return memberReturnPath(new URLSearchParams(search).get('next')) === BOTTLE_PATH
}
export const BOTTLE_NEXT = `?next=${encodeURIComponent(BOTTLE_PATH)}`
