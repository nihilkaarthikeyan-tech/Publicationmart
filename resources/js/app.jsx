import './bootstrap';
import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import Layout from './Layouts/Layout';

const appName = 'PublicationMart';

createInertiaApp({
    title: title => title.includes(appName) ? title : `${title} - ${appName}`,
    resolve: async (name) => {
        // Only real pages resolve here. Anything a page merely imports lives in
        // a Components/ or Partials/ subfolder (or a *.data.jsx module) beside
        // it, and is excluded so it can never be rendered as a route target.
        const pages = import.meta.glob([
            './Pages/**/*.jsx',
            '!./Pages/**/Components/**',
            '!./Pages/**/Partials/**',
            '!./Pages/**/*.data.jsx',
        ]);
        const page = await resolvePageComponent(`./Pages/${name}.jsx`, pages);

        // Every page gets the global Layout (navbar + footer) unless it
        // declares otherwise itself: full-screen pages (auth, studios,
        // pricing takeovers) end with `TheirPage.layout = null;`.
        if (page.default.layout === undefined) {
            page.default.layout = (pageContent) => <Layout>{pageContent}</Layout>;
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: { color: '#a07d3b', showSpinner: true, includeCSS: true, delay: 50 },
});

// Meta Pixel: Track PageView on every SPA route change
router.on('navigate', () => {
    if (typeof window.fbq === 'function') {
        fbq('track', 'PageView');
    }
});
