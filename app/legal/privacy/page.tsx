import Link from 'next/link'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Zásady zpracování osobních údajů</h1>

          <div className="space-y-6 text-gray-300">
            <p className="text-sm text-gray-400">
              Účinnost od: {new Date().toLocaleDateString('cs-CZ')}
            </p>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Správce osobních údajů</h2>
              <p>
                Správcem osobních údajů je provozovatel platformy TeslaConnect. Kontaktní údaje správce budou doplněny.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Jaké osobní údaje zpracováváme</h2>
              <p className="mb-3">V rámci platformy TeslaConnect zpracováváme následující osobní údaje:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Jméno a příjmení</li>
                <li>E-mailová adresa</li>
                <li>Telefonní číslo (volitelné)</li>
                <li>Adresa a poloha (pro ambasadory)</li>
                <li>Profilová fotografie (volitelné)</li>
                <li>Informace o vozidle Tesla (pro ambasadory)</li>
                <li>Fotografie vozidla (pro ambasadory)</li>
                <li>Odkazy na sociální sítě (volitelné)</li>
                <li>Tesla referral kód (volitelné)</li>
                <li>Obsah zpráv a kontaktních žádostí</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Účel zpracování osobních údajů</h2>
              <p className="mb-3">Vaše osobní údaje zpracováváme za těmito účely:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Registrace a správa uživatelského účtu</li>
                <li>Umožnění kontaktu mezi zájemci a majiteli vozidel Tesla</li>
                <li>Zobrazení veřejného profilu ambasadora a jeho vozidla</li>
                <li>Zasílání e-mailových notifikací o kontaktních žádostech</li>
                <li>Provoz a zlepšování platformy</li>
                <li>Plnění právních povinností</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Právní základ zpracování</h2>
              <p className="mb-3">Osobní údaje zpracováváme na základě:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Vašeho souhlasu (čl. 6 odst. 1 písm. a) GDPR)</li>
                <li>Plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR)</li>
                <li>Oprávněného zájmu správce (čl. 6 odst. 1 písm. f) GDPR)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Doba zpracování</h2>
              <p>
                Osobní údaje uchováváme po dobu, po kterou je váš účet aktivní. Po smazání účtu jsou vaše osobní údaje
                trvale odstraněny, s výjimkou údajů, které jsme povinni uchovávat ze zákona.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Komu předáváme osobní údaje</h2>
              <p className="mb-3">Vaše osobní údaje můžeme předávat:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Poskytovateli hostingových služeb (Supabase)</li>
                <li>Poskytovateli e-mailových služeb (Resend)</li>
                <li>Mapovým službám (Google Maps API) pro zobrazení polohy</li>
              </ul>
              <p className="mt-3">
                Všichni zpracovatelé jsou pečlivě vybráni a splňují požadavky GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Vaše práva</h2>
              <p className="mb-3">V souladu s GDPR máte následující práva:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Právo na přístup k osobním údajům</li>
                <li>Právo na opravu osobních údajů</li>
                <li>Právo na výmaz osobních údajů ("právo být zapomenut")</li>
                <li>Právo na omezení zpracování</li>
                <li>Právo na přenositelnost údajů</li>
                <li>Právo vznést námitku proti zpracování</li>
                <li>Právo odvolat souhlas</li>
                <li>Právo podat stížnost u Úřadu pro ochranu osobních údajů</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Veřejné informace</h2>
              <p>
                Vezměte prosím na vědomí, že určité informace, které poskytnete jako ambasador (jméno, město, region,
                informace o vozidle, fotografie, bio), jsou veřejně zobrazeny na platformě za účelem umožnění kontaktu
                se zájemci o vozidla Tesla. Vaše úplná adresa s číslem popisným zůstává soukromá a je viditelná pouze vám.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Zabezpečení údajů</h2>
              <p>
                Implementovali jsme vhodná technická a organizační opatření k ochraně vašich osobních údajů proti
                ztrátě, zneužití nebo neoprávněnému přístupu. Využíváme šifrování, zabezpečené protokoly a pravidla
                pro řízení přístupu (Row Level Security).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Cookies</h2>
              <p>
                Platforma používá nezbytné cookies pro fungování autentifikace a relací. Nepoužíváme marketingové
                nebo analytické cookies třetích stran.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Změny těchto zásad</h2>
              <p>
                Vyhrazujeme si právo tyto zásady kdykoli aktualizovat. O významných změnách vás budeme informovat
                prostřednictvím e-mailu nebo oznámením na platformě.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Kontakt</h2>
              <p>
                Pokud máte jakékoli dotazy ohledně zpracování vašich osobních údajů nebo chcete uplatnit svá práva,
                kontaktujte nás prosím prostřednictvím kontaktního formuláře na platformě.
              </p>
            </section>

            <section className="border-t border-white/20 pt-6 mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Úřad pro ochranu osobních údajů</h2>
              <p className="mb-2">
                Máte právo podat stížnost u dozorového úřadu:
              </p>
              <p className="text-sm">
                Úřad pro ochranu osobních údajů<br />
                Pplk. Sochora 27<br />
                170 00 Praha 7<br />
                <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400">
                  www.uoou.cz
                </a>
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
