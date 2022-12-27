import { useRouter } from "next/router";
import { FC } from "react";

export const RepositoryView: FC = () => {
  const router = useRouter();
  const repositoryId = router.query?.repositoryId?.toString() ?? "";

  return <div>{repositoryId}</div>;
};
