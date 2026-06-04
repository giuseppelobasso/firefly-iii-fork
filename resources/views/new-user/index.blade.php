@extends('layout.v2.session')
@section('content')
<div class="view" style="max-width: 640px; padding: 1.5rem;">

    <div class="view-header">
        <div class="view-header-left">
            <h1 class="view-title">
                <i class="fa fa-fire"></i>
                {{ trans('firefly.welcome') }}
            </h1>
        </div>
    </div>

    @if($errors->any())
        <div class="ff-alert ff-alert-danger">
            <ul>
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if(session()->has('success'))
        <div class="ff-alert ff-alert-success">{{ session('success') }}</div>
    @endif

    <form action="{{ route('new-user.submit') }}" method="POST">
        @csrf

        {{-- Main bank account --}}
        <div class="ff-card" style="margin-bottom: 1rem;">
            <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--ff-border-subtle);">
                <span class="section-title" style="margin:0;"><i class="fa-solid fa-building-columns"></i>{{ trans('firefly.your_main_account') }}</span>
            </div>
            <div style="padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
                <div>
                    <label class="ff-label" for="bank_name">{{ trans('form.bank_name') }}</label>
                    <div class="ff-input-group" style="margin-bottom:0;">
                        <input type="text" class="ff-input" id="bank_name" name="bank_name"
                               style="padding-right:0.75rem;"
                               value="{{ old('bank_name', trans('firefly.default_bank_name')) }}" required>
                    </div>
                </div>
                <div>
                    <label class="ff-label" for="bank_balance">{{ trans('form.bank_balance') }}</label>
                    <div class="ff-input-row">
                        <select name="amount_currency_id_bank_balance" class="ff-select">
                            @foreach(\FireflyIII\Models\TransactionCurrency::where('enabled', true)->orderBy('code')->get() as $currency)
                                <option value="{{ $currency->id }}" @if($currency->userDefault) selected @endif>
                                    {{ $currency->code }}
                                </option>
                            @endforeach
                        </select>
                        <input type="number" step="0.01" class="ff-input" id="bank_balance"
                               name="bank_balance" value="{{ old('bank_balance', '0') }}" required
                               style="padding-right:0.75rem;">
                    </div>
                </div>
            </div>
        </div>

        {{-- Savings account (optional) --}}
        <div class="ff-card" style="margin-bottom: 1.5rem;">
            <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--ff-border-subtle);">
                <span class="section-title" style="margin:0;">
                    <i class="fa-solid fa-piggy-bank"></i>
                    {{ trans('firefly.savings_account') }}
                    <span style="font-size:0.75rem; font-weight:400; color: var(--ff-text-subtle); margin-left:0.25rem;">{{ trans('form.optional') }}</span>
                </span>
            </div>
            <div style="padding: 1rem 1.25rem;">
                <label class="ff-label" for="savings_balance">{{ trans('form.savings_balance') }}</label>
                <div class="ff-input-row">
                    <select name="amount_currency_id_savings_balance" class="ff-select">
                        @foreach(\FireflyIII\Models\TransactionCurrency::where('enabled', true)->orderBy('code')->get() as $currency)
                            <option value="{{ $currency->id }}" @if($currency->userDefault) selected @endif>
                                {{ $currency->code }}
                            </option>
                        @endforeach
                    </select>
                    <input type="number" step="0.01" class="ff-input" id="savings_balance"
                           name="savings_balance" value="{{ old('savings_balance') }}" placeholder="0.00"
                           style="padding-right:0.75rem;">
                </div>
            </div>
        </div>

        <div style="display:flex; justify-content:flex-end;">
            <button type="submit" class="ff-btn ff-btn-primary" style="width:auto; padding: 0.6rem 1.5rem; font-size: 0.9375rem;">
                <em class="fa fa-arrow-right"></em>
                {{ trans('firefly.submit') }}
            </button>
        </div>
    </form>
</div>
@endsection

