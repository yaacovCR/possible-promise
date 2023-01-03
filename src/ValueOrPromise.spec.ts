import { ValueOrPromise } from './ValueOrPromise';
import expect from 'expect';

describe('ValueOrPromise', () => {
  it('works when instantiated with a value', () => {
    const valueOrPromise = new ValueOrPromise(() => 5);

    const value = valueOrPromise.resolve();
    expect(value).toBe(5);
  });

  it('works on initial throw', () => {
    const valueOrPromise = new ValueOrPromise(() => {
      throw new Error('Error');
    });
    expect(() => valueOrPromise.resolve()).toThrowError('Error');
  });

  it('works when instantiated with a promise', async () => {
    const valueOrPromise = new ValueOrPromise(() => Promise.resolve(5));

    const promise = valueOrPromise.resolve();
    expect(await promise).toBe(5);
  });

  it('works when calling then on a value', () => {
    const valueOrPromise = new ValueOrPromise(() => 5);

    const value = valueOrPromise.then((x) => x + 1).resolve();
    expect(value).toBe(6);
  });

  it('works when calling then after initial throw', () => {
    const valueOrPromise = new ValueOrPromise(() => {
      throw new Error('Error');
    });
    expect(() => valueOrPromise.then((x) => x + 1).resolve()).toThrowError(
      'Error'
    );
  });

  it('works with ValueOrPromise.all for values', () => {
    const valueOrPromise1 = new ValueOrPromise(() => 1);
    const valueOrPromise2 = new ValueOrPromise(() => 2);
    const all = ValueOrPromise.all([valueOrPromise1, valueOrPromise2]);
    expect(all.resolve()).toEqual([1, 2]);
  });

  it('works with ValueOrPromise.all for promises', async () => {
    const valueOrPromise1 = new ValueOrPromise(() => Promise.resolve(1));
    const valueOrPromise2 = new ValueOrPromise(() => Promise.resolve(2));
    const all = ValueOrPromise.all([valueOrPromise1, valueOrPromise2]);
    expect(await all.resolve()).toEqual([1, 2]);
  });

  it('works with ValueOrPromise.all for mixture of values and promises', async () => {
    const valueOrPromise1 = new ValueOrPromise(() => 1);
    const valueOrPromise2 = new ValueOrPromise(() => Promise.resolve(2));
    const all = ValueOrPromise.all([valueOrPromise1, valueOrPromise2]);
    expect(await all.resolve()).toEqual([1, 2]);
  });

  it('works with ValueOrPromise.all for mixture of sync and async errors', async () => {
    const valueOrPromise1 = new ValueOrPromise(() => {
      throw new Error('Error');
    });
    const valueOrPromise2 = new ValueOrPromise(() => Promise.reject('Error'));
    let handled = false;
    const promise = valueOrPromise2.resolve();
    const originalThen = promise.then;
    promise.then = (onFullfilled, onRejected) => {
      handled = true;
      return originalThen(onFullfilled, onRejected);
    };
    const all = ValueOrPromise.all([valueOrPromise1, valueOrPromise2]);
    try {
      await all.resolve();
    } catch {
      // Ignore errors
    }
    expect(handled).toEqual(true);
  });
});
