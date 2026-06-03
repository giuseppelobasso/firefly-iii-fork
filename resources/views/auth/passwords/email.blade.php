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

    <div class="ff-card ff-card--elevated" style="padding: 1.5rem;">
        @if(session('status'))
            <p class="ff-session-subtitle" style="color: var(--ff-positive);">{{ session('status') }}</p>
        @else
            <p class="ff-session-subtitle">{{ trans('firefly.reset_password') }}</p>
            <form action="{{ route('password.email') }}" method="post">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">
                <div class="ff-input-group">
                    <input type="email" autofocus required class="ff-input" name="email"
                           placeholder="{{ trans('form.email') }}">
                    <span class="ff-input-icon"><em class="fa-solid fa-envelope"></em></span>
                </div>
                <button type="submit" class="ff-btn ff-btn-primary ff-btn-full">
                    {{ trans('firefly.reset_button') }}
                </button>
            </form>

            <div class="ff-session-links">
                <a class="ff-session-link" href="{{ route('login') }}">{{ trans('firefly.want_to_login') }}</a>
                @if($allowRegistration)
                    <a class="ff-session-link" href="{{ route('register') }}">{{ trans('firefly.register_new_account') }}</a>
                @endif
            </div>
        @endif
    </div>

@endsection

