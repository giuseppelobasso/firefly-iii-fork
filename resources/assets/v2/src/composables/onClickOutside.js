/**
 * Composable: calls handler when click occurs outside the given ref element.
 */
export function onClickOutside(elementRef, handler) {
    const listener = (event) => {
        if (elementRef.value && !elementRef.value.contains(event.target)) {
            handler(event);
        }
    };
    document.addEventListener('mousedown', listener, {passive: true});
    return () => document.removeEventListener('mousedown', listener);
}
