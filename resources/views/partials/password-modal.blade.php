{{-- Password verification info modal (Bootstrap 5) --}}
<div class="modal fade" id="passwordModal" tabindex="-1" aria-labelledby="passwordModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="passwordModalLabel">{{ trans('firefly.password_check_title') }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="{{ trans('general.close') }}"></button>
            </div>
            <div class="modal-body">
                <p>{{ trans('firefly.password_check_intro') }}</p>
                <p>{{ trans('firefly.password_check_hibp') }}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ trans('general.close') }}</button>
            </div>
        </div>
    </div>
</div>
