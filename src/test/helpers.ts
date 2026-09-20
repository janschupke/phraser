/**
 * Indexed access that fails loudly.
 *
 * With `noUncheckedIndexedAccess` every `arr[i]` is `T | undefined`. In tests
 * the honest fix is not a `!` assertion -- it is to say what the test assumes
 * and produce a useful message when that assumption breaks, rather than a bare
 * "cannot read properties of undefined".
 */
export function at<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`Expected an element at index ${index}, but length is ${items.length}`);
  }
  return item;
}
