@extends('layout.v2.session')
@section('content')

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
        <p class="ff-session-subtitle">{{ trans('firefly.reset_password') }}</p>

        <form action="{{ url('/password/reset') }}" method="post">
            <input type="hidden" name="_token" value="{{ csrf_token() }}">
            <input type="hidden" name="token" value="{{ $token }}">

            <div class="ff-input-group">
                <input type="email" name="email" required autofocus class="ff-input"
                       value="{{ old('email') }}" placeholder="{{ trans('form.email') }}">
                <span class="ff-input-icon"><em class="fa-solid fa-envelope"></em></span>
            </div>
            <div class="ff-input-group">
                <input type="password" class="ff-input" required
                       placeholder="{{ trans('form.password') }}" name="password">
                <span class="ff-input-icon"><em class="fa-solid fa-lock"></em></span>
            </div>
            <div class="ff-input-group">
                <input type="password" class="ff-input" required
                       placeholder="{{ trans('form.password_confirmation') }}" name="password_confirmation">
                <span class="ff-input-icon"><em class="fa-solid fa-lock"></em></span>
            </div>

            <label class="ff-form-check" style="margin-bottom: 1.25rem;">
                <input type="checkbox" id="verify_password" checked name="verify_password" value="1">
                {{ trans('form.verify_password') }}
                <a href="#" class="ff-session-link"
                   onclick="document.getElementById('passwordModal').showModal(); return false;">
                    <em class="fa fa-fw fa-question-circle"></em>
                </a>
            </label>

            <button type="submit" class="ff-btn ff-btn-primary ff-btn-full">
                {{ trans('firefly.button_reset_password') }}
            </button>
        </form>

        <div class="ff-session-links">
            <a class="ff-session-link" href="{{ route('login') }}">{{ trans('firefly.want_to_login') }}</a>
            @if($allowRegistration)
                <a class="ff-session-link" href="{{ route('register') }}">{{ trans('firefly.register_new_account') }}</a>
            @endif
        </div>
    </div>

    @include('partials.password-modal')

@endsection

