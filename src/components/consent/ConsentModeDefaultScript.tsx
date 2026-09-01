/** Consent Mode v2 varsayılanları — tüm Google etiketlerinden önce yüklenmeli. */
export function ConsentModeDefaultScript() {
  return (
    <script
      id="google-consent-default"
      dangerouslySetInnerHTML={{
        __html: `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  analytics_storage:'denied',
  functionality_storage:'granted',
  security_storage:'granted',
  wait_for_update:500
});
        `.trim(),
      }}
    />
  );
}
