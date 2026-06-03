@extends('layout.v2.session')
@section('content')

    @if(true===$IS_DEMO_SITE)
    <div class="ff-alert ff-alert-info">
        {{ __('firefly.welcome_back') }}<br>
        <strong>{{ $DEMO_USERNAME }}</strong> / <strong>{{ $DEMO_PASSWORD }}</strong>
    </div>
    @endif

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

    @if(session('logoutMessage'))
        <div class="ff-alert ff-alert-info">{{ session('logoutMessage') }}</div>
    @endif

    <div class="ff-card ff-card--elevated" style="padding: 1.5rem;">
        <p class="ff-session-subtitle">{{ __('firefly.sign_in_to_start') }}</p>

        <form action="{{ route('login.post') }}" method="post">
            <input type="hidden" name="_token" value="{{ csrf_token() }}">

            @if(config('firefly.authentication_guard') === 'web')
            <div class="ff-input-group">
                <input type="email" name="email" autofocus required class="ff-input"
                       placeholder="{{ trans('form.email') }}"
                       value="@if(true===$IS_DEMO_SITE){{ $DEMO_USERNAME }}@else{{ $email }}@endif">
                <span class="ff-input-icon"><em class="fa-solid fa-envelope"></em></span>
            </div>
            @else
            <div class="ff-input-group">
                <input type="text" autocomplete="username" autofocus required name="{{ $usernameField }}"
                       class="ff-input" placeholder="{{ trans('form.login_name') }}" value="{{ $email }}">
                <span class="ff-input-icon"><em class="fa-solid fa-user"></em></span>
            </div>
            @endif

            <div class="ff-input-group">
                <input type="password" id="password" name="password" class="ff-input"
                       placeholder="{{ trans('form.password') }}"
                       @if(true===$IS_DEMO_SITE)value="{{ $DEMO_PASSWORD }}"@endif
                       autocomplete="current-password">
                <button type="button" class="ff-input-icon-btn" id="togglePassword" aria-label="Mostra/nascondi password">
                    <em class="fa-solid fa-eye-slash" id="togglePasswordIcon"></em>
                </button>
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
                <label class="ff-form-check">
                    <input type="checkbox" name="remember" id="remember" value="1">
                    {{ trans('form.remember_me') }}
                </label>
                <button type="submit" class="ff-btn ff-btn-primary" style="width:auto; padding: 0.5rem 1.25rem;">
                    {{ trans('firefly.sign_in') }}
                </button>
            </div>
        </form>

        <div class="ff-session-links">
            @if($allowReset)
                <a class="ff-session-link" href="{{ route('password.reset.request') }}">{{ trans('firefly.forgot_my_password') }}</a>
            @endif
            @if($allowRegistration)
                <a class="ff-session-link" href="{{ route('register') }}">{{ trans('firefly.register_new_account') }}</a>
            @endif
        </div>
    </div>

@endsection
@section('scripts')
<script nonce="{{ $JS_NONCE }}">
    (function () {
        var btn  = document.getElementById('togglePassword');
        var pwd  = document.getElementById('password');
        var icon = document.getElementById('togglePasswordIcon');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var show = pwd.getAttribute('type') === 'password';
            pwd.setAttribute('type', show ? 'text' : 'password');
            icon.className = show ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
        });
    })();
</script>
@endsection

