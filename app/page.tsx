import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      {/* Hero Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Není to jen auto.
            <br />
            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Je to způsob života.
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Před nákupem Tesly si popovídejte s někým, kdo ji žije každý den.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/vehicles"
              className="group bg-red-600 text-white px-10 py-5 rounded-xl hover:bg-red-700 transition-all font-semibold text-xl shadow-2xl hover:shadow-red-500/50 hover:scale-105 transform"
            >
              Prohlédnout vozidla
              <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/auth/signup"
              className="bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-xl hover:bg-white/20 transition-all font-semibold text-xl border-2 border-white/20 hover:border-white/40"
            >
              Jsem majitel Tesly
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* How it Works Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Jak to funguje
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tři jednoduché kroky k vaší zkušební jízdě s Teslou
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-10 border border-white/10 hover:border-red-500/50 transition-all hover:transform hover:scale-105 h-full">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-red-500/50">
                  <span className="text-white text-3xl font-bold">1</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">Vyberte si</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Prohlédněte si Tesly ve vašem okolí. Každá s příběhem skutečného majitele, který ji používá každý den.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-10 border border-white/10 hover:border-red-500/50 transition-all hover:transform hover:scale-105 h-full">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/50">
                  <span className="text-white text-3xl font-bold">2</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">Napište</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Kontaktujte majitele přímo přes platformu. Žádní prodejci, žádný tlak. Jen upřímná konverzace.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-10 border border-white/10 hover:border-red-500/50 transition-all hover:transform hover:scale-105 h-full">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-green-500/50">
                  <span className="text-white text-3xl font-bold">3</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">Zažijte</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Svezete se, zeptejte se na cokoliv. Od parkování po dálkové cesty. Reálné odpovědi od reálných lidí.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Buyers Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-white/5">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div>
              <div className="inline-block px-4 py-2 bg-red-500/20 rounded-full mb-6">
                <span className="text-red-400 font-semibold">Pro zájemce</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Zvažujete<br />přechod na<br />
                <span className="text-red-500">elektromobilitu?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Nezávislé názory od lidí, kteří to prožívají denně. Bez marketing sloganů, jen upřímnost.
              </p>

              <div className="space-y-6">
                {[
                  { icon: '⚡', text: 'Reálná spotřeba a dojezd v běžném provozu' },
                  { icon: '🔌', text: 'Zkušenosti s nabíjením doma i na cestách' },
                  { icon: '💰', text: 'Pravdivé provozní náklady a úspory' },
                  { icon: '🚗', text: 'Jak se Tesla chová v zimě, ve městě, na dálnici' },
                  { icon: '🛠️', text: 'Servis, údržba a praktické tipy' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="text-3xl">{item.icon}</div>
                    <p className="text-gray-300 text-lg group-hover:text-white transition-colors">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Visual element */}
            <div className="relative">
              <div className="bg-gradient-to-br from-red-500/20 to-blue-500/20 rounded-3xl p-12 backdrop-blur-lg border border-white/10">
                <div className="text-center space-y-8">
                  <div className="text-6xl">🎯</div>
                  <h3 className="text-3xl font-bold text-white">Děláte důležité rozhodnutí</h3>
                  <p className="text-xl text-gray-300">
                    Pobavte se s někým, kdo už tím prošel. Zjistěte, jestli je Tesla to pravé pro vás.
                  </p>
                  <Link
                    href="/vehicles"
                    className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg"
                  >
                    Najít majitele ve svém okolí
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Owners Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left side - Visual element */}
            <div className="relative order-2 md:order-1">
              <div className="bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-3xl p-12 backdrop-blur-lg border border-white/10">
                <div className="text-center space-y-8">
                  <div className="text-6xl">🚀</div>
                  <h3 className="text-3xl font-bold text-white">Jste součástí revoluce</h3>
                  <p className="text-xl text-gray-300">
                    Pomozte ostatním objevit kouzlo elektromobility. Staňte se součástí komunity Tesla ambasadorů.
                  </p>
                  <Link
                    href="/auth/signup"
                    className="inline-block bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition-all font-semibold text-lg"
                  >
                    Registrovat mé vozidlo
                  </Link>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="order-1 md:order-2">
              <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full mb-6">
                <span className="text-blue-400 font-semibold">Pro majitele</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Máte Teslu?<br />
                <span className="text-blue-500">Sdílejte</span> své<br />
                nadšení
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Pomozte lidem udělat informované rozhodnutí. Buďte součástí komunity nadšenců.
              </p>

              <div className="space-y-6">
                {[
                  { icon: '💙', text: 'Sdílejte svou lásku k elektromobilitě' },
                  { icon: '🤝', text: 'Poznejte další Tesla nadšence' },
                  { icon: '⏰', text: 'Flexibilně podle vašeho času' },
                  { icon: '🎁', text: 'Získejte přístup k exkluzivní komunitě' },
                  { icon: '🌍', text: 'Pomozte urychlit přechod na udržitelnou energii' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="text-3xl">{item.icon}</div>
                    <p className="text-gray-300 text-lg group-hover:text-white transition-colors">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-red-900/20 to-blue-900/20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Připraveni začít?
          </h2>
          <p className="text-2xl md:text-3xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
            Ať už hledáte informace nebo chcete sdílet svůj příběh,<br />
            <span className="text-red-400 font-semibold">jsme tu pro vás.</span>
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/10 hover:border-red-500/50 transition-all">
              <div className="text-5xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">Zvažuji Teslu</h3>
              <p className="text-gray-300 mb-8 text-lg">
                Prohlédněte si dostupné Tesly a spojte se s majiteli ve vašem okolí
              </p>
              <Link
                href="/vehicles"
                className="inline-block bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition-all font-semibold text-lg w-full"
              >
                Prohlédnout vozidla
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/10 hover:border-blue-500/50 transition-all">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-4">Vlastním Teslu</h3>
              <p className="text-gray-300 mb-8 text-lg">
                Registrujte své vozidlo a staňte se Tesla ambasadorem
              </p>
              <Link
                href="/auth/signup"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg w-full"
              >
                Zaregistrovat vozidlo
              </Link>
            </div>
          </div>

          <p className="text-gray-400 text-lg">
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
