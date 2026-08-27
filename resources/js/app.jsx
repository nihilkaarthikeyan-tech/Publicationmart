import './bootstrap';
import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import Layout from './Layouts/Layout';

const appName = 'PublicationMart';

// Pages that should NOT have the layout wrapper (they have their own headers)
const noLayoutPages = [
    // The landing page carries its own masthead and footer; the shared dark
    // Navbar would clash with its paper-and-ink design.
    'Welcome',
    'Auth/Login',
    'Auth/Register',
    'Auth/ForgotPassword',
    'Auth/ResetPassword',
    'Auth/VerifyEmail',
    'Auth/ConfirmPassword',
    'GuestSmartWriter/Studio',
    'GuestSmartWriter/Pricing',
    'GuestSmartWriter/Payment',
    'GuestSmartWriter/Success',
    'Books/AiBookStudio',
    'Books/FormattingTool',
    'Books/ProPricing',
    'Books/PremiumPricing'
];

createInertiaApp({
    title: title => title.includes(appName) ? title : `${title} - ${appName}`,
    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx');
        const page = await resolvePageComponent(`./Pages/${name}.jsx`, pages);

        // Only apply layout if page doesn't already have one AND it's not an auth page
        if (!page.default.layout && !noLayoutPages.includes(name)) {
            page.default.layout = (pageContent) => <Layout>{pageContent}</Layout>;
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: { color: '#22d3ee', showSpinner: true, includeCSS: true, delay: 50 },
});

// Meta Pixel: Track PageView on every SPA route change
router.on('navigate', () => {
    if (typeof window.fbq === 'function') {
        fbq('track', 'PageView');
    }
});
