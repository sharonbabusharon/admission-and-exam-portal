import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import path from 'path';
import * as dotenv from "dotenv";
import * as fs from "node:fs";

console.log("Environment variable before : ", process.env.DOT_ENV_TAG);
dotenv.config({

    path: `./env/${process.env.DOT_ENV_TAG}`,
    override: true
});
console.log("Environment variable after : ", process.env.DOT_ENV_TAG);

const default_ssl_domain_name = 'bigdate.events';
let ssl_folder = path.join('C:\\Projects\\__SSL_Repo', default_ssl_domain_name);

export default defineConfig({

    plugins: [sveltekit()],
    resolve: {
        alias: {
            '~': path.resolve('./src')
        }
    },
    server: {
        // allowedHosts: ["mbme-hub.bigdate.events"],
        proxy: {},
        https: {
            ca: [fs.readFileSync(path.join(ssl_folder, 'bundle.ca-bundle'))],
            key: fs.readFileSync(path.join(ssl_folder, 'key.pem')),
            cert: fs.readFileSync(path.join(ssl_folder, 'cert.crt')),

            // SNICallback: function (domain, inner_sni_callback) {
            // 	let cert_context = get_ssl_certificate_context(domain);
            // 	if (cert_context) {
            // 		inner_sni_callback(null, cert_context);
            // 	} else {
            // 		// console.log('No ssl found for domain : ' + domain + ' || Sending default keys');
            // 		inner_sni_callback(null, get_default_ssl_certificate_context());
            // 	}
            // }
        }
    }
});