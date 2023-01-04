import { type FC } from "react";

type LabelPreviewProps = {
  name: string;
  color: string;
};

export const LabelPreview: FC<LabelPreviewProps> = ({ name, color }) => {
  return (
    <button
      type="button"
      className={
        "text-md font-medium leading-6 rounded-full px-2 " +
        (color !== "ffffff" ? "text-white" : "border-2 border-black")
      }
      style={{ backgroundColor: color, minWidth: "100px" }}
    >
      {name || "Label preview"}
    </button>
  );
};
