<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A Closed Shelf | PublicationMart</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}?v=2">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=eb-garamond:400,500,600i|figtree:400,600,700&display=swap" rel="stylesheet">
    <style>
        /* The private shelf: the page exists, this reader may not open it.
           Standalone file served without the app shell, so the house palette
           is written out here — same as 404 and 500. */
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

        .shelf {
            position: relative;
            background: #fdfbf5;
            border: 1px solid #d8d1c1;
            max-width: 480px;
            width: 100%;
            padding: 46px 48px 50px;
            box-shadow: 0 18px 44px rgba(23, 21, 15, .13);
        }

        /* a binding cloth strip down the hinge, as on a closed volume */
        .hinge {
            position: absolute;
            left: 0; top: 0; bottom: 0;
            width: 10px;
            background: linear-gradient(90deg, #6e2530, #4d1a22);
        }

        /* the wax seal that keeps it shut */
        .seal {
            width: 54px; height: 54px;
            border-radius: 50%;
            background: radial-gradient(circle at 35% 30%, #8c3541, #5a1e27 70%);
            color: #e8cf8e;
            display: grid;
            place-items: center;
            font-family: 'EB Garamond', Georgia, serif;
            font-size: 23px;
            box-shadow: 0 4px 10px rgba(23, 21, 15, .3);
            margin-bottom: 22px;
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
            margin: 12px 0 12px;
        }

        p {
            font-family: 'EB Garamond', Georgia, serif;
            font-size: 17px;
            line-height: 1.65;
            color: #4b443a;
            max-width: 36ch;
        }

        .rule { height: 1px; background: #d8d1c1; margin: 30px 0 24px; }

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
            .shelf { padding: 36px 28px 40px 34px; }
        }
    </style>
</head>

<body>
    <main class="shelf">
        <div class="hinge"></div>

        <div class="seal" aria-hidden="true">P</div>

        <div class="folio">error 403 &middot; the shelf is closed</div>

        <h1>This one is not on open shelves.</h1>

        <p>The page exists, but your account is not admitted to it. If you believe
            it should be, the desk can check your permissions.</p>

        <div class="rule"></div>

        <div class="actions">
            <a class="btn btn-primary" href="{{ url('/') }}">Back to the front page</a>
            <a class="btn btn-ghost" href="{{ url('/contact') }}">Ask the desk</a>
        </div>

        <div class="press">PublicationMart Press</div>
    </main>
</body>

</html>
