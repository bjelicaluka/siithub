
const counters: any = {

};

export const useRefresh = (key: string) => {

  if (!counters[key]) {
    counters[key] = 0;
  }

  return {
    key: `${key}_${counters[key]}`,
    refresh: () => counters[key]++
  }
  
}