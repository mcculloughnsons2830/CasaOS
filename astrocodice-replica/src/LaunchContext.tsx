import { createContext, useContext } from 'react'

/** Lets any component (hero, nav, pricing, CTA) open the reading experience. */
export const LaunchContext = createContext<() => void>(() => {})

export function useLaunch() {
  return useContext(LaunchContext)
}
