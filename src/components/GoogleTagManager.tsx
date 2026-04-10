"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GTM_ID = "GTM-5GWW8GDC";

export default function GoogleTagManager() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // Leer consentimiento inicial
    if (localStorage.getItem("cookie-consent") === "accepted") {
      setAccepted(true);
    }

    // Escuchar cuando el usuario interactúa con el banner en la misma pestaña
    const handleConsent = () => {
      if (localStorage.getItem("cookie-consent") === "accepted") {
        setAccepted(true);
      }
    };

    window.addEventListener("cookie-consent-updated", handleConsent);
    return () => window.removeEventListener("cookie-consent-updated", handleConsent);
  }, []);

  if (!accepted) return null;

  return (
    <>
      <Script id="gtm" strategy="afterInteractive">{`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `}</Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
