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
  ad_storage:'granted',
  ad_user_data:'granted',
  ad_personalization:'granted',
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
