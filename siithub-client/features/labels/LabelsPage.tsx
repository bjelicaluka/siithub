import { type FC, useEffect, useState } from "react"
import { Button } from "../../core/components/Button";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { LabelForm } from "./LabelForm"
import { LabelsTable } from "./LabelsTable";

export const LabelsPage: FC = () => {

  const [visibility, setVisibility] = useState(false);

  const { result, setResult } = useResult('labels');
  useEffect(() => {
    if (!result) return;
    if (result.status === ResultStatus.Ok && result.type === "CREATE_LABEL") {
      setVisibility(true);
    }
    setResult(undefined);
  }, [result, setResult]);

  const toggleVisibility = () => setVisibility(visibility => !visibility);

  return (
    <>
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>
      <div className="px-4 py-3 text-right sm:px-6">
        <Button onClick={toggleVisibility}>New Label</Button>
      </div>
      <div key={visibility+''} hidden={visibility} className="mt-5 md:col-span-2 md:mt-0">
        <LabelForm />
      </div>
      <div className="overflow-hidden shadow sm:rounded-md px-4 py-3">
        <LabelsTable/>
      </div>
    </>
  )
}