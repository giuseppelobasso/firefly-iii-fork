{{-- Password verification info modal (native <dialog>, niente Bootstrap) --}}
<dialog id="passwordModal" class="ff-dialog" aria-labelledby="passwordModalLabel">
    <div class="ff-dialog-header">
        <span id="passwordModalLabel">{{ trans('firefly.password_check_title') }}</span>
        <button type="button" class="ff-dialog-close-btn"
                onclick="document.getElementById('passwordModal').close()"
                aria-label="{{ trans('general.close') }}">&times;</button>
    </div>
    <div class="ff-dialog-body">
        <p>{{ trans('firefly.password_check_intro') }}</p>
        <p>{{ trans('firefly.password_check_hibp') }}</p>
    </div>
    <div class="ff-dialog-footer">
        <button type="button" class="ff-btn ff-btn-secondary"
                onclick="document.getElementById('passwordModal').close()">
            {{ trans('general.close') }}
        </button>
    </div>
</dialog>
