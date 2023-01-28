import { type FC, type PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { type Repository } from "./repository.service";
import { useRouter } from "next/router";
import { useRepository } from "./useRepositories";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";

type RepositoryContextType = {
  repository?: Repository;
};

export const initialRepositoryContextValues = {
  repository: undefined,
};

const RepositoryContext = createContext<RepositoryContextType>(initialRepositoryContextValues);

export const useRepositoryContext = () => useContext(RepositoryContext);

export const RepositoryContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [repository, setRepository] = useState<Repository | undefined>(undefined);

  const router = useRouter();
  const { username, repository: repositoryName } = router.query;

  const { result, setResult } = useResult("repositories");
  const { result: starResult, setResult: setStarResult } = useResult("stars");

  useEffect(() => {
    if (!result && !starResult) return;
    setResult(undefined);
    setStarResult(undefined);
  }, [result, setResult, starResult, setStarResult]);

  const { repository: fetchedRepo, error } = useRepository(
    username?.toString() ?? "",
    repositoryName?.toString() ?? "",
    [result, starResult]
  );

  useEffect(() => {
    if (!fetchedRepo) return;

    setRepository(fetchedRepo);

    return () => setRepository(undefined);
  }, [fetchedRepo]);

  return (
    <>
      <RepositoryContext.Provider value={{ repository }}>
        {repository ? children : error ? <NotFound /> : <></>}
      </RepositoryContext.Provider>
    </>
  );
};
