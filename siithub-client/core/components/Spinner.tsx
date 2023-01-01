import { type FC } from "react";

type SpinnerProps = {
  size?: number;
};

export const Spinner: FC<SpinnerProps> = ({ size = 16 }) => {
  return (
    <div
      className={`w-${size} h-${size} rounded-full border-spacing-40 border-8 border-dashed border-blue-500 animate-spin m-4`}
    ></div>
  );
};
