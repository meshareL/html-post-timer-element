'use strict';
(function() {
	const input = document.querySelector('input[name="csrf"]');
	if (input instanceof HTMLInputElement) {
		input.value = Math.random().toString(36).slice(2);
	}

	document.addEventListener('post-timer:ajax-send', event => {
		const postTimer = event.target;
		if (!(postTimer instanceof HTMLPostTimerElement)) return;

		postTimer.classList.add('disabled');

		const {requestInit} = event.detail;
		if (!requestInit) return;

		const {body} = requestInit;
		if (!body) return;

		const reuqestBody = {};
		for (const [key, value] of body.entries()) {
			reuqestBody[key] = value;
		}

		const hint = document.querySelector('pre code');
		if (!(hint instanceof HTMLElement)) return;

		hint.innerHTML = JSON.stringify(reuqestBody, null, '  ');

		hljs.highlightBlock(hint);
	});

	document.addEventListener('post-timer:timekeeping-end', event => {
		const postTimer = event.target;
		if (!(postTimer instanceof HTMLPostTimerElement)) return;

		postTimer.classList.remove('disabled');
	});

	document.addEventListener('click', event => {
		const target = event.target;
		if (!(target instanceof Element)) return;

		const button = target.closest('button');
		if (!(button instanceof HTMLButtonElement)) return;

		!event.defaultPrevented && event.preventDefault();

		const postTimer = document.querySelector('post-timer');
		if (!(postTimer instanceof window.HTMLPostTimerElement)) return;

		postTimer.reset();
		postTimer.classList.remove('disabled');

		const hint = document.querySelector('pre code');
		if (!(hint instanceof HTMLElement)) return;

		hint.innerHTML = '';
	});
}());
