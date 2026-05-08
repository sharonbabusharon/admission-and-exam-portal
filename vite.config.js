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
    }
});