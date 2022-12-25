import { type FC } from "react";

type LabelPreviewProps = {
  name: string,
  color: string
}

export const LabelPreview: FC<LabelPreviewProps> = ({ name, color }) => {
  return <button type="button" className="text-md font-medium leading-6 text-white rounded-full px-2" style={{backgroundColor: color, minWidth: '100px'}} >
      {name || 'Label preview'}
    </button>
};
