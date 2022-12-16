function clearPropertiesOfResultWrapper(f: any, ...properties: string[]) {
  return async function(...args: any[]) {
    const result = f.apply(null, args);

    const obj = result instanceof Promise ? await (result as Promise<any>) : result;
    for (const property of properties) {
      if (obj[property]) {
        delete obj[property]
      }
    }

    return obj;
  }
}

export {
  clearPropertiesOfResultWrapper
}