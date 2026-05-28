<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Firefly III</title>
    <script>window.__localeId__ = '{{ str_replace('-', '_', app()->getLocale()) }}';</script>
    @vite(['resources/assets/v2/src/css/app.css', 'resources/assets/v2/src/main.js'], 'build/v2')
</head>
<body>
    <div id="app"></div>
</body>
</html>
