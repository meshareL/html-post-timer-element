'use strict';
import {hiddenElement, exhibitElement} from './util';

const disabling = new WeakMap<HTMLPostTimerElement, number>();

const enum Selectors {
    ORIGINAL = '[data-original-content]',
    TIMEKEEPING = '[data-timekeeping-content]',
    TIMEKEEPING_TIME = '[data-timekeeping-content-time]',
    AFRESH = '[data-afresh-content]'
}

function timekeeping(element: HTMLPostTimerElement): void {
    const inputs = element.inputs;
    // Do not enter again during the countdown
    inputs.forEach(input => input.readOnly = true);

    element.disabled = true;

    const timekeeping = element.querySelector(Selectors.TIMEKEEPING);
    if (!(timekeeping instanceof HTMLElement)) return;

    const timekeepingTime = timekeeping.querySelector(Selectors.TIMEKEEPING_TIME);
    if (!(timekeepingTime instanceof Element)) return;

    element.dispatchEvent(new CustomEvent('post-timer:timekeeping-start', {bubbles: true}));

    hiddenElement(element, [Selectors.ORIGINAL, Selectors.AFRESH]);
    timekeeping.hidden = false;

    let time = element.forbiddenTime;
    timekeepingTime.textContent = time.toString(10);

    const interval = window.setInterval(() => {
        time--;
        if (time > 0) {
            timekeepingTime.textContent = time.toString(10);
        } else {
            element.dispatchEvent(new CustomEvent('post-timer:timekeeping-end', {bubbles: true}));
            // Reset element style when countdown ends
            countdownEnd(element);
            window.clearInterval(interval);
        }
    }, 1000);
    disabling.set(element, interval);
}

function countdownEnd(element: HTMLPostTimerElement): void {
    disabling.delete(element);

    element.disabled = false;
    element.inputs.forEach(input => input.readOnly = false);

    hiddenElement(element, [Selectors.ORIGINAL, Selectors.TIMEKEEPING]);

    const afresh = document.querySelector(Selectors.AFRESH);
    if (!(afresh instanceof HTMLElement)) return;

    afresh.hidden = false;
}

/**
 * Post the request
 *
 * @param event Event
 */
async function poster(event: MouseEvent | KeyboardEvent): Promise<void> {
    if (event instanceof KeyboardEvent && event.type === 'keydown') {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }
    }

    const element = event.currentTarget;
    if (!(element instanceof HTMLPostTimerElement)) return;

    if (element.disabled || disabling.has(element)) return;

    const href = element.href;
    if (!href) return;

    const inputs = element.inputs;
    if (!inputs.every(input => input.checkValidity())) return;

    const body = inputs
        .map<[string, string]>(input => [input.name.trim(), input.value.trim()])
        .reduce<{ [key: string]: string }>((prev, [name, value]) => {
            return {
                ...prev,
                [name]: value
            };
        }, {});

    let dispatched = element.dispatchEvent(new CustomEvent('post-timer:ajax-start', {bubbles: true, cancelable: true}));
    if (!dispatched) return;

    const requestInit: RequestInit = {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: new Headers({'X-Requested-With': 'XMLHttpRequest', 'Accept': '*/*'}),
        body: new URLSearchParams(body)
    };

    dispatched = element.dispatchEvent(new CustomEvent('post-timer:ajax-send', {bubbles: true, cancelable: true, detail: {requestInit}}));
    if (!dispatched) return;

    try {
        const response = await fetch(href, requestInit);
        element.dispatchEvent(new CustomEvent('post-timer:ajax-end', {bubbles: true}));

        if (response.ok) {
            element.dispatchEvent(new CustomEvent('post-timer:ajax-success', {bubbles: true, detail: {response: response.clone()}}));
            // Start countdown
            timekeeping(element);
        } else {
            element.dispatchEvent(new CustomEvent('post-timer:ajax-error', {bubbles: true, detail: {response: response.clone()}}));
            hiddenElement(element, [Selectors.ORIGINAL, Selectors.TIMEKEEPING]);
            exhibitElement(element, Selectors.AFRESH);
        }
    } catch (error) {
        element.dispatchEvent(new CustomEvent('post-timer:network-error', {bubbles: true, detail: {error}}));
        hiddenElement(element, [Selectors.ORIGINAL, Selectors.TIMEKEEPING]);
        exhibitElement(element, Selectors.AFRESH);
    }
}

/**
 * Customize the HTMLPostTimerElement element
 */
class HTMLPostTimerElement extends HTMLElement {
    connectedCallback() {
        this.setAttribute('tabindex', '0');
        this.setAttribute('aria-keyshortcuts', 'Enter Scape');
        !this.hasAttribute('role') && this.setAttribute('role', 'button');

        this.addEventListener('click', poster);
        this.addEventListener('keydown', poster);
    }

    disconnectedCallback() {
        disabling.delete(this);
        this.removeEventListener('click', poster);
        this.removeEventListener('keydown', poster);
    }

    get inputs(): HTMLInputElement[] {
        const target = this.getAttribute('for') || '';
        const ids = target.split(/,\s+/);

        const inputs: HTMLInputElement[] = [];
        for (const id of ids) {
            const element = document.getElementById(id);
            if (!(element instanceof HTMLInputElement)) continue;

            inputs.push(element);
        }

        inputs.push(...this.querySelectorAll('input'));
        return inputs;
    }

    get href(): string {
        const href = this.getAttribute('href');
        if (!href) return '';

        const link = (this.ownerDocument || document).createElement('a');
        link.href = href;
        return link.href;
    }

    set href(value: string) {
        if (value) {
            this.setAttribute('href', value);
        } else {
            this.removeAttribute('href');
        }
    }

    get forbiddenTime(): number {
        const time = this.getAttribute('forbidden-time');
        return time ? Number.parseInt(time, 10) : 120;
    }

    set forbiddenTime(value: number) {
        if (value) {
            this.setAttribute('forbidden-time', String(value));
        } else {
            this.removeAttribute('forbidden-time');
        }
    }

    get disabled(): boolean {
        return this.hasAttribute('disabled');
    }

    set disabled(value: boolean) {
        if (value) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    /**
     * Reset the element to its original state
     */
    reset(): void {
        hiddenElement(this, [Selectors.TIMEKEEPING, Selectors.AFRESH]);
        exhibitElement(this, Selectors.ORIGINAL);

        this.disabled = false;
        this.inputs.forEach(input => input.readOnly = false);

        const interval = disabling.get(this);
        if (!interval) return;

        window.clearInterval(interval);
        disabling.delete(this);
    }
}

export default HTMLPostTimerElement;
