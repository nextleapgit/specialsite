import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('ar-studio-lang', 'en');
});
afterEach(() => cleanup());
Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
  value: function () {
    this.open = true;
  },
});
Object.defineProperty(HTMLDialogElement.prototype, 'close', {
  value: function () {
    this.open = false;
  },
});
window.scrollTo = vi.fn();
