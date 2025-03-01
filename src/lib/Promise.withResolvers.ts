export type PromiseWithResolversReturnType<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
};

export const withResolvers = <T>(): PromiseWithResolversReturnType<T> => {
  let resolve: PromiseWithResolversReturnType<T>['resolve'];
  let reject: PromiseWithResolversReturnType<T>['reject'];
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
};
