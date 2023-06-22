import { COLORS } from "../constants/colors";
import { Workflow, Workflows } from "../types";

function createBar(workflows: Workflows) {
  if (!workflows || workflows.length === 0) {
    return null;
  }
  const storedSpans = [] as JSX.Element[];
  const maxProgress = workflows?.length;
  let currentProgress = 0;

  workflows.forEach((workflow: Workflow, index) => {
    if (workflow.status !== "Pending" && workflow.status !== "Skipped") {
      currentProgress++;
    }

    const widthRounded = (100 / maxProgress).toFixed(2);

    storedSpans.push(
      <span
        key={workflow._id + index}
        style={{ width: `${widthRounded}%` }}
        className={`progress progress-${COLORS[workflow.status as keyof typeof COLORS]}`}
      />
    );
  });

  return storedSpans;
}

const StackedProgress = ({ workflows }: { workflows: Workflows }) => {
  if (!workflows || workflows.length === 0) {
    return (
      <div className="progress-bar" />
    );
  }
  return (
    <div className="progress-bar">
      {createBar(workflows)}
    </div>
  );
};


const Progress = ({ value = 0, max = 100 }: { value?: number, max?: number, color?: string }) => {

  return <progress value={value} max={max} className="progress-bar progress-success" />

}

export { Progress };
export default StackedProgress;
