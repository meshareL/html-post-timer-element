/**
 * HTMLPostTimerElement
 *
 * @example
 * <input id="csrf" name="_csrf" value="......" type="hidden">
 * <input id="email" name="email" value="email@email.com" type="email">
 *
 * <post-timer forbidden-time="120" href="https://xx.xxx.com/post" for="csrf, email">
 *     <input name="username" value="username" type="hidden">
 *     <span data-original-content>Get captcha</span>
 *     <p data-timekeeping-content hidden>
 *         Resend after
 *         <span data-timekeeping-content-time></span>
 *         seconds
 *     </p>
 *     <span data-afresh-content hidden>Resend</span>
 * </post-timer>
 */
declare class HTMLPostTimerElement extends HTMLElement {
    /**
     * The for attribute and element contain all the input elements
     */
    readonly inputs: HTMLInputElement[];
    /**
     * Send the url
     */
    href: string;
    /**
     * The time when the element is disabled
     */
    forbiddenTime: number;
    /**
     * Disable the element
     */
    disabled: boolean;
    /**
     * Reset the element to its original state
     */
    reset(): void;
}

declare global {
    interface Window {
        HTMLPostTimerElement: typeof HTMLPostTimerElement;
    }
}

export default HTMLPostTimerElement;
