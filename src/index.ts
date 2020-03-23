'use strict';
import HTMLPostTimerElement from './html-post-timer-element';

if (!window.customElements.get('post-timer')) {
    window.HTMLPostTimerElement = HTMLPostTimerElement;
    window.customElements.define('post-timer', HTMLPostTimerElement);
}

declare global {
    interface Window {
        HTMLPostTimerElement: typeof HTMLPostTimerElement;
    }
}

export default HTMLPostTimerElement;
