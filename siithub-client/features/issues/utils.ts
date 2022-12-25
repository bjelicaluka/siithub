function findDifference(arr1: any, arr2: any): any {
  return arr1.filter(({ value: id1 }: any) => !arr2.some(({ value: id2 }: any) => id2 === id1)).pop();
}

function findLastEvent<T>(events: any[], f: (arg0: T) => boolean) {
  return events
    .filter(e => f(e as T))
    .sort((e1, e2) => e1.timeStamp.getTime() - e2.timeStamp.getTime())
    .pop();
}

export {
  findDifference,
  findLastEvent
}