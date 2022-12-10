import { type FC } from "react";
import { useTest } from "./use-test";

type TestProps = {};

export const Test: FC<TestProps> = () => {
  const { data } = useTest();

  console.log(data);

  return (
    <div className="flex justify-center h-full items-center">
      <span className="text-red-600">LALAL</span>
    </div>
  );
};
