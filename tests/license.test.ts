import { describe, expect, it } from 'vitest';
import { CHECKOUT_URL } from '../src/license';

describe('Studio billing contract', () => {
  it('uses the production Sociobot checkout URL for this registered product', () => {
    expect(CHECKOUT_URL).toBe('https://api.sociobot.in/api/v1/products/comic-reference-sheet-board/checkout');
  });
});
