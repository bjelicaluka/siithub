import { type FC, useEffect, useState } from "react";
import { useBranches, useDefaultBranch } from "./useBranches";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { Button } from "../../core/components/Button";
import { BranchesTable } from "./BranchesTable";
import { useRefresh } from "../../core/hooks/useRefresh";
import { BranchesSearchForm } from "./BranchesSearchForm";
import debounce from "lodash.debounce";
import { Modal } from "../../core/components/Modal";
import { CreateBranchForm } from "./CreateBranchForm";

const debouncedCb = debounce((cb: () => void) => cb(), 300);

type BranchesPageProps = {
  repo: string;
  username: string;
};

export const BranchesPage: FC<BranchesPageProps> = ({ repo, username }) => {
  const [name, setName] = useState("");
  const [finalName, setFinalName] = useState(name);
  const [isOpen, setIsOpen] = useState(false);

  const { key, refresh } = useRefresh("branchesSearchForm");
  const { result: branchesResult, setResult: setBranchesResult } = useResult("branches");
  const { result: defaultBranchResult, setResult: setDefaultBranchResult } = useResult("default_branch");
  const { branches } = useBranches(username, repo, finalName, [branchesResult]);
  const { defaultBranch } = useDefaultBranch(username, repo, [defaultBranchResult]);

  console.log(defaultBranch);

  useEffect(() => {
    debouncedCb(() => setFinalName(name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if (!branchesResult) return;

    if (branchesResult.type === "CREATE" && branchesResult.status === ResultStatus.Ok) setIsOpen(false);

    setBranchesResult(undefined);
  }, [branchesResult, setBranchesResult]);

  useEffect(() => {
    if (!defaultBranchResult) return;

    setDefaultBranchResult(undefined);
  }, [defaultBranchResult, setDefaultBranchResult]);

  const clearName = () => {
    setName("");
    refresh();
  };

  return (
    <>
      <div className="grid grid-cols-12 bg-gray-50 py-2">
        <div className="col-span-6 ml-3 text-4xl">Manage Branches</div>

        <div className={`col-span-6 mr-3 bg-gray-50 text-right`}>
          <Button onClick={() => setIsOpen(true)}>Create</Button>
        </div>
      </div>

      <Modal title="Create branch" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <CreateBranchForm repo={repo} username={username} />
      </Modal>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="overflow-hidden shadow sm:rounded-md px-4 py-3">
        <div className="mb-4 grid grid-cols-12">
          <div key={key} className="col-span-11">
            <BranchesSearchForm existingName={name} onNameChange={setName} />
          </div>

          <div className="mt-8 col-span-1 text-right">
            <Button onClick={clearName}>Clear</Button>
          </div>
        </div>

        <BranchesTable repo={repo} username={username} branches={branches} defaultBranch={defaultBranch} />
      </div>
    </>
  );
};
