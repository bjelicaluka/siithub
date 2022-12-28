import { useRouter } from "next/router";
import { FC } from "react";

export const RepositoryView: FC = () => {
  const router = useRouter();
  const repository = router.query?.repository?.toString() ?? "";

  return <div>{repository}</div>;
};
