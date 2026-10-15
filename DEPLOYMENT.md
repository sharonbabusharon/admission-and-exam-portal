# Deploy this demo to Vercel

This project is a SvelteKit 2 browser-only demo. Vercel hosts its generated HTML, JavaScript, CSS, fonts and images. Registration, simulated payments, applications and exam attempts continue to use browser storage.

The code is prepared for deployment. No Vercel account, project or live deployment has been created by this change.

## 1. Select the correct project folder

The Git repository root is:

```text
W:\Binary\Athul project\Student_admission_and _exam\Student_admission_and _exam
```

This is the folder containing `package.json`, `svelte.config.js` and `vercel.json`. Commit and push the intended project changes, including the new UI, question JSON, local assets and deployment files, to your Git provider.

Do not commit `node_modules`, `build`, `.svelte-kit`, `.vercel`, or local environment files. They are generated, local, or ignored files.

## 2. Import into Vercel

1. In Vercel, choose **Add New → Project** and import the Git repository.
2. Select the folder containing `package.json` as the **Root Directory**. For this repository, use the repository root (`./`). If you instead upload a larger parent repository, select the nested application folder inside it.
3. Check these settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Node.js Version | `22.x` |
| Environment Variables | None needed for this demo |

4. Choose **Deploy**. The checked-in `vercel.json` supplies the build settings, and `package.json` specifies Node 22.
5. Open the deployment URL and try registration, application submission, simulated payment, exam submission and read-only application review.

Use **Other** deliberately: the application is compiled by SvelteKit, but this deployment publishes its static output. It does not need Vercel's SvelteKit server deployment preset.

## 3. Understand the code changes

### svelte.config.js

```js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html'
    })
  }
};
```

An adapter prepares SvelteKit's compiled output for the chosen host. We replaced automatic platform detection with the static adapter because the demo does not have backend endpoints.

- `pages` sets the destination for generated page files.
- `assets` puts the scripts, styles and public assets in the same deployable folder.
- `fallback` creates the HTML shell that starts the browser application.

The existing root layout already had `ssr = false` and `prerender = false`; those behaviors are retained. Only explanatory comments were added to `src/routes/+layout.js`. We are not prerendering a separate HTML document for every application route.

### vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

`framework: null` selects Other. `npm ci` installs the exact dependency tree from `package-lock.json`; `npm run build` compiles the project. Vercel publishes the resulting `build` directory.

The rewrite handles page URLs without corresponding physical files. For example, opening `/app/exam` directly serves `index.html` while keeping `/app/exam` in the address bar. SvelteKit then displays that route in the browser. Existing JavaScript, fonts and images are served as files before this fallback is applied.

### package.json and package-lock.json

The development dependency changed from `@sveltejs/adapter-auto` to `@sveltejs/adapter-static` version `3.0.10`, which supports the installed SvelteKit 2 version. The lockfile records the corresponding package changes.

```json
"engines": {
  "node": "22.x"
}
```

This keeps the cloud build on the Node major version used for verification. The existing `build` script remains `vite build`.

### vite.config.js

Removed the old `DOT_ENV_TAG` logging and custom `dotenv` loader for `env/<tag>`. The demo does not use environment variables, and a cloud checkout should not depend on an ignored local folder. The SvelteKit plugin and existing `~` alias are preserved.

### .gitignore

Added `/.vercel/` to exclude local Vercel project metadata. The generated `build` directory was already ignored.

## 4. What the build produces

```text
Source code + installed dependencies
              |
        npm run build
              |
      SvelteKit compilation
              |
         Static adapter
              |
    build/index.html + _app/ + assets/
              |
        Vercel static hosting
```

You do not upload or host `npm run dev`. Port 17606 is only for local development; Vercel provides the public HTTPS URL.

## 5. Demo data on the hosted site

Data belongs to the browser and site address where it was entered. Localhost data does not transfer to the Vercel address, and another browser starts with its own demo data. Athul can create a fresh account on the hosted URL and demonstrate the complete journey there. No email or payment credentials are required.

When a real backend is added, hosting and persistence should be revisited. Browser storage and client-side answer keys are intentional parts of this demonstration.

## Verification completed

- Installed dependencies from the updated lockfile in a fresh folder using `npm ci`.
- Built successfully without the ignored local `env` folder.
- Verified that `build/index.html`, compiled scripts and local assets were generated.
- Served the generated static output with filesystem-first SPA fallback routing and tested registration, application, payment, exam, refresh recovery, timeout, results and read-only application review in a browser.
- A live Vercel deployment is still needed to verify the actual cloud environment.

Official references: [SvelteKit static adapter](https://svelte.dev/docs/kit/adapter-static), [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json), [Vercel SPA deep linking](https://vercel.com/docs/frameworks/frontend/vite#using-vercel-rewrites-for-spa-routing).
