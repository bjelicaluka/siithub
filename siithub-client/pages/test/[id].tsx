import { Test } from "../../features/test/test";
import { useNotifications } from "../../core/hooks/useNotifications";
import { ResultStatus, useResult } from "../../core/contexts/Result";

let notified = false;

const TestPage = () => {
  
  const { setResult } = useResult('TestResult');

  const notifications = useNotifications();
  if (!notified) {
    notifications.error("Testing notifications.")
    notified = true;
  }

  return (
    <>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setResult({ status: ResultStatus.Ok, type: 'RADI POSO' })}>CAQFAFF</button>
      <Test />
    </>
  );
};

export default TestPage;
