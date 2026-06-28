import { I18nProvider } from './i18n'
import Starfield from './components/Starfield'
import Header from './components/Header'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Pillars from './components/Pillars'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Why from './components/Why'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import DownloadCTA from './components/DownloadCTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <I18nProvider>
      <Starfield />
      <Header />
      <main>
        <Hero />
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
    </I18nProvider>
  )
}
