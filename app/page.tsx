import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      {/* Hero Section - Full Viewport */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center flex-1 flex flex-col justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Není to jen auto.
            <br />
            <span className="text-red-500">
              Je to způsob života.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
            Před nákupem Tesly si popovídejte s někým, kdo ji žije každý den.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/vehicles"
              className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-lg"
            >
              Prohlédnout vozidla
            </Link>
            <Link
              href="/auth/signup"
              className="bg-white/10 text-white px-8 py-4 rounded-lg hover:bg-white/20 transition-colors font-medium text-lg border border-white/20"
            >
              Jsem majitel Tesly
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="pb-8 animate-bounce">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* How it Works Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Jak to funguje
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Tři jednoduché kroky k vaší zkušební jízdě
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Vyberte si</h3>
              <p className="text-gray-400 leading-relaxed">
                Prohlédněte si Tesly ve vašem okolí. Každá s příběhem skutečného majitele.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Napište</h3>
              <p className="text-gray-400 leading-relaxed">
                Kontaktujte majitele přímo přes platformu. Žádní prodejci, žádný tlak.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Zažijte</h3>
              <p className="text-gray-400 leading-relaxed">
                Svezete se, zeptejte se na cokoliv. Reálné odpovědi od reálných lidí.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Buyers Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-white/5">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Zvažujete Teslu?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Zjistěte, jak je to doopravdy. Od lidí, kteří to žijí každý den.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              'Reálná spotřeba a dojezd v běžném provozu',
              'Zkušenosti s nabíjením doma i na cestách',
              'Pravdivé provozní náklady a úspory',
              'Jak se Tesla chová v zimě, ve městě, na dálnici',
              'Servis, údržba a praktické tipy',
              'Autopilot a asistenční systémy v praxi',
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-white/5 rounded-lg p-4 border border-white/10">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-300">{item}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/vehicles"
              className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-lg"
            >
              Najít majitele ve svém okolí
            </Link>
          </div>
        </div>
      </section>

      {/* For Owners Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Máte Teslu?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Sdílejte své zkušenosti a pomozte ostatním udělat správné rozhodnutí.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              'Sdílejte svou lásku k elektromobilitě',
              'Poznejte další Tesla nadšence ve vašem okolí',
              'Flexibilně podle vašeho času',
              'Buďte součástí rostoucí komunity',
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-white/5 rounded-lg p-4 border border-white/10">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-300">{item}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-lg"
            >
              Registrovat mé vozidlo
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Připraveni začít?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Ať už hledáte informace nebo chcete sdílet svůj příběh, jsme tu pro vás.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-red-500/50 transition-colors">
              <h3 className="text-2xl font-bold text-white mb-4">Zvažuji Teslu</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Prohlédněte si dostupné Tesly a spojte se s majiteli ve vašem okolí
              </p>
              <Link
                href="/vehicles"
                className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-lg w-full"
              >
                Prohlédnout vozidla
              </Link>
            </div>

            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-red-500/50 transition-colors">
              <h3 className="text-2xl font-bold text-white mb-4">Vlastním Teslu</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Registrujte své vozidlo a staňte se Tesla ambasadorem
              </p>
              <Link
                href="/auth/signup"
                className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-lg w-full"
              >
                Zaregistrovat vozidlo
              </Link>
            </div>
          </div>

          <p className="text-gray-400">
            Připojte se k rostoucí komunitě Tesla nadšenců v České republice
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <p className="text-gray-400 text-lg">
              <span className="text-white font-semibold">TeslaConnect</span> - Spojujeme majitele s budoucími majiteli
            </p>
            <p className="text-gray-500 text-sm">
              Tato platforma není oficiálně spojena se společností Tesla, Inc.
            </p>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} TeslaConnect. Všechna práva vyhrazena.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
