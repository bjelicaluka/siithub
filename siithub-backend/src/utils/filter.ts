export const asyncFilter = async <T>(arr: T[], predicate: (v: T) => Promise<boolean>) =>
  Promise.all(arr.map(predicate)).then((results) => arr.filter((_v, index) => results[index]));
