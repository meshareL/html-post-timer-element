'use strict';
import HTMLPostTimerElement from './index';

/**
 * Hides the element with the given selector
 *
 * @param element HTMLPostTimerElement
 * @param selectors CSS selector
 */
function hiddenElement(element: HTMLPostTimerElement, selectors: string[]): void {
    selectors.forEach(selector => element.querySelectorAll(selector).forEach(el => el.setAttribute('hidden', '')));
}

/**
 * Display an element with a given selector
 *
 * @param element HTMLPostTimerElement
 * @param selector CSS selector
 */
function exhibitElement(element: HTMLPostTimerElement, selector: string): void {
    const el = element.querySelector(selector);
    if (!(el instanceof Element)) return;

    el.removeAttribute('hidden');
}

export { hiddenElement, exhibitElement };
