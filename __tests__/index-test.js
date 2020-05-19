import spring from '@bluecateng/nano-spring';

import reorder from '../src';

jest.unmock('../src');

const createContainer = (r, scrollWidth, scrollHeight) => {
	const container = document.createElement('div');
	container.style.overflowY = 'auto';
	container.style.overflowX = 'auto';
	container.scrollWidth = scrollWidth || r.width;
	container.scrollHeight = scrollHeight || r.height;
	container.getBoundingClientRect = () => r;
	container.setPointerCapture = jest.fn();
	container.releasePointerCapture = jest.fn();
	return container;
};

const createChild = (r) => {
	const child = document.createElement('div');
	child.className = 'draggable';
	child.getBoundingClientRect = () => r;
	return child;
};

class PointerEvent extends MouseEvent {
	constructor(type, eventInitDict) {
		super(type, eventInitDict);
		this.pointerId = eventInitDict.pointerId;
	}
}

Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
	configurable: true,
	enumerable: true,
	writable: true,
	value: 0,
});
Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
	configurable: true,
	enumerable: true,
	writable: true,
	value: 0,
});

describe('reorder', () => {
	describe('pointer', () => {
		it('moves element down', () => {
			const onFinish = jest.fn();
			const container = createContainer({left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20});
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10, width: 20, height: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 0, right: 20, top: 10, bottom: 20});
			container.appendChild(c1);
			reorder(container, {onFinish});
			c0.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 10, clientY: 5, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: 10}));
			expect(c0.className).toBe('draggable placeholder');

			const clone = document.body.lastChild;
			expect(clone.className).toBe('draggable dragging clone');
			expect(clone.style.transform).toBe('translate(0px,5px)');

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: 20}));
			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: 20}));
			expect(c0.style.transform).toBe('');
			expect(c1.style.transform).toBe('translate(0px,-10px)');
			expect(clone.style.transform).toBe('translate(0px,15px)');

			jest.runOnlyPendingTimers();
			expect(c0.style.transform).toBe('');
			expect(c1.style.transform).toBe('');
			expect(c1.nextSibling).toBe(c0);

			container.dispatchEvent(new PointerEvent('pointerup', {pointerId: 1}));
			expect(container.releasePointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('lostpointercapture', {}));
			expect(spring.mock.calls).toEqual([[250, 30, expect.any(Function), expect.any(Function)]]);
			spring.mock.calls[0][2](0.5);
			expect(clone.style.transform).toBe('translate(0px,7.5px)');

			spring.mock.calls[0][3]();
			expect(c0.className).toBe('draggable');
			expect(onFinish.mock.calls).toEqual([[c0]]);
		});

		it('moves element up', () => {
			const onFinish = jest.fn();
			const container = createContainer({left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20});
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 0, right: 20, top: 10, bottom: 20, width: 20, height: 10});
			container.appendChild(c1);
			reorder(container, {onFinish});
			c1.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 10, clientY: 15, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: 10}));
			expect(c1.className).toBe('draggable placeholder');

			const clone = document.body.lastChild;
			expect(clone.className).toBe('draggable dragging clone');
			expect(clone.style.transform).toBe('translate(0px,5px)');

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: 5}));
			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: 0}));
			expect(c1.style.transform).toBe('');
			expect(c0.style.transform).toBe('translate(0px,10px)');
			expect(clone.style.transform).toBe('translate(0px,-5px)');

			jest.runOnlyPendingTimers();
			expect(c1.style.transform).toBe('');
			expect(c0.style.transform).toBe('');
			expect(c0.previousSibling).toBe(c1);

			container.dispatchEvent(new PointerEvent('pointerup', {pointerId: 1}));
			expect(container.releasePointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('lostpointercapture', {}));
			expect(spring.mock.calls).toEqual([[250, 30, expect.any(Function), expect.any(Function)]]);
			spring.mock.calls[0][2](0.5);
			expect(clone.style.transform).toBe('translate(0px,2.5px)');

			spring.mock.calls[0][3]();
			expect(c1.className).toBe('draggable');
			expect(onFinish.mock.calls).toEqual([[c1]]);
		});

		it('moves element right', () => {
			const onFinish = jest.fn();
			const container = createContainer({left: 0, right: 40, top: 0, bottom: 10, width: 40, height: 10});
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10, width: 20, height: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 20, right: 40, top: 0, bottom: 10});
			container.appendChild(c1);
			reorder(container, {horizontal: true, onFinish});
			c0.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 10, clientY: 5, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 20, clientY: 5}));
			expect(c0.className).toBe('draggable placeholder');

			const clone = document.body.lastChild;
			expect(clone.className).toBe('draggable dragging clone');
			expect(clone.style.transform).toBe('translate(10px,0px)');

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 40, clientY: 5}));
			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 40, clientY: 5}));
			expect(c0.style.transform).toBe('');
			expect(c1.style.transform).toBe('translate(-20px,0px)');
			expect(clone.style.transform).toBe('translate(30px,0px)');

			jest.runOnlyPendingTimers();
			expect(c0.style.transform).toBe('');
			expect(c1.style.transform).toBe('');
			expect(c1.nextSibling).toBe(c0);

			container.dispatchEvent(new PointerEvent('pointerup', {pointerId: 1}));
			expect(container.releasePointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('lostpointercapture', {}));
			expect(spring.mock.calls).toEqual([[250, 30, expect.any(Function), expect.any(Function)]]);
			spring.mock.calls[0][2](0.5);
			expect(clone.style.transform).toBe('translate(15px,0px)');

			spring.mock.calls[0][3]();
			expect(c0.className).toBe('draggable');
			expect(onFinish.mock.calls).toEqual([[c0]]);
		});

		it('moves element left', () => {
			const onFinish = jest.fn();
			const container = createContainer({left: 0, right: 40, top: 0, bottom: 10, width: 40, height: 10});
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 20, right: 40, top: 0, bottom: 10, width: 20, height: 10});
			container.appendChild(c1);
			reorder(container, {horizontal: true, onFinish});
			c1.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 30, clientY: 5, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 20, clientY: 5}));
			expect(c1.className).toBe('draggable placeholder');

			const clone = document.body.lastChild;
			expect(clone.className).toBe('draggable dragging clone');
			expect(clone.style.transform).toBe('translate(10px,0px)');

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: 5}));
			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 0, clientY: 5}));
			expect(c1.style.transform).toBe('');
			expect(c0.style.transform).toBe('translate(20px,0px)');
			expect(clone.style.transform).toBe('translate(-10px,0px)');

			jest.runOnlyPendingTimers();
			expect(c1.style.transform).toBe('');
			expect(c0.style.transform).toBe('');
			expect(c0.previousSibling).toBe(c1);

			container.dispatchEvent(new PointerEvent('pointerup', {pointerId: 1}));
			expect(container.releasePointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('lostpointercapture', {}));
			expect(spring.mock.calls).toEqual([[250, 30, expect.any(Function), expect.any(Function)]]);
			spring.mock.calls[0][2](0.5);
			expect(clone.style.transform).toBe('translate(5px,0px)');

			spring.mock.calls[0][3]();
			expect(c1.className).toBe('draggable');
			expect(onFinish.mock.calls).toEqual([[c1]]);
		});

		it('scrolls container down', () => {
			const container = createContainer({left: 0, right: 20, top: 0, bottom: 10, width: 20, height: 10}, 20, 20);
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10, width: 20, height: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 0, right: 20, top: 10, bottom: 20});
			container.appendChild(c1);
			reorder(container, {});
			c0.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 10, clientY: 5, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: 10}));
			expect(c0.className).toBe('draggable placeholder');

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: 15}));
			expect(c1.style.transform).toBe('translate(0px,-10px)');
			expect(container.scrollTop).toBe(10);

			jest.runOnlyPendingTimers();
			expect(c1.nextSibling).toBe(c0);
		});

		it('scrolls container up', () => {
			const container = createContainer({left: 0, right: 20, top: 0, bottom: 10, width: 20, height: 10}, 20, 20);
			container.scrollTop = 10;
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: -10, bottom: 0});
			container.appendChild(c0);
			const c1 = createChild({left: 0, right: 20, top: 0, bottom: 10, width: 20, height: 10});
			container.appendChild(c1);
			reorder(container, {});
			c1.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 10, clientY: 5, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: 0}));
			expect(c1.className).toBe('draggable placeholder');

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: -5}));
			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 10, clientY: -5}));
			expect(c0.style.transform).toBe('translate(0px,10px)');
			expect(container.scrollTop).toBe(0);

			jest.runOnlyPendingTimers();
			expect(c0.previousSibling).toBe(c1);
		});

		it('scrolls container right', () => {
			const container = createContainer({left: 0, right: 20, top: 0, bottom: 10, width: 20, height: 10}, 40, 10);
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10, width: 20, height: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 20, right: 40, top: 0, bottom: 10});
			container.appendChild(c1);
			reorder(container, {horizontal: true});
			c0.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 10, clientY: 5, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 20, clientY: 5}));
			expect(c0.className).toBe('draggable placeholder');

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 30, clientY: 5}));
			expect(c1.style.transform).toBe('translate(-20px,0px)');
			expect(container.scrollLeft).toBe(20);

			jest.runOnlyPendingTimers();
			expect(c1.nextSibling).toBe(c0);
		});

		it('scrolls container left', () => {
			const container = createContainer({left: 0, right: 20, top: 0, bottom: 10, width: 20, height: 10}, 40, 10);
			container.scrollLeft = 20;
			document.body.appendChild(container);
			const c0 = createChild({left: -20, right: 0, top: 0, bottom: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 0, right: 20, top: 0, bottom: 10, width: 20, height: 10});
			container.appendChild(c1);
			reorder(container, {horizontal: true});
			c1.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 10, clientY: 5, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 0, clientY: 5}));
			expect(c1.className).toBe('draggable placeholder');

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: -10, clientY: 5}));
			expect(c0.style.transform).toBe('translate(20px,0px)');
			expect(container.scrollLeft).toBe(0);

			jest.runOnlyPendingTimers();
			expect(c0.previousSibling).toBe(c1);
		});

		it('sets focus on alternate element if focusSelector is specified', () => {
			const container = document.createElement('div');
			container.setPointerCapture = jest.fn();
			container.releasePointerCapture = jest.fn();
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			const f = document.createElement('div');
			f.className = 'focus';
			f.tabIndex = 0;
			c0.appendChild(f);
			reorder(container, {focusSelector: '.focus'});
			c0.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 0, clientY: 0, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([[1]]);
			expect(document.activeElement).toBe(f);
		});

		it('ignores pointerdown if no draggable is found', () => {
			const container = document.createElement('div');
			container.setPointerCapture = jest.fn();
			container.releasePointerCapture = jest.fn();
			document.body.appendChild(container);
			reorder(container, {});
			container.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 0, clientY: 0, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([]);
		});

		it('ignores pointerdown if the button is not 0', () => {
			const container = document.createElement('div');
			container.setPointerCapture = jest.fn();
			container.releasePointerCapture = jest.fn();
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			reorder(container, {});
			c0.dispatchEvent(
				new PointerEvent('pointerdown', {bubbles: true, button: 1, clientX: 0, clientY: 0, pointerId: 1})
			);
			expect(container.setPointerCapture.mock.calls).toEqual([]);
		});

		it('does not reorder if the pointer does not move', () => {
			const container = document.createElement('div');
			container.setPointerCapture = jest.fn();
			container.releasePointerCapture = jest.fn();
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			reorder(container, {});
			c0.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: 0, clientY: 0, pointerId: 1}));
			expect(container.setPointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('pointermove', {clientX: 1, clientY: 1}));
			container.dispatchEvent(new PointerEvent('pointerup', {pointerId: 1}));
			expect(container.releasePointerCapture.mock.calls).toEqual([[1]]);

			container.dispatchEvent(new PointerEvent('lostpointercapture', {}));
			expect(spring.mock.calls).toEqual([]);
		});
	});

	describe('keyboard', () => {
		it('moves element down', () => {
			const onStart = jest.fn();
			const onMove = jest.fn();
			const onFinish = jest.fn();
			const container = document.createElement('div');
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 0, right: 20, top: 10, bottom: 20});
			container.appendChild(c1);
			reorder(container, {onStart, onMove, onFinish});
			c0.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, keyCode: 32}));
			expect(c0.className).toBe('draggable dragging');
			expect(onStart.mock.calls).toEqual([[c0, 0]]);

			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 40}));
			expect(c0.style.transform).toBe('translate(0px,10px)');
			expect(c1.style.transform).toBe('translate(0px,-10px)');

			jest.runOnlyPendingTimers();
			expect(c0.style.transform).toBe('');
			expect(c1.style.transform).toBe('');
			expect(c1.nextSibling).toBe(c0);

			// try moving past last
			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 40}));
			expect(c1.nextSibling).toBe(c0);

			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
			expect(c0.className).toBe('draggable');
			expect(onMove.mock.calls).toEqual([[c0, 1]]);
			expect(onFinish.mock.calls).toEqual([[c0]]);
		});

		it('moves element up', () => {
			const onStart = jest.fn();
			const onMove = jest.fn();
			const onFinish = jest.fn();
			const container = document.createElement('div');
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 0, right: 20, top: 10, bottom: 20});
			container.appendChild(c1);
			reorder(container, {onStart, onMove, onFinish});
			c1.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, keyCode: 32}));
			expect(c1.className).toBe('draggable dragging');
			expect(onStart.mock.calls).toEqual([[c1, 1]]);

			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 38}));
			expect(c0.style.transform).toBe('translate(0px,10px)');
			expect(c1.style.transform).toBe('translate(0px,-10px)');

			jest.runOnlyPendingTimers();
			expect(c0.style.transform).toBe('');
			expect(c1.style.transform).toBe('');
			expect(c0.previousSibling).toBe(c1);

			// try moving before first
			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 38}));
			expect(c0.previousSibling).toBe(c1);

			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
			expect(c1.className).toBe('draggable');
			expect(onMove.mock.calls).toEqual([[c1, 0]]);
			expect(onFinish.mock.calls).toEqual([[c1]]);
		});

		it('moves element right', () => {
			const onStart = jest.fn();
			const onMove = jest.fn();
			const onFinish = jest.fn();
			const container = document.createElement('div');
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 20, right: 40, top: 0, bottom: 10});
			container.appendChild(c1);
			reorder(container, {horizontal: true, onStart, onMove, onFinish});
			c0.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, keyCode: 32}));
			expect(c0.className).toBe('draggable dragging');
			expect(onStart.mock.calls).toEqual([[c0, 0]]);

			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 39}));
			expect(c0.style.transform).toBe('translate(20px,0px)');
			expect(c1.style.transform).toBe('translate(-20px,0px)');

			jest.runOnlyPendingTimers();
			expect(c0.style.transform).toBe('');
			expect(c1.style.transform).toBe('');
			expect(c1.nextSibling).toBe(c0);

			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
			expect(c0.className).toBe('draggable');
			expect(onMove.mock.calls).toEqual([[c0, 1]]);
			expect(onFinish.mock.calls).toEqual([[c0]]);
		});

		it('moves element left', () => {
			const onStart = jest.fn();
			const onMove = jest.fn();
			const onFinish = jest.fn();
			const container = document.createElement('div');
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 20, right: 40, top: 0, bottom: 10});
			container.appendChild(c1);
			reorder(container, {horizontal: true, onStart, onMove, onFinish});
			c1.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, keyCode: 32}));
			expect(c1.className).toBe('draggable dragging');
			expect(onStart.mock.calls).toEqual([[c1, 1]]);

			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 37}));
			expect(c0.style.transform).toBe('translate(20px,0px)');
			expect(c1.style.transform).toBe('translate(-20px,0px)');

			jest.runOnlyPendingTimers();
			expect(c0.style.transform).toBe('');
			expect(c1.style.transform).toBe('');
			expect(c0.previousSibling).toBe(c1);

			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
			expect(c1.className).toBe('draggable');
			expect(onMove.mock.calls).toEqual([[c1, 0]]);
			expect(onFinish.mock.calls).toEqual([[c1]]);
		});

		it('cancels move on escape', () => {
			const onStart = jest.fn();
			const onMove = jest.fn();
			const onCancel = jest.fn();
			const container = document.createElement('div');
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 0, right: 20, top: 10, bottom: 20});
			container.appendChild(c1);
			reorder(container, {onStart, onMove, onCancel});
			c0.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, keyCode: 32}));
			expect(c0.className).toBe('draggable dragging');
			expect(onStart.mock.calls).toEqual([[c0, 0]]);

			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 40}));
			expect(c0.style.transform).toBe('translate(0px,10px)');
			expect(c1.style.transform).toBe('translate(0px,-10px)');

			// cancel while busy
			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 27}));
			jest.runOnlyPendingTimers();
			expect(c1.nextSibling).toBe(c0);

			jest.runOnlyPendingTimers();
			expect(c0.style.transform).toBe('');
			expect(c1.style.transform).toBe('');
			expect(c0.nextSibling).toBe(c1);
			expect(onMove.mock.calls).toEqual([[c0, 1]]);
			expect(onCancel.mock.calls).toEqual([[c0]]);
		});

		it('cancels move on escape when the element was not moved', () => {
			const onStart = jest.fn();
			const onCancel = jest.fn();
			const container = document.createElement('div');
			document.body.appendChild(container);
			const c0 = createChild({left: 0, right: 20, top: 0, bottom: 10});
			container.appendChild(c0);
			const c1 = createChild({left: 0, right: 20, top: 10, bottom: 20});
			container.appendChild(c1);
			reorder(container, {onStart, onCancel});
			c0.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, keyCode: 32}));
			expect(c0.className).toBe('draggable dragging');
			expect(onStart.mock.calls).toEqual([[c0, 0]]);

			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 27}));
			jest.runOnlyPendingTimers();
			expect(c0.nextSibling).toBe(c1);
			expect(onCancel.mock.calls).toEqual([[c0]]);
		});

		it('ignores keydown for other keys', () => {
			const onFinish = jest.fn();
			const container = document.createElement('div');
			document.body.appendChild(container);
			reorder(container, {onFinish});

			container.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 13}));
			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 13}));
			expect(onFinish.mock.calls).toEqual([]);
		});

		it('ignores keydown if no draggable is found', () => {
			const onFinish = jest.fn();
			const container = document.createElement('div');
			document.body.appendChild(container);
			reorder(container, {onFinish});

			container.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 32}));
			document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 13}));
			expect(onFinish.mock.calls).toEqual([]);
		});
	});

	describe('remove listeners', () => {
		it('removes listeners', () => {
			const onFinish = jest.fn();
			const container = document.createElement('div');
			const addEventListener = jest.spyOn(container, 'addEventListener');
			const removeEventListener = jest.spyOn(container, 'removeEventListener');
			document.body.appendChild(container);
			const removeListeners = reorder(container, {onFinish});
			removeListeners();

			expect(addEventListener.mock.calls).toEqual([
				['pointerdown', expect.any(Function)],
				['pointerup', expect.any(Function)],
				['lostpointercapture', expect.any(Function)],
				['keydown', expect.any(Function)],
			]);
			expect(removeEventListener.mock.calls).toEqual(addEventListener.mock.calls);
		});
	});
});
