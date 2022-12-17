import { LabelsPage } from "../../features/labels/LabelsPage";

const Labels = () => {
  
  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl space-y-">
          <LabelsPage />
        </div>
      </div>
    </>
  );
};

export default Labels;
