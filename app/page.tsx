import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      {/* Hero Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-b from-black/40 to-transparent">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Není to jen auto.
            <br />
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
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
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* How it Works Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-white/5">
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
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-red-600/50">
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
      <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div>
              <div className="inline-block px-4 py-2 bg-red-500/20 rounded-full mb-6">
                <span className="text-red-600 font-semibold">Pro zájemce</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Zvažujete<br />přechod na<br />
                <span className="text-red-600">elektromobilitu?</span>
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
      <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-white/5">
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
            <span className="text-red-600 font-semibold">jsme tu pro vás.</span>
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
      <footer className="border-t border-white/10 bg-gradient-to-b from-black/80 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <h3 className="text-2xl font-bold text-white">
                  Tesla<span className="text-red-600">Connect</span>
                </h3>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                Spojujeme majitele vozidel Tesla se zájemci o elektromobilitu. Autentické zkušenosti, žádný prodejní tlak.
              </p>
              {/* Social Media Icons */}
              <div className="flex gap-3 pt-2">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all group"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all group"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all group"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* For Buyers Column */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Pro zájemce</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/vehicles" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Prohlédnout vozidla
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Najít ambasadora
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Jak to funguje
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Ambassadors Column */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Pro majitele</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Stát se ambasadorem
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Přihlásit se
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Právní informace</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/legal/terms" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Podmínky používání
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Ochrana osobních údajů
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm text-center md:text-left">
                &copy; {new Date().getFullYear()} TeslaConnect. Všechna práva vyhrazena.
              </p>
              <p className="text-gray-500 text-xs text-center md:text-right">
                Tato platforma není oficiálně spojena se společností Tesla, Inc.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
