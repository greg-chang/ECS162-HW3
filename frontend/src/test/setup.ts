import { beforeAll, afterAll, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import '@testing-library/jest-dom/vitest';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
});

vi.stubGlobal('document', dom.window.document);
vi.stubGlobal('window', dom.window);
vi.stubGlobal('navigator', dom.window.navigator);

afterAll(() => {
  vi.unstubAllGlobals();
}); 