function clearPropertiesOfResultWrapper(f: any, ...properties: string[]) {
  return async function(...args: any[]) {
    const result = f.apply(null, args);

    const obj = result instanceof Promise ? await (result as Promise<any>) : result;

    if (!obj) return obj;
    
    return clearPropertiesOfObject(obj, ...properties);
  }
}

function clearPropertiesOfObject(obj: any, ...properties: string[]) {
  for (const property of properties) {
    if (obj[property]) {
      delete obj[property]
    }
  }

  return obj;
}

export {
  clearPropertiesOfResultWrapper,
  clearPropertiesOfObject
}