import { createContext, FC, PropsWithChildren, useContext, useState } from "react"
import debounce from 'lodash.debounce';

export enum ResultStatus {
  Start,
  Ok,
  Error
}

export type ResultType = {
  status: ResultStatus,
  type: string
}

type ResultContextType = {
  result: any,
  setResult: (r: ResultType|undefined) => any
}

const initialResultContextValues = {
  result: undefined,
  setResult: (_: ResultType|undefined) => {}
}

export const useResult = (scope: string) => {

  const { result, setResult } = useContext(_resultContext);

  const setScopedResult = (r: ResultType|undefined) => setResult({...result, [scope]: r });

  if (!Object.keys(result).includes(scope)) {
    debounce(() => setScopedResult(undefined), 100);
  }

  return { result: result[scope] as ResultType|undefined, setResult: (r: ResultType|undefined) => setScopedResult(r) };
}

const _resultContext = createContext<ResultContextType>(initialResultContextValues);

export const ResultContext: FC<PropsWithChildren> = ({ children }) => {

  const [result, setResult] = useState<any>({});

  return (
    <_resultContext.Provider value={{ result, setResult }}>
      {children}
    </_resultContext.Provider>
  );

}