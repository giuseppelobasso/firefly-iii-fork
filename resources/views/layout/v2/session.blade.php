<!DOCTYPE html>
<html lang="en">
<head>
    <base href="{{ route('index') }}/" />
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>{{ __('firefly.login_page_title')  }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="title" content="{{ __('firefly.login_page_title')  }}">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="robots" content="noindex, nofollow, noarchive, noodp, NoImageIndex, noydir">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="color-scheme" content="dark light">

    {{-- Applica light mode se l'utente l'ha salvata nel SPA --}}
    <script nonce="{{ $JS_NONCE }}">
        (function () {
            try {
                var m = JSON.parse(localStorage.getItem('darkMode'));
                if (m === 'light' || m === false) {
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.classList.add('light');
                }
            } catch (e) {}
        })();
    </script>

    @vite(['resources/assets/v2/src/css/app.css'], 'build/v2')
</head>

<body class="ff-session-page">
<div class="ff-session-box">
    <div class="ff-session-logo">
        <img src="images/logo-session.png" width="60" height="88" alt="Firefly III Logo" title="Firefly III">
        <br>
        <a href="{{ route('index') }}"><b>Firefly</b> III</a>
    </div>

    @yield('content')
</div>

@yield('scripts')
</body>
</html>

