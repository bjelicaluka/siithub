import { createContext, type FC, type PropsWithChildren, useContext, useState } from "react"
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

  const { result, setResult } = useContext(ResultContext);

  const setScopedResult = (r: ResultType|undefined) => setResult({...result, [scope]: r });

  if (!Object.keys(result).includes(scope)) {
    debounce(() => setScopedResult(undefined), 100);
  }

  return { result: result[scope] as ResultType|undefined, setResult: (r: ResultType|undefined) => setScopedResult(r) };
}

const ResultContext = createContext<ResultContextType>(initialResultContextValues);

export const ResultContextProvider: FC<PropsWithChildren> = ({ children }) => {

  const [result, setResult] = useState<any>({});

  return (
    <ResultContext.Provider value={{ result, setResult }}>
      {children}
    </ResultContext.Provider>
  );

}