'use strict';

function hiddenElement(element, selectors) {
    selectors.forEach(selector => element.querySelectorAll(selector).forEach(el => el.hidden = true));
}

function exhibitElement(element, selectors) {
    selectors.forEach(selector => element.querySelectorAll(selector).forEach(el => el.hidden = false));
}

const content = `<input name="name" value="name" required type="text">
<span data-original-content>Get captcha</span>
<p data-timekeeping-content hidden>
    Resend after
    <span data-timekeeping-content-time></span>
    seconds
</p>
<span data-afresh-content hidden>Resend</span>`;

describe('html-post-timer-element', () => {
    /** @type {HTMLPostTimerElement} */
    let element;
    /** @type {HTMLSpanElement} */
    let original;
    /** @type {HTMLParagraphElement} */
    let timekeeping;
    /** @type {HTMLSpanElement} */
    let afresh;
    /** @type {HTMLInputElement[]} */
    let inputs;

    beforeEach(() => {
        const ids = [];
        const input = document.createElement('input');
        input.id = 'csrf';
        input.name = 'csrf';
        input.value = 'token';
        input.required = true;
        input.type = 'hidden';

        document.body.append(input.cloneNode(true));
        ids.push(input.id);

        input.id = 'email';
        input.name = 'email';
        input.value = 'email@email.com';
        input.required = true;
        input.type = 'email';

        document.body.append(input.cloneNode(true));
        ids.push(input.id);

        const el = document.createElement('post-timer');
        el.setAttribute('for', ids.join(', '));
        el.forbiddenTime = 120;
        el.innerHTML = content;

        document.body.append(el.cloneNode(true));

        element = document.querySelector('post-timer');
        original = document.querySelector('[data-original-content]');
        timekeeping = document.querySelector('[data-timekeeping-content]');
        afresh = document.querySelector('[data-afresh-content]');
        inputs = [...document.querySelectorAll('input')];
    });

    afterEach(() => {
        element = null;
        original = null;
        timekeeping = null;
        afresh = null;
        document.body.innerHTML = '';
    });

    describe('create element', () => {
        it('from createElement', () => {
            const element = document.createElement('post-timer');
            assert.equal('POST-TIMER', element.nodeName);
        });

        it('from constructor', () => {
            const element = new window.HTMLPostTimerElement();
            assert.equal('POST-TIMER', element.nodeName);
        });
    });

    describe('event', () => {
        it('event order', async () => {
            element.href = '/success';
            element.forbiddenTime = 1;
            const events = [];
            document.addEventListener('post-timer:ajax-start', () => events.push('ajax-start'), {once: true});
            document.addEventListener('post-timer:ajax-send', () => events.push('ajax-send'), {once: true});
            document.addEventListener('post-timer:ajax-end', () => events.push('ajax-end'), {once: true});
            document.addEventListener('post-timer:ajax-success', () => events.push('ajax-success'), {once: true});
            document.addEventListener('post-timer:timekeeping-start', () => events.push('timekeeping-start'), {once: true});
            document.addEventListener('post-timer:timekeeping-end', () => events.push('timekeeping-end'), {once: true});

            const all = Promise.all([
                new Promise(resolve => document.addEventListener('post-timer:ajax-start', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('post-timer:ajax-send', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('post-timer:ajax-end', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('post-timer:ajax-success', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('post-timer:timekeeping-start', resolve, {once: true})),
                new Promise(resolve => document.addEventListener('post-timer:timekeeping-end', resolve, {once: true}))
            ]);

            element.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            await all;

            assert.deepEqual(['ajax-start', 'ajax-send', 'ajax-end', 'ajax-success', 'timekeeping-start', 'timekeeping-end'], events);
        });
    });

    describe('post request', () => {
        it('input elements detection failed, does not dispatch any event', done => {
            const input = document.createElement('input');
            input.id = 'password';
            input.name = 'password';
            input.required = true;
            input.type = 'password';
            document.body.append(input.cloneNode(true));

            element.setAttribute('for', element.getAttribute('for') + `, ${input.id}`);

            let dispatched = false;
            document.addEventListener('post-timer:ajax-start', () => dispatched = true, {once: true});

            window.setTimeout(() => !dispatched && done(), 1000);
        });

        it('request success', done => {
            document.addEventListener('post-timer:ajax-success', () => done(), {once: true});

            element.href = '/success';
            element.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

        it('post-timer:ajax-send event requestInit element', done => {
            document.addEventListener('post-timer:ajax-send', /** CustomEvent<{requestInit: RequestInit}> */event => {
                const init = event.detail.requestInit;
                assert.isNotNull(init);

                inputs.forEach(input => assert.equal(init.body.get(input.name), input.value));
                done();
            }, {once: true});

            element.href = '/success';
            element.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

        it('request error', done => {
            document.addEventListener('post-timer:ajax-error', () => done(), {once: true});

            element.href = '/fail';
            element.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
    });

    describe('prompt information', () => {
        it('start the countdown', done => {
            document.addEventListener('post-timer:timekeeping-start', () => {
                window.setTimeout(() => {
                    assert.isTrue(original.hidden);
                    assert.isFalse(timekeeping.hidden);
                    assert.isTrue(afresh.hidden);
                    done();
                }, 1000);
            }, {once: true});

            element.forbiddenTime = 2;
            element.href = '/success';
            element.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

        it('the countdown is over', done => {
            document.addEventListener('post-timer:timekeeping-end', () => {
                window.setTimeout(() => {
                    assert.isTrue(original.hidden);
                    assert.isTrue(timekeeping.hidden);
                    assert.isFalse(afresh.hidden);
                    done();
                }, 1000);
            });

            element.forbiddenTime = 1;
            element.href = '/success';
            element.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
    });

    describe('reset element state', () => {
        it('current timekeeping state', () => {
            hiddenElement(element, ['[data-original-content]', '[data-afresh-content]']);
            exhibitElement(element, ['[data-timekeeping-content]']);
            assert.isTrue(original.hidden);
            assert.isFalse(timekeeping.hidden);
            assert.isTrue(afresh.hidden);

            element.reset();
            assert.isFalse(original.hidden);
            assert.isTrue(timekeeping.hidden);
            assert.isTrue(afresh.hidden);
        });

        it('current afresh state', () => {
            hiddenElement(element, ['[data-original-content]', '[data-timekeeping-content]']);
            exhibitElement(element, ['[data-afresh-content]']);
            assert.isTrue(original.hidden);
            assert.isTrue(timekeeping.hidden);
            assert.isFalse(afresh.hidden);

            element.reset();
            assert.isFalse(original.hidden);
            assert.isTrue(timekeeping.hidden);
            assert.isTrue(afresh.hidden);
        });
    });
});
