// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
import { useState } from 'react'
import { I18nProvider } from './i18n'
import { LaunchContext, type AppView } from './LaunchContext'
import Starfield from './components/Starfield'
import Header from './components/Header'
import Hero from './components/Hero'
import AISpotlight from './components/AISpotlight'
import Stats from './components/Stats'
import Pillars from './components/Pillars'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Why from './components/Why'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import DownloadCTA from './components/DownloadCTA'
import Footer from './components/Footer'
import ReadingExperience from './reading/ReadingExperience'
import OracleExperience from './oracle/OracleExperience'

export default function App() {
  const [view, setView] = useState<'landing' | AppView>('landing')

  const launch = (v: AppView) => {
    setView(v)
    window.scrollTo({ top: 0 })
  }
  const close = () => {
    setView('landing')
    window.scrollTo({ top: 0 })
  }

  return (
    <I18nProvider>
      <LaunchContext.Provider value={launch}>
        <Starfield />
        {view === 'reading' ? (
          <ReadingExperience onClose={close} />
        ) : view === 'oracle' ? (
          <OracleExperience onClose={close} />
        ) : (
          <>
            <Header />
            <main>
              <Hero />
              <AISpotlight />
              <Stats />
              <Pillars />
              <Features />
              <HowItWorks />
              <Why />
              <Pricing />
              <FAQ />
              <DownloadCTA />
            </main>
            <Footer />
          </>
        )}
      </LaunchContext.Provider>
    </I18nProvider>
  )
}
