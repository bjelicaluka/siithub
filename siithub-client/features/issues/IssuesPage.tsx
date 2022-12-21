import { useRouter } from "next/router";
import { type FC, useState } from "react"
import { Button } from "../../core/components/Button";
import { IssuesSearchForm } from "./IssuesSearchForm";
import { IssuesTable } from "./IssuesTable";
import { useSearchIssues } from "./useIssue";

let search_form_key_count = 1;

export const IssuesPage: FC = () => {
    
  const router = useRouter()
  const [existingParams, setExistingParams] = useState({});
  const { issues } = useSearchIssues(existingParams, '639b3fa0d40531fd5b576f0a');

  const navigateToNewIssue = () => router.push('/issues/new');
  const clearParams = () => { search_form_key_count++, setExistingParams({}) };

  return (
    <>
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div key={`search_form_${search_form_key_count}`} className="border-t border-gray-200" >
            <IssuesSearchForm existingParams={existingParams} onParamsChange={(params: any) => { setExistingParams(params) }} />
          </div>
        </div>
      </div>
      <div className="px-4 py-3 text-right sm:px-6">
        <span className="pr-4"><Button onClick={clearParams}>Clear</Button></span>
        <span><Button onClick={navigateToNewIssue}>New Label</Button></span>
      </div>
      <div className="overflow-hidden shadow sm:rounded-md px-4 py-3">
        <IssuesTable issues={issues} />
      </div>
    </>
  )
}