import { type FC, useEffect, useState } from "react";
import { useCollaborators } from "./useCollaborators";
import { CollaboratorsTable } from "./CollaboratorsTable";
import { useResult } from "../../core/contexts/Result";
import { CollaboratorsSearchForm } from "./CollaboratorsSearchForm";
import { Button } from "../../core/components/Button";
import { useRefresh } from "../../core/hooks/useRefresh";
import { CollaboratorsForm } from "./CollaboratorsForm";
import { Modal } from "../../core/components/Modal";

type CollaboratorsPageProps = {
  repo: string;
  username: string;
};

export const CollaboratorsPage: FC<CollaboratorsPageProps> = ({ repo, username }) => {
  const [name, setName] = useState("");
  const { key, refresh } = useRefresh("collaboratorsSearchForm");
  const { result, setResult } = useResult("collaborators");
  const { collaborators } = useCollaborators(username, repo, name, [result]);

  useEffect(() => {
    if (!result) return;

    setResult(undefined);
  }, [result, setResult]);

  const clearName = () => {
    setName("");
    refresh();
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-12 bg-gray-50 py-2">
        <div className="col-span-6 ml-3 text-4xl">Manage Collaborators</div>

        <div className={`col-span-6 mr-3 bg-gray-50 text-right`}>
          <Button onClick={() => setIsOpen(true)}>Add</Button>
        </div>
      </div>

      <Modal title="Add Collaborator" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <CollaboratorsForm repo={repo} username={username} />
      </Modal>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="overflow-hidden shadow sm:rounded-md px-4 py-3">
        <div className="mb-4 grid grid-cols-12">
          <div key={key} className="col-span-11">
            <CollaboratorsSearchForm existingName={name} onNameChange={setName} />
          </div>

          <div className="mt-8 col-span-1 text-right">
            <Button onClick={clearName}>Clear</Button>
          </div>
        </div>

        <CollaboratorsTable repo={repo} username={username} collaborators={collaborators} />
      </div>
    </>
  );
};
