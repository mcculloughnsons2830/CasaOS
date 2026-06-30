import { createContext, useContext } from 'react'

export type AppView = 'reading' | 'oracle'

/** Lets any component open one of the app's experiences (chart reading, or AENIGMA). */
export const LaunchContext = createContext<(view: AppView) => void>(() => {})

export function useLaunch() {
  return useContext(LaunchContext)
}
