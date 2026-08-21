import Script from "next/script";

import { getPublicPixeles } from "@/features/admin/configuracion/queries/public-config.query";
import type { PixelesConfig } from "@/features/admin/configuracion/validations/config.schema";

/**
 * Inyecta los scripts de analítica/remarketing configurados en
 * el admin. Cada uno se renderiza solo si su ID está presente.
 *
 *Grafo de precarga:
 *  - GA4: si hay GTM,GA4 se inicializa vía GTM en lugar de directo
 *    para evitar duplicidad.
 *
 * Notas de marketing:
 *  - Usamos `strategy="afterInteractive"` (default) para no
 *    penalizar LCP. Para GA4/GTM es lo recomendado por Google.
 */
export default async function AnalyticsScripts() {
  const p = (await getPublicPixeles()) as PixelesConfig | null;

  if (!p) return null;

  const useGtmForGa = Boolean(p.gtm_id && p.ga4_id);

  return (
    <>
      {/* -------------------- Google Tag Manager (head/equivalent) -------------------- */}
      {p.gtm_id && (
        <Script id="gtm-inline" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${p.gtm_id}');
          `}
        </Script>
      )}

      {/* -------------------- Google Analytics 4 (solo si no hay GTM) -------------------- */}
      {p.ga4_id && !useGtmForGa && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${p.ga4_id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-inline" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${p.ga4_id}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {/* -------------------- Google Ads Conversion (snippet estándar) -------------------- */}
      {p.google_ads_id && p.conversao_google_ads_id && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${p.google_ads_id}`}
          strategy="afterInteractive"
        />
      )}
      {p.google_ads_id && p.conversao_google_ads_id && (
        <Script id="gads-inline" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${p.google_ads_id}/${p.conversao_google_ads_id}');
          `}
        </Script>
      )}

      {/* -------------------- Meta (Facebook) Pixel -------------------- */}
      {p.meta_pixel_id && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${p.meta_pixel_id}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* -------------------- TikTok Pixel -------------------- */}
      {p.tiktok_pixel_id && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${p.tiktok_pixel_id}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}
    </>
  );
}
