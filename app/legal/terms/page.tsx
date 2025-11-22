import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              Tesla<span className="text-red-600">Connect</span>
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-8">Podmínky používání</h1>

          <div className="space-y-6 text-gray-300">
            <p className="text-sm text-gray-400">
              Účinnost od: {new Date().toLocaleDateString('cs-CZ')}
            </p>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Úvod</h2>
              <p>
                Vítejte na platformě TeslaConnect. Používáním této platformy souhlasíte s těmito podmínkami používání.
                Pokud s těmito podmínkami nesouhlasíte, platformu nepoužívejte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Popis služby</h2>
              <p>
                TeslaConnect je komunitní platforma, která spojuje majitele vozidel Tesla (ambasadory) se zájemci
                o elektromobilitu. Služba umožňuje zájemcům kontaktovat majitele za účelem získání informací,
                zkušební jízdy nebo konzultace. Veškerá setkání jsou dobrovolná a bezplatná.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Registrace a účet</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Pro registraci jako ambasador musíte vlastnit vozidlo Tesla</li>
                <li>Musíte poskytnout pravdivé a aktuální informace</li>
                <li>Jste odpovědní za zachování důvěrnosti vašeho hesla</li>
                <li>Jeden uživatel může mít pouze jeden účet</li>
                <li>Účet je nepřenosný</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Povinnosti ambasadorů</h2>
              <p className="mb-3">Jako ambasador se zavazujete:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Poskytovat pravdivé informace o vašem vozidle</li>
                <li>Jednat profesionálně a ohleduplně vůči zájemcům</li>
                <li>Dodržovat dohodnuté termíny nebo je včas zrušit</li>
                <li>Nepožadovat žádné poplatky za testovací jízdy nebo konzultace</li>
                <li>Respektovat bezpečnost a právní předpisy při testovacích jízdách</li>
                <li>Nepoužívat platformu pro komerční účely bez předchozího souhlasu</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Povinnosti zájemců</h2>
              <p className="mb-3">Jako zájemce se zavazujete:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Jednat profesionálně a ohleduplně vůči ambasadorům</li>
                <li>Dodržovat dohodnuté termíny nebo je včas zrušit</li>
                <li>Respektovat čas ambasadora</li>
                <li>Při testovací jízdě řídit se pokyny ambasadora</li>
                <li>Dodržovat platné právní předpisy</li>
                <li>Nepoužívat platformu pro spam nebo obtěžování</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Zakázané činnosti</h2>
              <p className="mb-3">Na platformě je zakázáno:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Zveřejňovat nepravdivé nebo klamavé informace</li>
                <li>Nahrávat nevhodný nebo urážlivý obsah</li>
                <li>Obtěžovat, zastrašovat nebo jinak poškozovat jiné uživatele</li>
                <li>Porušovat práva duševního vlastnictví</li>
                <li>Používat platformu pro komerční účely bez souhlasu</li>
                <li>Snažit se obejít bezpečnostní opatření platformy</li>
                <li>Používat automatizované nástroje pro sběr dat (scraping)</li>
                <li>Vydávat se za jinou osobu</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Obsah uživatelů</h2>
              <p>
                Uživatelé mohou na platformu nahrávat fotografie, popisy a další obsah. Nahráním obsahu uděluejete
                TeslaConnect nevýhradní právo tento obsah zobrazovat a distribuovat v rámci platformy. Zaručujete,
                že máte všechna práva k obsahu, který nahráváte, a že tento obsah neporušuje práva třetích stran.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Odpovědnost</h2>
              <p className="mb-3">
                TeslaConnect slouží pouze jako zprostředkovatelská platforma. Nezaručujeme:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kvalitu, bezpečnost nebo zákonnost nabízených služeb</li>
                <li>Pravdivost informací poskytovaných uživateli</li>
                <li>Že dojde ke konkrétnímu setkání nebo testovací jízdě</li>
              </ul>
              <p className="mt-3">
                Za veškerá setkání, testovací jízdy a výměnu informací jsou odpovědni výhradně uživatelé.
                TeslaConnect nenese odpovědnost za škody vzniklé v souvislosti s používáním platformy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Vyloučení odpovědnosti</h2>
              <p>
                Platforma je poskytována "tak jak je" bez jakýchkoli záruk. TeslaConnect není odpovědný za:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Přímé, nepřímé nebo následné škody</li>
                <li>Ztrátu dat nebo zisku</li>
                <li>Přerušení služby</li>
                <li>Chování jiných uživatelů</li>
                <li>Škody vzniklé při testovacích jízdách</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Dobrovolné dary</h2>
              <p>
                Ačkoli jsou všechny služby na platformě bezplatné, zájemci mohou dobrovolně nabídnout ambasadorům
                drobný dar (např. káva, příspěvek na nabíjení). Tyto dary jsou zcela dobrovolné a nesmí být podmínkou
                pro poskytnutí testovací jízdy nebo informací.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Ukončení účtu</h2>
              <p>
                Můžete kdykoli ukončit svůj účet. Vyhrazujeme si právo pozastavit nebo ukončit váš účet v případě
                porušení těchto podmínek nebo zneužití platformy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Ochrana osobních údajů</h2>
              <p>
                Zpracování vašich osobních údajů se řídí našimi{' '}
                <Link href="/legal/privacy" className="text-red-500 hover:text-red-400 underline">
                  Zásadami zpracování osobních údajů
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Vztah k Tesla, Inc.</h2>
              <p>
                TeslaConnect není oficiálně spojena se společností Tesla, Inc. Jsme nezávislá komunitní platforma
                vytvořená nadšenci pro elektromobilitu. Tesla je ochranná známka společnosti Tesla, Inc.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Změny podmínek</h2>
              <p>
                Vyhrazujeme si právo tyto podmínky kdykoli změnit. O významných změnách vás budeme informovat
                prostřednictvím e-mailu nebo oznámením na platformě. Pokračováním v používání platformy po změně
                podmínek vyjadřujete souhlas s novými podmínkami.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Rozhodné právo</h2>
              <p>
                Tyto podmínky se řídí právním řádem České republiky. Jakékoli spory budou řešeny u příslušných
                českých soudů.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">16. Kontakt</h2>
              <p>
                Pokud máte jakékoli dotazy ohledně těchto podmínek, kontaktujte nás prosím prostřednictvím
                kontaktního formuláře na platformě.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <Link
              href="/"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
