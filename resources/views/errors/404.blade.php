<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaf 404 — Missing From This Copy | PublicationMart</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}?v=2">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=eb-garamond:400,500,600i|figtree:400,600,700&display=swap" rel="stylesheet">
    <style>
        /* A page torn out of the binding. Standalone: this file is served
           without the app shell, so the house palette is written out here. */
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f0ece3;
            color: #17150f;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 20px;
        }

        .leaf {
            position: relative;
            background: #fdfbf5;
            border: 1px solid #d8d1c1;
            border-right: 0;
            max-width: 480px;
            width: 100%;
            padding: 48px 56px 52px 44px;
            box-shadow: 0 18px 44px rgba(23, 21, 15, .13);
            /* the ragged edge where the leaf was torn from its binding */
            clip-path: polygon(0 0, 97% 0, 100% 4%, 95% 9%, 99% 15%, 94% 21%,
                98% 27%, 93% 33%, 99% 39%, 94% 45%, 98% 51%, 93% 57%,
                99% 63%, 94% 69%, 98% 75%, 93% 81%, 99% 87%, 95% 93%,
                98% 97%, 94% 100%, 0 100%);
        }

        .folio {
            font-family: 'EB Garamond', Georgia, serif;
            font-style: italic;
            font-size: 14px;
            color: #a07d3b;
            letter-spacing: .04em;
        }

        h1 {
            font-family: 'EB Garamond', Georgia, serif;
            font-weight: 500;
            font-size: clamp(28px, 6vw, 38px);
            line-height: 1.14;
            margin: 14px 0 12px;
        }

        p {
            font-family: 'EB Garamond', Georgia, serif;
            font-size: 17px;
            line-height: 1.65;
            color: #4b443a;
            max-width: 34ch;
        }

        .rule { height: 1px; background: #d8d1c1; margin: 30px 0 24px; width: 78%; }

        .actions { display: flex; flex-wrap: wrap; gap: 12px; }

        .btn {
            display: inline-block;
            padding: 13px 26px;
            font-size: 13.5px;
            font-weight: 700;
            text-decoration: none;
            border-radius: 3px;
            transition: background-color .25s, color .25s, border-color .25s;
        }

        .btn-primary { background: #6e2530; color: #faf8f3; border: 1px solid #6e2530; }
        .btn-primary:hover { background: #5a1e27; border-color: #5a1e27; }

        .btn-ghost { background: transparent; color: #17150f; border: 1px solid #d8d1c1; }
        .btn-ghost:hover { border-color: #6e2530; color: #6e2530; }

        .btn:focus-visible { outline: 2px solid #17150f; outline-offset: 3px; }

        .press {
            margin-top: 34px;
            font-size: 9px;
            letter-spacing: .22em;
            text-transform: uppercase;
            font-weight: 700;
            color: #856531;
        }

        @media (max-width: 520px) {
            .leaf { padding: 36px 40px 40px 28px; }
        }
    </style>
</head>

<body>
    <main class="leaf">
        <div class="folio">leaf 404 &middot; missing from this copy</div>

        <h1>This page was torn out.</h1>

        <p>Or it was never bound in. The catalogue, however, is quite intact &mdash;
            and there are several hundred other pages worth reading.</p>

        <div class="rule"></div>

        <div class="actions">
            <a class="btn btn-primary" href="{{ url('/book-store') }}">Back to the catalogue</a>
            <a class="btn btn-ghost" href="{{ url('/contact') }}">Report a misprint</a>
        </div>

        <div class="press">PublicationMart Press</div>
    </main>
</body>

</html>
