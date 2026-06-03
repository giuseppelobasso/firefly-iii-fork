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

    @if(session()->has('error'))
        <div class="ff-alert ff-alert-danger">{{ session('error') }}</div>
    @endif

    <div class="ff-card ff-card--elevated" style="padding: 1.5rem;">
        <p class="ff-session-subtitle">{{ trans('firefly.two_factor_welcome', ['user' => auth()->user()->email]) }}</p>
        <p class="ff-session-subtitle" style="margin-top:-0.75rem;">{{ __('firefly.two_factor_enter_code') }}</p>

        <form action="{{ route('two-factor.submit') }}" method="post">
            <input type="hidden" name="_token" value="{{ csrf_token() }}">
            <div class="ff-input-group">
                <input type="text" autofocus required name="one_time_password"
                       inputmode="numeric" autocomplete="one-time-code"
                       class="ff-input" placeholder="{{ __('firefly.two_factor_code_here') }}">
                <span class="ff-input-icon"><em class="fa-solid fa-calculator"></em></span>
            </div>
            <button type="submit" class="ff-btn ff-btn-primary ff-btn-full">
                {{ __('firefly.authenticate') }}
            </button>
        </form>

        <div class="ff-session-links">
            <a class="ff-session-link" href="{{ route('two-factor.lost') }}">{{ __('firefly.two_factor_forgot') }}</a>
        </div>
    </div>

@endsection

