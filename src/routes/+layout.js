// Browser-only demo. The static adapter generates index.html as the SPA shell.
// Vercel serves that shell for page URLs and SvelteKit selects the page in-browser.
export const prerender = false;
export const ssr = false;
