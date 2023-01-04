import { type FC, type PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { type Repository } from "./repository.service";
import { useRouter } from "next/router";
import { useRepository } from "./useRepositories";

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

  const { repository: fetchedRepo } = useRepository(username?.toString() ?? "", repositoryName?.toString() ?? "");

  useEffect(() => {
    if (!fetchedRepo) return;

    setRepository(fetchedRepo);

    return () => setRepository(undefined);
  }, [fetchedRepo]);

  return (
    <>
      <RepositoryContext.Provider value={{ repository }}>{repository ? children : <></>}</RepositoryContext.Provider>
    </>
  );
};
