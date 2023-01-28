import { type FC, useEffect } from "react";
import { TagForm } from "./TagForm";
import { type Repository } from "../repository/repository.service";
import { useRouter } from "next/router";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useRepositoryContext } from "../repository/RepositoryContext";

export const TagPage: FC = () => {
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;

  const router = useRouter();
  const { result, setResult } = useResult("tags");

  useEffect(() => {
    if (!result) return;

    if (result.type === "CREATE_TAG" && result.status === ResultStatus.Ok) {
      router.push(`/${owner}/${name}/tags`);
    }
    setResult(undefined);
  }, [result]);

  return (
    <>
      <TagForm />
    </>
  );
};
