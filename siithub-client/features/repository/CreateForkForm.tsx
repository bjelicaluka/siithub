import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type FC } from "react";
import { AreaField } from "../../core/components/AreaField";
import { Button } from "../../core/components/Button";
import { InputField } from "../../core/components/InputField";
import { type AuthUser, useAuthContext } from "../../core/contexts/Auth";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { extractErrorMessage } from "../../core/utils/errors";
import { useDefaultBranch } from "../branches/useBranches";
import { createFork, type CreateFork, forkSchema } from "./repository.service";
import { useFork } from "./useRepositories";

type CreateForkFormProps = {
  repo: string;
  username: string;
};

export const CreateForkForm: FC<CreateForkFormProps> = ({ username, repo }) => {
  const router = useRouter();
  const notifications = useNotifications();
  const myUsername = (useAuthContext()?.user as AuthUser)?.username;
  const { defaultBranch } = useDefaultBranch(username, repo);
  const { fork } = useFork(username, repo, myUsername);
  const defaultBranchName = defaultBranch.branch ?? "master";
  const { setResult } = useResult("create-fork");
  const [, setToggle] = useState(false);
  const [copying, setCopying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useZodValidatedFrom<CreateFork>(forkSchema, {
    name: repo,
    only1Branch: defaultBranchName,
  });

  const createForkAction = useAction<CreateFork>(
    (fork) => {
      setCopying(true);
      return createFork(fork, username, repo);
    },
    {
      onSuccess: () => {
        setCopying(false);
        notifications.success("You have successfully created a new fork.");
        setResult({ status: ResultStatus.Ok, type: "CREATE_FORK" });
        router.push(`/${myUsername}/${getValues().name}`);
      },
      onError: (error: any) => {
        setCopying(false);
        notifications.error(extractErrorMessage(error));
        setResult({ status: ResultStatus.Error, type: "CREATE_FORK" });
      },
    }
  );

  return (
    <div>
      <p className="text-xl">Create a new fork</p>
      <p className="m-3">
        A fork is a copy of a repository. Forking a repository allows you to freely experiment with changes without
        affecting the original project.
      </p>
      {fork ? (
        <div>
          No more forks can be created. Your existing fork:{" "}
          <Link className="font-semibold text-blue-500 hover:underline " href={`/${fork.owner}/${fork.name}`}>
            {fork.owner}/{fork.name}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(createForkAction)}>
          <div className="overflow-hidden shadow sm:rounded-md">
            <div className="bg-white px-4 py-5 sm:p-6">
              <div className="flex items-center m-3">
                <span className="text-lg mr-2">{myUsername}</span>/
                <InputField label="" formElement={register("name")} errorMessage={errors?.name?.message} />
              </div>
              <p className="m-3">
                By default, forks are named the same as their upstream repository. You can customize the name to
                distinguish it further.
              </p>
              <div className="flex items-center m-3">
                <input
                  name="branch"
                  type="checkbox"
                  checked={!!getValues().only1Branch}
                  onChange={(e) => {
                    setValue("only1Branch", e.target.checked ? defaultBranchName : undefined);
                    setToggle((t) => !t);
                  }}
                />
                <label className="font-medium text-gray-700 ml-2" htmlFor="branch">
                  Copy the <span className="font-bold text-black">{defaultBranchName}</span> branch only
                </label>
              </div>
              <div className="m-3">
                <AreaField
                  label="Description"
                  formElement={register("description")}
                  errorMessage={errors?.description?.message}
                />
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              {copying ? (
                <Button className="items-center" type="button">
                  <div className="w-5 h-5 rounded-full border-4 border-dashed animate-spin" />
                  <span className="ml-4">Copying repository</span>
                </Button>
              ) : (
                <Button>Create fork</Button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
