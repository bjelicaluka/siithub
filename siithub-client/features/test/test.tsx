import { useEffect, type FC } from "react";
import { useResult } from "../../core/contexts/Result";
import { useTest } from "./use-test";

type TestProps = {};

export const Test: FC<TestProps> = () => {
  const { data } = useTest();
  const { result } = useResult('TestResult');

  useEffect(() => {
    if (!result) return;
    console.log(result.type);
  }, [result]);

  console.log(data);

  return (
    <div className="flex justify-center h-full items-center">
      <span className="text-red-600">LALAL</span>
    </div>
  );
};
