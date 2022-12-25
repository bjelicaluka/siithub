import { type FC, useEffect, useState } from "react"
import { Button } from "../../core/components/Button";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { LabelForm } from "./LabelForm"
import { LabelsTable } from "./LabelsTable";
import { useSearchLabels } from "./useLabels";
import { LabelsSearchForm } from "./LabelsSearchForm";
import { useRefresh } from "../../core/hooks/useRefresh";
import { type Repository } from "../repository/repository.service";

type LabelsPageProps = {
  repositoryId: Repository["_id"]
}

export const LabelsPage: FC<LabelsPageProps> = ({ repositoryId }) => {

  const { key, refresh } = useRefresh('labelSearchForm')
  const [name, setName] = useState('');

  const { result, setResult } = useResult('labels');
  const { labels } = useSearchLabels(repositoryId, name, [result]);
  const [visibility, setVisibility] = useState(false);

  useEffect(() => {
    if (!result) return;

    if (result.status === ResultStatus.Ok && result.type === "CREATE_LABEL") {
      setVisibility(true);
    }

    setResult(undefined);
  }, [result, setResult]);

  const toggleVisibility = () => setVisibility(visibility => !visibility);
  const clearName = () => { setName(''); refresh(); };

  return (
    <>
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="ml-2 grid grid-cols-12 gap-6">
        <div key={key} className="col-span-9">
          <LabelsSearchForm existingName={name} onNameChange={setName} />
        </div>

        <div className="col-span-3 mt-6">
          <span className="mr-2"><Button onClick={clearName}>Clear</Button></span>
          <span><Button onClick={toggleVisibility}>New Label</Button></span>       
        </div>
      </div>

      <div key={visibility+''} hidden={visibility} className="mt-5 md:col-span-2 md:mt-0">
        <LabelForm repositoryId={repositoryId} />
      </div>
      <div className="overflow-hidden shadow sm:rounded-md px-4 py-3">
        <LabelsTable repositoryId={repositoryId} labels={labels} />
      </div>
    </>
  )
}