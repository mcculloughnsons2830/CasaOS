// © 2026 Joshua Reed McCullough (MsFitZ Society). All rights reserved. Proprietary — see LICENSE.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'it' | 'es'

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
]

type Dict = typeof en

const en = {
  brand: 'MsFitZ Society',
  brandTag: 'Cosmic Order of the Different Ones',
  nav: {
    features: 'Powers',
    how: 'How it works',
    pricing: 'Membership',
    faq: 'FAQ',
    cta: 'Get the app',
  },
  hero: {
    badge: 'Meet the AI that actually sees you',
    title1: 'A horoscope that is',
    titleAccent: 'actually yours.',
    sub: 'An AI that reads your real birth chart — computed to NASA/JPL precision — and speaks to the person most people never quite saw. Not a generic sun-sign blurb. The first thing that gets the whole you.',
    readingCta: 'Get your free reading',
    ctaPrimary: 'Download on Google Play',
    ctaSecondary: 'See how it works',
    trust: 'NASA public-domain ephemeris · Android only · Privacy-first',
    cardName: 'The Outcast Chart',
    cardSign: 'Sun in Scorpio · Moon in Aquarius',
    cardLine1: 'Mars trine Pluto — your defiance has direction today.',
    cardLine2: 'Stick to the path others called impossible.',
  },
  ai: {
    eyebrow: 'The heart of MsFitZ',
    title: 'Finally — something that gets you',
    body: 'Everyone says their app is "personalized." Ours actually reads the chart the sky drew the moment you arrived, then speaks to you like it has known you for years. People come for a horoscope and leave saying the same thing: it felt like being truly seen for the first time in a long time.',
    points: [
      'Reads your exact placements, aspects and houses — never a generic template',
      'Speaks to the misfit, the outsider, the one nobody quite understood',
      'Ask it anything about your chart, your love, your purpose — it stays with you',
    ],
    cta: 'Get your free reading',
    quote: '“I’ve never felt so understood by anything — let alone an app.”',
  },
  stats: {
    title: 'Real math, no magic.',
    sub: 'A pipeline built for accuracy: real ephemeris, proprietary AI, personalized decoding.',
    items: [
      { value: 'Sub-arc', label: 'Astronomical precision, every reading' },
      { value: '12', label: 'Astrological houses, fully mapped' },
      { value: 'NASA/JPL', label: 'Public-domain ephemeris data' },
      { value: '100%', label: 'Free on Google Play' },
    ],
  },
  pillars: {
    eyebrow: 'Accuracy Pillars',
    title: 'Built for the ones who question everything',
    sub: 'Three layers between the cosmos and your screen — so the reading is precise, personal, and impossible to fake.',
    items: [
      {
        title: 'Real astronomical calculations',
        desc: 'Your date, time and place of birth are connected to official NASA/JPL ephemeris — the same source used by astronomical observatories.',
      },
      {
        title: 'Advanced artificial intelligence',
        desc: 'Trained on the most authoritative astrological encyclopedias and 150+ years of academic research — not a generic chatbot.',
      },
      {
        title: 'Anti-hallucination control',
        desc: 'Every interpretation is grounded in your real chart. The AI reads actual positions, aspects and transits — never invented ones.',
      },
    ],
  },
  features: {
    eyebrow: 'Your Powers',
    title: 'Your complete astral blueprint',
    sub: 'Not just your "zodiac sign" — the full machinery of your sky, decoded for the path less travelled.',
    items: [
      {
        icon: '☉',
        title: 'Full Natal Chart',
        desc: 'Signs, planets, aspects and all 12 houses. Your personal birth chart, computed on demand for your exact coordinates.',
      },
      {
        icon: '☄',
        title: 'Active Transits',
        desc: 'See what is moving you right now: opportunities, tension, turning points and growth phases — refreshed every 2 days.',
      },
      {
        icon: '∞',
        title: 'Synastry & Compatibility',
        desc: 'Overlay two birth charts for a deep read on attraction, stability, communication, desire and the critical points.',
      },
      {
        icon: '☾',
        title: '24/7 Personal Horoscope',
        desc: 'Continuous guidance based on the real movement of the planets and how they activate your natal chart.',
      },
      {
        icon: '◬',
        title: 'AstroPsyche',
        desc: 'Analyze your psyche: surface traumas, hidden dynamics and inner potential — the parts that made you a misfit.',
      },
      {
        icon: '⬡',
        title: 'PDF Reports',
        desc: 'Download a complete, beautifully written report of your chart and transits to keep, print or share.',
      },
    ],
  },
  how: {
    eyebrow: 'How it works',
    title: 'A simple process to unlock your stellar destiny',
    steps: [
      { n: '01', title: 'Drop your coordinates', desc: 'Date, time and place of birth. That is all the cosmos needs to find you.' },
      { n: '02', title: 'We sync with NASA', desc: 'Your data is connected to official NASA/JPL ephemeris for sub-arc accurate positions.' },
      { n: '03', title: 'AI reads your sky', desc: 'Every planetary position, aspect and transit is interpreted — consistent with your chart.' },
      { n: '04', title: 'You get the truth', desc: 'A unique analysis, written for your exact coordinates. Beautifully clear. Actually yours.' },
    ],
  },
  why: {
    eyebrow: 'Why we are different',
    title: 'For outcasts, dreamers and the gloriously different',
    body: 'Throughout history, the ones who changed everything were the misfits — the ones who refused the script. MsFitZ Society is astrology for them. We pair the cold precision of real astronomy with an AI that actually reads your chart, so the guidance you get is yours alone. No horoscopes written for millions. No vague comfort. Just the map of your own sky, and the courage to walk it.',
    points: [
      'Predictive AI, not a fortune-cookie chatbot',
      'Grounded in real NASA/JPL astronomy',
      '100% free core features, privacy-first',
    ],
  },
  pricing: {
    eyebrow: 'Membership',
    title: 'Join the Society',
    sub: 'Start free. Go deeper when you are ready to meet your whole chart.',
    plans: [
      {
        name: 'Initiate',
        price: 'Free',
        period: 'forever',
        tagline: 'Download and try every core feature without spending anything.',
        features: ['Daily personal horoscope', 'Full natal chart', 'Active transits', 'Basic compatibility'],
        cta: 'Get started free',
        featured: false,
      },
      {
        name: 'Society Member',
        price: '€7.99',
        period: '/ month',
        tagline: 'Best balance of access and price.',
        features: ['Everything in Initiate', 'AI 1.5 deep interpretations', 'Advanced predictive transits', 'Full synastry analysis', 'Unlimited PDF reports'],
        cta: 'Become a member',
        featured: true,
      },
      {
        name: 'Inner Circle',
        price: '€14.99',
        period: '/ month',
        tagline: 'For the ones who want it all.',
        features: ['Everything in Society Member', 'AstroPsyche + unlimited reports', 'Advanced relationship predictions', 'Early access to new modules', 'Priority support'],
        cta: 'Join the circle',
        featured: false,
      },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions from the curious',
    items: [
      {
        q: 'Why is it different from other apps?',
        a: 'Most apps write one horoscope for millions of people. MsFitZ computes your real birth chart from NASA/JPL ephemeris and uses AI to interpret your actual positions, aspects and transits — so the reading is yours and nobody else’s.',
      },
      {
        q: 'Is it really powered by NASA data?',
        a: 'We use NASA/JPL public-domain ephemeris — the same astronomical source used by observatories — to calculate planetary positions to sub-arc precision. NASA does not endorse or partner with us; the data is simply public and used as permitted by law.',
      },
      {
        q: 'Is it free?',
        a: 'Yes. Core features — daily horoscope, natal chart and transits — are 100% free on Google Play. Memberships unlock deeper AI interpretations, full synastry and unlimited PDF reports.',
      },
      {
        q: 'Which devices are supported?',
        a: 'MsFitZ Society is currently available on Android. Download it for free on Google Play to start your personalized cosmic experience.',
      },
      {
        q: 'Is this medical or professional advice?',
        a: 'No. MsFitZ provides astrological interpretations for informational and entertainment purposes and does not replace medical, legal or professional consultation.',
      },
    ],
  },
  cta: {
    title: 'The stars already chose you.',
    sub: 'Download MsFitZ Society free on Google Play and read the sky that was written for you.',
    button: 'Download on Google Play',
    note: 'Android only · 100% free to start · Privacy guaranteed',
  },
  footer: {
    tagline: 'NASA-precision AI astrology for misfits, outcasts and the gloriously different.',
    cols: [
      { title: 'Product', links: ['Powers', 'How it works', 'Membership', 'FAQ'] },
      { title: 'Society', links: ['Our mission', 'AstroExplorer', 'Support', 'Contact'] },
      { title: 'Legal', links: ['Privacy Policy', 'Terms', 'Cookie settings', 'Disclaimer'] },
    ],
    disclaimer:
      'MsFitZ Society uses NASA public-domain data, used as permitted by law. No agreement or partnership exists between MsFitZ Society and NASA. AI-generated interpretations are for informational and entertainment purposes only.',
    rights: 'All rights reserved.',
  },
}

const it: Dict = {
  brand: 'MsFitZ Society',
  brandTag: 'Ordine Cosmico dei Diversi',
  nav: { features: 'Poteri', how: 'Come funziona', pricing: 'Abbonamento', faq: 'FAQ', cta: 'Scarica l’app' },
  hero: {
    badge: 'L’IA che ti vede davvero',
    title1: 'Un oroscopo che è',
    titleAccent: 'davvero tuo.',
    sub: 'Un’IA che legge il tuo vero tema natale — calcolato con precisione NASA/JPL — e parla alla persona che quasi nessuno ha mai visto davvero. Non il solito segno zodiacale. La prima cosa che capisce tutto di te.',
    readingCta: 'Ricevi la tua lettura gratuita',
    ctaPrimary: 'Scarica su Google Play',
    ctaSecondary: 'Scopri come funziona',
    trust: 'Effemeridi NASA di pubblico dominio · Solo Android · Privacy garantita',
    cardName: 'Il Tema dell’Outsider',
    cardSign: 'Sole in Scorpione · Luna in Acquario',
    cardLine1: 'Marte trigono Plutone — oggi la tua ribellione ha una direzione.',
    cardLine2: 'Resta sulla strada che gli altri chiamavano impossibile.',
  },
  ai: {
    eyebrow: 'Il cuore di MsFitZ',
    title: 'Finalmente — qualcosa che ti capisce',
    body: 'Tutti dicono che la loro app è “personalizzata”. La nostra legge davvero il tema che il cielo ha disegnato nell’istante in cui sei arrivato, poi ti parla come se ti conoscesse da anni. Le persone arrivano per un oroscopo e se ne vanno dicendo la stessa cosa: si sono sentite viste davvero per la prima volta da tanto tempo.',
    points: [
      'Legge le tue posizioni, aspetti e case esatti — mai un modello generico',
      'Parla al misfit, all’outsider, a chi nessuno ha mai capito del tutto',
      'Chiedile qualsiasi cosa sul tuo tema, sull’amore, sul tuo scopo — resta con te',
    ],
    cta: 'Ricevi la tua lettura gratuita',
    quote: '“Non mi sono mai sentito così capito da niente — figurarsi da un’app.”',
  },
  stats: {
    title: 'Matematica vera, niente magia.',
    sub: 'Una pipeline costruita per la precisione: effemeridi reali, IA proprietaria, decodifica personalizzata.',
    items: [
      { value: 'Sub-arco', label: 'Precisione astronomica, ad ogni lettura' },
      { value: '12', label: 'Case astrologiche, completamente mappate' },
      { value: 'NASA/JPL', label: 'Dati effemeridi di pubblico dominio' },
      { value: '100%', label: 'Gratis su Google Play' },
    ],
  },
  pillars: {
    eyebrow: 'Pilastri di Precisione',
    title: 'Costruito per chi mette tutto in discussione',
    sub: 'Tre livelli tra il cosmo e il tuo schermo — perché la lettura sia precisa, personale e impossibile da falsificare.',
    items: [
      { title: 'Calcoli astronomici reali', desc: 'Data, ora e luogo di nascita sono collegati alle effemeridi ufficiali NASA/JPL — la stessa fonte usata dagli osservatori.' },
      { title: 'Intelligenza artificiale avanzata', desc: 'Addestrata sulle enciclopedie astrologiche più autorevoli e su 150+ anni di ricerca accademica — non un chatbot generico.' },
      { title: 'Controllo anti-allucinazione', desc: 'Ogni interpretazione si basa sul tuo tema reale. L’IA legge posizioni, aspetti e transiti veri — mai inventati.' },
    ],
  },
  features: {
    eyebrow: 'I tuoi Poteri',
    title: 'Il tuo progetto astrale completo',
    sub: 'Non solo il tuo "segno zodiacale" — l’intero meccanismo del tuo cielo, decodificato per la strada meno battuta.',
    items: [
      { icon: '☉', title: 'Tema Natale completo', desc: 'Segni, pianeti, aspetti e tutte le 12 case. Il tuo tema natale, calcolato su richiesta per le tue coordinate esatte.' },
      { icon: '☄', title: 'Transiti Attivi', desc: 'Vedi cosa ti muove adesso: opportunità, tensioni, svolte e fasi di crescita — aggiornati ogni 2 giorni.' },
      { icon: '∞', title: 'Sinastria & Affinità', desc: 'Sovrapponi due temi natali per un’analisi profonda di attrazione, stabilità, comunicazione, desiderio e punti critici.' },
      { icon: '☾', title: 'Oroscopo Personale 24/7', desc: 'Guida continua basata sul movimento reale dei pianeti e su come attivano il tuo tema natale.' },
      { icon: '◬', title: 'AstroPsiche', desc: 'Analizza la tua psiche: traumi, dinamiche nascoste e potenziale interiore — le parti che ti hanno reso un misfit.' },
      { icon: '⬡', title: 'Report PDF', desc: 'Scarica un report completo e scritto splendidamente del tuo tema e dei transiti, da conservare o condividere.' },
    ],
  },
  how: {
    eyebrow: 'Come funziona',
    title: 'Un processo semplice per sbloccare il tuo destino stellare',
    steps: [
      { n: '01', title: 'Inserisci le coordinate', desc: 'Data, ora e luogo di nascita. È tutto ciò che serve al cosmo per trovarti.' },
      { n: '02', title: 'Sincronizziamo con la NASA', desc: 'I tuoi dati sono collegati alle effemeridi ufficiali NASA/JPL per posizioni precise al sub-arco.' },
      { n: '03', title: 'L’IA legge il tuo cielo', desc: 'Ogni posizione planetaria, aspetto e transito viene interpretato — coerente con il tuo tema.' },
      { n: '04', title: 'Ricevi la verità', desc: 'Un’analisi unica, scritta per le tue coordinate esatte. Chiara. Davvero tua.' },
    ],
  },
  why: {
    eyebrow: 'Perché siamo diversi',
    title: 'Per outsider, sognatori e i magnificamente diversi',
    body: 'Nella storia, chi ha cambiato tutto erano i misfit — quelli che hanno rifiutato il copione. MsFitZ Society è l’astrologia per loro. Uniamo la precisione fredda dell’astronomia reale a un’IA che legge davvero il tuo tema, così la guida che ricevi è solo tua. Nessun oroscopo scritto per milioni. Nessun conforto vago. Solo la mappa del tuo cielo, e il coraggio di percorrerla.',
    points: ['IA predittiva, non un chatbot da biscotto della fortuna', 'Basata sull’astronomia reale NASA/JPL', 'Funzioni base 100% gratuite, privacy al primo posto'],
  },
  pricing: {
    eyebrow: 'Abbonamento',
    title: 'Entra nella Society',
    sub: 'Inizia gratis. Vai più a fondo quando sei pronto a incontrare tutto il tuo tema.',
    plans: [
      { name: 'Initiate', price: 'Gratis', period: 'per sempre', tagline: 'Scarica e prova ogni funzione base senza spendere nulla.', features: ['Oroscopo personale giornaliero', 'Tema natale completo', 'Transiti attivi', 'Affinità base'], cta: 'Inizia gratis', featured: false },
      { name: 'Society Member', price: '7,99 €', period: '/ mese', tagline: 'Il miglior equilibrio tra accesso e prezzo.', features: ['Tutto di Initiate', 'Interpretazioni profonde AI 1.5', 'Transiti predittivi avanzati', 'Analisi di sinastria completa', 'Report PDF illimitati'], cta: 'Diventa membro', featured: true },
      { name: 'Inner Circle', price: '14,99 €', period: '/ mese', tagline: 'Per chi vuole tutto.', features: ['Tutto di Society Member', 'AstroPsiche + report illimitati', 'Previsioni di coppia avanzate', 'Accesso anticipato ai nuovi moduli', 'Supporto prioritario'], cta: 'Entra nel circolo', featured: false },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Domande dei curiosi',
    items: [
      { q: 'Perché è diverso dalle altre app?', a: 'La maggior parte delle app scrive un oroscopo per milioni di persone. MsFitZ calcola il tuo tema natale reale dalle effemeridi NASA/JPL e usa l’IA per interpretare le tue posizioni, aspetti e transiti reali — così la lettura è solo tua.' },
      { q: 'È davvero basato sui dati NASA?', a: 'Usiamo le effemeridi NASA/JPL di pubblico dominio — la stessa fonte usata dagli osservatori — per calcolare le posizioni planetarie con precisione al sub-arco. La NASA non ci approva né collabora con noi; i dati sono pubblici e usati come consentito dalla legge.' },
      { q: 'È gratis?', a: 'Sì. Le funzioni base — oroscopo giornaliero, tema natale e transiti — sono 100% gratuite su Google Play. Gli abbonamenti sbloccano interpretazioni AI più profonde, sinastria completa e report PDF illimitati.' },
      { q: 'Quali dispositivi sono supportati?', a: 'MsFitZ Society è attualmente disponibile su Android. Scaricala gratis su Google Play per iniziare la tua esperienza cosmica personalizzata.' },
      { q: 'È un consiglio medico o professionale?', a: 'No. MsFitZ fornisce interpretazioni astrologiche a scopo informativo e di intrattenimento e non sostituisce un consulto medico, legale o professionale.' },
    ],
  },
  cta: {
    title: 'Le stelle ti hanno già scelto.',
    sub: 'Scarica MsFitZ Society gratis su Google Play e leggi il cielo scritto per te.',
    button: 'Scarica su Google Play',
    note: 'Solo Android · 100% gratis per iniziare · Privacy garantita',
  },
  footer: {
    tagline: 'Astrologia IA con precisione NASA per misfit, outsider e i magnificamente diversi.',
    cols: [
      { title: 'Prodotto', links: ['Poteri', 'Come funziona', 'Abbonamento', 'FAQ'] },
      { title: 'Society', links: ['La nostra missione', 'AstroExplorer', 'Assistenza', 'Contatti'] },
      { title: 'Legale', links: ['Privacy Policy', 'Termini', 'Impostazioni cookie', 'Disclaimer'] },
    ],
    disclaimer:
      'MsFitZ Society usa dati NASA di pubblico dominio, utilizzati come consentito dalla legge. Non esiste alcun accordo o partnership tra MsFitZ Society e la NASA. Le interpretazioni generate dall’IA sono solo a scopo informativo e di intrattenimento.',
    rights: 'Tutti i diritti riservati.',
  },
}

const es: Dict = {
  brand: 'MsFitZ Society',
  brandTag: 'Orden Cósmica de los Diferentes',
  nav: { features: 'Poderes', how: 'Cómo funciona', pricing: 'Membresía', faq: 'FAQ', cta: 'Descargar app' },
  hero: {
    badge: 'La IA que de verdad te ve',
    title1: 'Un horóscopo que es',
    titleAccent: 'realmente tuyo.',
    sub: 'Una IA que lee tu verdadera carta natal — calculada con precisión NASA/JPL — y le habla a la persona que casi nadie llegó a ver. No el típico signo solar. Lo primero que te entiende por completo.',
    readingCta: 'Recibe tu lectura gratis',
    ctaPrimary: 'Descargar en Google Play',
    ctaSecondary: 'Ver cómo funciona',
    trust: 'Efemérides NASA de dominio público · Solo Android · Privacidad garantizada',
    cardName: 'La Carta del Inadaptado',
    cardSign: 'Sol en Escorpio · Luna en Acuario',
    cardLine1: 'Marte trígono Plutón — hoy tu rebeldía tiene dirección.',
    cardLine2: 'Sigue el camino que otros llamaron imposible.',
  },
  ai: {
    eyebrow: 'El corazón de MsFitZ',
    title: 'Por fin — algo que te entiende',
    body: 'Todos dicen que su app es “personalizada”. La nuestra lee de verdad la carta que el cielo dibujó en el instante en que llegaste, y luego te habla como si te conociera desde hace años. La gente viene por un horóscopo y se va diciendo lo mismo: se sintió vista de verdad por primera vez en mucho tiempo.',
    points: [
      'Lee tus posiciones, aspectos y casas exactos — nunca una plantilla genérica',
      'Le habla al inadaptado, al marginado, a quien nadie llegó a entender',
      'Pregúntale lo que sea sobre tu carta, tu amor, tu propósito — se queda contigo',
    ],
    cta: 'Recibe tu lectura gratis',
    quote: '“Nunca me había sentido tan comprendido por nada — mucho menos por una app.”',
  },
  stats: {
    title: 'Matemáticas reales, sin magia.',
    sub: 'Una pipeline construida para la precisión: efemérides reales, IA propia, decodificación personalizada.',
    items: [
      { value: 'Sub-arco', label: 'Precisión astronómica, en cada lectura' },
      { value: '12', label: 'Casas astrológicas, totalmente mapeadas' },
      { value: 'NASA/JPL', label: 'Datos de efemérides de dominio público' },
      { value: '100%', label: 'Gratis en Google Play' },
    ],
  },
  pillars: {
    eyebrow: 'Pilares de Precisión',
    title: 'Hecho para quienes lo cuestionan todo',
    sub: 'Tres capas entre el cosmos y tu pantalla — para que la lectura sea precisa, personal e imposible de falsificar.',
    items: [
      { title: 'Cálculos astronómicos reales', desc: 'Tu fecha, hora y lugar de nacimiento se conectan a las efemérides oficiales NASA/JPL — la misma fuente usada por los observatorios.' },
      { title: 'Inteligencia artificial avanzada', desc: 'Entrenada con las enciclopedias astrológicas más autorizadas y más de 150 años de investigación académica — no un chatbot genérico.' },
      { title: 'Control anti-alucinación', desc: 'Cada interpretación se basa en tu carta real. La IA lee posiciones, aspectos y tránsitos reales — nunca inventados.' },
    ],
  },
  features: {
    eyebrow: 'Tus Poderes',
    title: 'Tu plano astral completo',
    sub: 'No solo tu "signo zodiacal" — toda la maquinaria de tu cielo, decodificada para el camino menos transitado.',
    items: [
      { icon: '☉', title: 'Carta Natal completa', desc: 'Signos, planetas, aspectos y las 12 casas. Tu carta natal personal, calculada bajo demanda para tus coordenadas exactas.' },
      { icon: '☄', title: 'Tránsitos Activos', desc: 'Mira qué te mueve ahora: oportunidades, tensión, puntos de inflexión y fases de crecimiento — cada 2 días.' },
      { icon: '∞', title: 'Sinastría & Afinidad', desc: 'Superpón dos cartas natales para un análisis profundo de atracción, estabilidad, comunicación, deseo y puntos críticos.' },
      { icon: '☾', title: 'Horóscopo Personal 24/7', desc: 'Guía continua basada en el movimiento real de los planetas y cómo activan tu carta natal.' },
      { icon: '◬', title: 'AstroPsique', desc: 'Analiza tu psique: traumas, dinámicas ocultas y potencial interior — las partes que te hicieron un inadaptado.' },
      { icon: '⬡', title: 'Informes PDF', desc: 'Descarga un informe completo y bellamente escrito de tu carta y tránsitos, para guardar o compartir.' },
    ],
  },
  how: {
    eyebrow: 'Cómo funciona',
    title: 'Un proceso simple para desbloquear tu destino estelar',
    steps: [
      { n: '01', title: 'Pon tus coordenadas', desc: 'Fecha, hora y lugar de nacimiento. Es todo lo que el cosmos necesita para encontrarte.' },
      { n: '02', title: 'Sincronizamos con la NASA', desc: 'Tus datos se conectan a las efemérides oficiales NASA/JPL para posiciones precisas al sub-arco.' },
      { n: '03', title: 'La IA lee tu cielo', desc: 'Cada posición planetaria, aspecto y tránsito se interpreta — coherente con tu carta.' },
      { n: '04', title: 'Recibes la verdad', desc: 'Un análisis único, escrito para tus coordenadas exactas. Claro. Realmente tuyo.' },
    ],
  },
  why: {
    eyebrow: 'Por qué somos diferentes',
    title: 'Para inadaptados, soñadores y los gloriosamente diferentes',
    body: 'A lo largo de la historia, quienes lo cambiaron todo fueron los inadaptados — los que rechazaron el guion. MsFitZ Society es la astrología para ellos. Unimos la precisión fría de la astronomía real con una IA que de verdad lee tu carta, para que la guía que recibes sea solo tuya. Sin horóscopos escritos para millones. Sin consuelo vago. Solo el mapa de tu propio cielo, y el valor de recorrerlo.',
    points: ['IA predictiva, no un chatbot de galleta de la suerte', 'Basada en astronomía real NASA/JPL', 'Funciones base 100% gratis, privacidad primero'],
  },
  pricing: {
    eyebrow: 'Membresía',
    title: 'Únete a la Society',
    sub: 'Empieza gratis. Profundiza cuando estés listo para conocer toda tu carta.',
    plans: [
      { name: 'Initiate', price: 'Gratis', period: 'para siempre', tagline: 'Descarga y prueba cada función base sin gastar nada.', features: ['Horóscopo personal diario', 'Carta natal completa', 'Tránsitos activos', 'Afinidad básica'], cta: 'Empieza gratis', featured: false },
      { name: 'Society Member', price: '7,99 €', period: '/ mes', tagline: 'El mejor equilibrio entre acceso y precio.', features: ['Todo de Initiate', 'Interpretaciones profundas IA 1.5', 'Tránsitos predictivos avanzados', 'Análisis de sinastría completo', 'Informes PDF ilimitados'], cta: 'Hazte miembro', featured: true },
      { name: 'Inner Circle', price: '14,99 €', period: '/ mes', tagline: 'Para quienes lo quieren todo.', features: ['Todo de Society Member', 'AstroPsique + informes ilimitados', 'Predicciones de pareja avanzadas', 'Acceso anticipado a nuevos módulos', 'Soporte prioritario'], cta: 'Únete al círculo', featured: false },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Preguntas de los curiosos',
    items: [
      { q: '¿Por qué es diferente de otras apps?', a: 'La mayoría de las apps escribe un horóscopo para millones de personas. MsFitZ calcula tu carta natal real desde las efemérides NASA/JPL y usa IA para interpretar tus posiciones, aspectos y tránsitos reales — así la lectura es solo tuya.' },
      { q: '¿De verdad usa datos de la NASA?', a: 'Usamos efemérides NASA/JPL de dominio público — la misma fuente usada por los observatorios — para calcular posiciones planetarias con precisión al sub-arco. La NASA no nos respalda ni colabora con nosotros; los datos son públicos y se usan según lo permite la ley.' },
      { q: '¿Es gratis?', a: 'Sí. Las funciones base — horóscopo diario, carta natal y tránsitos — son 100% gratis en Google Play. Las membresías desbloquean interpretaciones de IA más profundas, sinastría completa e informes PDF ilimitados.' },
      { q: '¿Qué dispositivos son compatibles?', a: 'MsFitZ Society está disponible actualmente en Android. Descárgala gratis en Google Play para empezar tu experiencia cósmica personalizada.' },
      { q: '¿Es consejo médico o profesional?', a: 'No. MsFitZ ofrece interpretaciones astrológicas con fines informativos y de entretenimiento y no sustituye una consulta médica, legal o profesional.' },
    ],
  },
  cta: {
    title: 'Las estrellas ya te eligieron.',
    sub: 'Descarga MsFitZ Society gratis en Google Play y lee el cielo escrito para ti.',
    button: 'Descargar en Google Play',
    note: 'Solo Android · 100% gratis para empezar · Privacidad garantizada',
  },
  footer: {
    tagline: 'Astrología IA con precisión NASA para inadaptados, marginados y los gloriosamente diferentes.',
    cols: [
      { title: 'Producto', links: ['Poderes', 'Cómo funciona', 'Membresía', 'FAQ'] },
      { title: 'Society', links: ['Nuestra misión', 'AstroExplorer', 'Soporte', 'Contacto'] },
      { title: 'Legal', links: ['Política de privacidad', 'Términos', 'Ajustes de cookies', 'Aviso legal'] },
    ],
    disclaimer:
      'MsFitZ Society usa datos de la NASA de dominio público, utilizados según lo permite la ley. No existe ningún acuerdo ni asociación entre MsFitZ Society y la NASA. Las interpretaciones generadas por IA son solo con fines informativos y de entretenimiento.',
    rights: 'Todos los derechos reservados.',
  },
}

const dictionaries: Record<Lang, Dict> = { en, it, es }

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: Dict }
const Ctx = createContext<I18nCtx | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const value = useMemo(() => ({ lang, setLang, t: dictionaries[lang] }), [lang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
