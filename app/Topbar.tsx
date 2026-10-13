import Link from 'next/link';

/**
 * Topmenu.
 *
 * Diskret med vilje. Forsiden skal stadig handle om beregneren, men
 * undersiderne skal kunne findes — både af kunder og af Google, der
 * bruger interne links til at forstå, hvad siden handler om.
 */

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="c">
        <Link href="/" className="maerke" aria-label="Til forsiden">
          beregn<i>arbejdsskade</i>.dk
        </Link>

        <nav className="topnav" aria-label="Hovedmenu">
          <Link href="/arbejdsskadeforsikring">Om forsikringen</Link>
          <Link href="/hvad-koster-arbejdsskadeforsikring">Pris</Link>
          <Link href="/saadan-virker-det" className="skjul">Sådan virker det</Link>
        </nav>
      </div>
    </header>
  );
}
