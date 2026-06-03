@extends('layout.v2.session')
@section('content')

    @if(session()->has('success'))
        <div class="ff-alert ff-alert-success">{{ session('success') }}</div>
    @endif

    @if($errors->any())
        <div class="ff-alert ff-alert-danger">
            <ul>
            @foreach($errors->getBags() as $bag)
                @foreach($bag->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            @endforeach
            </ul>
        </div>
    @endif

    <div id="client-errors" class="ff-alert ff-alert-danger" style="display:none;">
        <ul id="client-errors-list"></ul>
    </div>

    <div class="ff-card ff-card--elevated" style="padding: 1.5rem;">
        <p class="ff-session-subtitle">{{ trans('firefly.register_new_account') }}</p>

        <form action="{{ route('register') }}" method="post">
            <input type="hidden" name="_token" value="{{ csrf_token() }}">
            <input type="hidden" name="invite_code" value="{{ $inviteCode ?? '' }}">

            <div class="ff-input-group">
                <input type="email" name="email" autofocus required value="{{ $email }}"
                       class="ff-input" placeholder="{{ trans('form.email') }}">
                <span class="ff-input-icon"><em class="fa-solid fa-envelope"></em></span>
            </div>

            <div class="ff-input-group">
                <input type="password" autocomplete="new-password" required class="ff-input"
                       placeholder="{{ trans('form.password') }}" minlength="16" name="password">
                <span class="ff-input-icon"><em class="fa-solid fa-lock"></em></span>
            </div>

            <div class="ff-input-group">
                <input type="password" autocomplete="new-password" minlength="16" required class="ff-input"
                       placeholder="{{ trans('form.password_confirmation') }}" name="password_confirmation">
                <span class="ff-input-icon"><em class="fa-solid fa-lock"></em></span>
            </div>

            <label class="ff-form-check" style="margin-bottom: 1.25rem;">
                <input type="checkbox" id="verify_password" checked name="verify_password" value="1">
                {{ trans('form.verify_password') }}
                <a href="#" class="ff-session-link" onclick="document.getElementById('passwordModal').showModal(); return false;">
                    <em class="fa fa-fw fa-question-circle"></em>
                </a>
            </label>

            <button type="submit" class="ff-btn ff-btn-primary ff-btn-full">
                {{ trans('firefly.register') }}
            </button>
        </form>

        <div class="ff-session-links">
            <a class="ff-session-link" href="{{ route('login') }}">{{ trans('firefly.want_to_login') }}</a>
            <a class="ff-session-link" href="{{ route('password.reset.request') }}">{{ trans('firefly.forgot_my_password') }}</a>
        </div>
    </div>

    @include('partials.password-modal')

@endsection
@section('scripts')
    <script nonce="{{ $JS_NONCE }}">
        (function () {
            'use strict';
            var passwordLengthError = '{{ blade_escape_js((string)trans('validation.min.string', ['attribute' => 'password', 'min' => 16])) }}';
            var passwordMatchError  = '{{ blade_escape_js(trans('validation.confirmed', ['attribute' => 'password'])) }}';
            var form    = document.querySelector('form');
            var errDiv  = document.getElementById('client-errors');
            var errList = document.getElementById('client-errors-list');
            if (!form) return;

            form.addEventListener('submit', function (e) {
                var pwd  = form.querySelector('[name="password"]');
                var conf = form.querySelector('[name="password_confirmation"]');
                var errors = [];
                if (pwd && pwd.value.length < 16)           errors.push(passwordLengthError);
                if (pwd && conf && pwd.value !== conf.value) errors.push(passwordMatchError);
                if (errors.length) {
                    e.preventDefault();
                    errList.innerHTML = errors.map(function (m) { return '<li>' + m + '</li>'; }).join('');
                    errDiv.style.display = '';
                }
            });
        })();
    </script>
@endsection

