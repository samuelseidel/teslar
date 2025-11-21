import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Popovídejte si s někým,
              <br />
              <span className="text-red-500">kdo Teslu žije</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Reálné příběhy od nadšenců. Testovací jízda s majitelem. Upřímné odpovědi na všechny vaše otázky.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/vehicles"
                className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-lg"
              >
                Najít majitele Tesly
              </Link>
              <Link
                href="/auth/signup"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg hover:bg-white/20 transition-colors font-medium text-lg border border-white/20"
              >
                Sdílet svou Teslu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Jak to funguje
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* For Buyers */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">1. Najděte nadšence</h3>
              <p className="text-gray-300">
                Objevte majitele Tesel ve vašem okolí, kteří rádi sdílí své zkušenosti s elektromobilitou.
              </p>
            </div>

            {/* Connect */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">2. Domluvte si setkání</h3>
              <p className="text-gray-300">
                Napište majiteli a domluvte si osobní schůzku. Bez závazků, bez nátlaku prodejců.
              </p>
            </div>

            {/* Experience */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">3. Zažijte to na vlastní kůži</h3>
              <p className="text-gray-300">
                Svezete se, ptejte se na cokoliv a získejte upřímné odpovědi od skutečného majitele.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Potential Buyers */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Zvažujete Teslu?
              </h2>
              <ul className="space-y-4">
                {[
                  'Reálné příběhy z každodenního používání',
                  'Zkušenosti s nabíjením, dojezdem i spotřebou',
                  'Odpovědi na otázky, které vás opravdu zajímají',
                  'Svezení nebo zkušební jízda s majitelem',
                  'Bez prodejního tlaku - jen upřímná diskuze',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Tesla Owners */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Máte Teslu?
              </h2>
              <ul className="space-y-4">
                {[
                  'Sdílejte své nadšení s ostatními',
                  'Pomozte lidem udělat správné rozhodnutí',
                  'Poznejte další Tesla nadšence ve vašem okolí',
                  'Buďte součástí komunity elektromobility',
                  'Flexibilně - jen když vám to vyhovuje',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Připojte se ke komunitě
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Ať už Teslu zvažujete nebo ji milujete, jsme tady pro vás
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vehicles"
              className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-lg"
            >
              Najít majitele Tesly
            </Link>
            <Link
              href="/auth/signup"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
            >
              Sdílet svou Teslu
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 TeslaConnect. Spojujeme majitele Tesel s potenciálními kupci.</p>
          <p className="mt-2 text-sm">Oficiálně nepatří společnosti Tesla, Inc.</p>
        </div>
      </footer>
    </div>
  )
}
