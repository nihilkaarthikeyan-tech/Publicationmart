<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="deploy-version" content="2026-01-03 11:45 AM - Full Sync (Role+Navbar+Verify)">

    {{-- The `inertia` attribute lets the client adapter manage this tag, so
         crawlers get this server-rendered fallback and each page's own Head
         title replaces it after mount. A plain <title> here shipped two title
         tags and browsers used this one, hiding every per-page title. --}}
    <title inertia>PublicationMart – Book Publishing & Author Services in India</title>
    <meta name="description"
        content="PublicationMart helps authors publish books easily with professional editing, ISBN, printing, and distribution services across India.">
    <meta name="keywords"
        content="self publishing india, book publishing india, publish book online india, isbn publishing india, ebook publishing platform, print on demand india, self publish book india, indian self publishing platform, book printing and distribution india, publish novel india, author publishing services india, self publishing, self publishing platform, publish a book online, ebook publishing, print on demand, book publishing services, independent publishing platform, publish my book, global book distribution, how to self publish a book, best self publishing platform, publish ebook and paperback, international book publishing, self publishing company, royalty based publishing, PublicationMart">

    <!-- Canonical URL -->
    <link rel="canonical" href="{{ url()->current() }}">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url('/') }}">
    <meta property="og:title" content="PublicationMart – Book Publishing & Author Services in India">
    <meta property="og:description"
        content="PublicationMart helps authors publish books easily with professional editing, ISBN, printing, and distribution services across India.">
    <meta property="og:image" content="{{ asset('images/logo_new.png') }}">
    <meta property="og:site_name" content="PublicationMart">

    <!-- Structured Data for Google Logo -->
    <script type="application/ld+json">
    {
      "@@context": "https://schema.org",
      "@@type": "Organization",
      "name": "PublicationMart",
      "url": "https://publicationmart.com",
      "logo": "https://publicationmart.com/favicon.png"
    }
    </script>

    {{-- Favicon: the cloth-bound book. SVG for modern browsers (crisp at any
         size), multi-size ICO for legacy, 512px PNG for search results, and a
         padded 180px tile for iOS home screens. --}}
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}?v=2">
    <link rel="icon" type="image/x-icon" sizes="16x16 32x32 48x48" href="{{ asset('favicon.ico') }}?v=2">
    <link rel="icon" type="image/png" sizes="512x512" href="{{ asset('favicon.png') }}?v=2">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}?v=2">
    <meta name="apple-mobile-web-app-title" content="PublicationMart">
    <meta name="application-name" content="PublicationMart">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @inertiaHead

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0XH0VKQQX8"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-0XH0VKQQX8');
    </script>
    <script>
        window.RECAPTCHA_V3_SITE_KEY = "{{ config('services.recaptcha.site_key') }}";
    </script>

    <!-- Facebook Pixel Code -->
    <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1303589550727690');
        fbq('track', 'PageView');
    </script>
    <noscript>
        <img height="1" width="1" style="display:none"
            src="https://www.facebook.com/tr?id=1303589550727690&ev=PageView&noscript=1"/>
    </noscript>
    <!-- End Facebook Pixel Code -->
</head>

<body class="font-sans antialiased bg-[#f0ece3]">
    @inertia
</body>

</html>