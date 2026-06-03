@extends('layout.v2')
@section('content')
<div class="app-content">
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="page-header">
                    <div class="page-header-left">
                        <h1 class="page-header-title">
                            <span class="page-header-icon"><em class="fa fa-fire"></em></span>
                            {{ trans('firefly.welcome') }}
                        </h1>
                    </div>
                </div>
            </div>
        </div>

        @if($errors->any())
            <div class="alert alert-danger">
                <ul class="mb-0">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        @if(session()->has('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @endif

        <form action="{{ route('new-user.submit') }}" method="POST">
            @csrf

            {{-- Main bank account --}}
            <div class="card mb-3">
                <div class="card-header">
                    <h3 class="card-title">{{ trans('firefly.your_main_account') }}</h3>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label for="bank_name" class="form-label">{{ trans('form.bank_name') }}</label>
                        <input type="text" class="form-control" id="bank_name" name="bank_name"
                               value="{{ old('bank_name', trans('firefly.default_bank_name')) }}" required>
                    </div>
                    <div class="mb-3">
                        <label for="bank_balance" class="form-label">{{ trans('form.bank_balance') }}</label>
                        <div class="input-group">
                            <select name="amount_currency_id_bank_balance" class="form-select" style="max-width:140px;">
                                @foreach(\FireflyIII\Models\TransactionCurrency::where('enabled', true)->orderBy('code')->get() as $currency)
                                    <option value="{{ $currency->id }}" @if($currency->userDefault) selected @endif>
                                        {{ $currency->code }} — {{ $currency->name }}
                                    </option>
                                @endforeach
                            </select>
                            <input type="number" step="0.01" class="form-control" id="bank_balance"
                                   name="bank_balance" value="{{ old('bank_balance', '0') }}" required>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Savings account (optional) --}}
            <div class="card mb-3">
                <div class="card-header">
                    <h3 class="card-title">{{ trans('firefly.savings_account') }} <small class="text-muted">{{ trans('form.optional') }}</small></h3>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label for="savings_balance" class="form-label">{{ trans('form.savings_balance') }}</label>
                        <div class="input-group">
                            <select name="amount_currency_id_savings_balance" class="form-select" style="max-width:140px;">
                                @foreach(\FireflyIII\Models\TransactionCurrency::where('enabled', true)->orderBy('code')->get() as $currency)
                                    <option value="{{ $currency->id }}" @if($currency->userDefault) selected @endif>
                                        {{ $currency->code }} — {{ $currency->name }}
                                    </option>
                                @endforeach
                            </select>
                            <input type="number" step="0.01" class="form-control" id="savings_balance"
                                   name="savings_balance" value="{{ old('savings_balance') }}" placeholder="0.00">
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-12 text-end">
                    <button type="submit" class="btn btn-primary btn-lg">
                        <em class="fa fa-arrow-right me-1"></em>
                        {{ trans('firefly.submit') }}
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection
