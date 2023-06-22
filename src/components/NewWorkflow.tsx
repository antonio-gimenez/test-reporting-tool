import React, { useState } from "react";
import { ReactComponent as DuplicateIcon } from "../assets/icons/duplicate-16.svg";
import { ReactComponent as PencilIcon } from "../assets/icons/pencil-16.svg";
import { ReactComponent as TrashIcon } from "../assets/icons/trash-16.svg";
import { Workflow, Workflows } from "../types";
import { generateUUID } from "../utils/utils";
import Modal, { useModal } from "./Modal";

interface NewWorkflowProps {
  workflows?: Workflows;
  setWorkflows?: React.Dispatch<React.SetStateAction<Workflows>>;
}

const NewWorkflow: React.FC<NewWorkflowProps> = ({ workflows = [], setWorkflows = () => {} }) => {
  const { openModal, closeModal } = useModal();
  const [newWorkflow, setNewWorkflow] = useState<Workflow | null>(null);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value, id } = event.target;
    if (!id) return;

    setNewWorkflow(
      (prev) =>
        ({
          ...prev,
          [id]: value || null,
        } as Workflow)
    );
  };

  const handleSubmit = () => {
    if (!newWorkflow) return;
    if (!newWorkflow._id && !newWorkflow.workflowName) return;
    if (workflows === null) return; // Add null check here

    const index = workflows.findIndex((item) => item.workflowName === newWorkflow.workflowName);
    if (index !== -1) {
      newWorkflow._id = workflows[index]._id;
    }

    addWorkflow(newWorkflow);
    setNewWorkflow(null);
    const workflowNameInput = document.getElementById("workflowName") as HTMLInputElement;
    const workflowDescriptionInput = document.getElementById("workflowDescription") as HTMLInputElement;
    if (workflowNameInput && workflowDescriptionInput) {
      workflowNameInput.value = "";
      workflowDescriptionInput.value = "";
    }
  };

  const addWorkflow = (workflow: Workflow) => {
    if (!workflow) return;

    // if workflow doesn't have an id, generate a temp id
    if (!workflow.tempId) {
      workflow.tempId = generateUUID();
    }

    setWorkflows((prev) => [...(prev ?? []), workflow]);
  };

  const duplicateWorkflow = (workflow: Workflow) => {
    if (!workflow || !workflows || (!workflow._id && !workflow.tempId)) return;

    const workflowToCopy = {
      tempId: generateUUID(),
      workflowName: `${workflow.workflowName} (copy)`,
      workflowDescription: workflow.workflowDescription,
    } as Workflow;

    if (workflows) {
      const index = workflows.findIndex((item) => (item._id || item.tempId) === (workflow._id || workflow.tempId));
      if (index === -1) {
        console.warn(`Cannot duplicate workflow: workflow with _id ${workflow._id} not found`);
        return;
      }

      const newIndex = index + 1; // Calculate the new index correctly
      const newWorkflowsList = [...workflows];
      newWorkflowsList.splice(newIndex, 0, workflowToCopy);
      setWorkflows(newWorkflowsList);
    }
  };

  const removeWorkflow = (id: string) => {
    if (!id || !workflows) return;

    const index = workflows.findIndex((item) => item.tempId === id || item._id === id);
    if (index === -1) return;

    const newWorkflowsList = [...workflows];
    newWorkflowsList.splice(index, 1);
    setWorkflows(newWorkflowsList);
  };

  const onChangeWorkflow = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (!name || !value) return;

    setNewWorkflow(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as Workflow)
    );
  };

  const onSaveEditedWorkflow = (workflow: Workflow) => {
    if (!workflow || !newWorkflow) {
      return;
    }

    const updatedWorkflow: Workflow = {
      ...workflow,
      workflowName: newWorkflow.workflowName || workflow.workflowName,
      workflowDescription: newWorkflow.workflowDescription || workflow.workflowDescription,
    };

    if (!workflows) return;
    try {
      let index = -1;
      // check if the updatedWorkflow uses _id or tempId
      if (updatedWorkflow._id) {
        index = workflows.findIndex((item) => item._id === updatedWorkflow._id);
      }
      if (updatedWorkflow.tempId) {
        index = workflows.findIndex((item) => item.tempId === updatedWorkflow.tempId);
      }

      if (index === -1) {
        return;
      }

      const newWorkflowsList = workflows?.map((item, i) => {
        if (i === index) {
          return updatedWorkflow;
        } else {
          return item;
        }
      });

      setWorkflows(newWorkflowsList);
    } catch (error) {
      console.log(error);
    } finally {
      closeModalAndResetForm(`edit-workflow-${workflow._id ?? workflow.tempId}`);
    }
  };

  const closeModalAndResetForm = (id: string) => {
    closeModal(id);
    setNewWorkflow(null);
  };

  return (
    <div>
      <h4 className="header-4 margin-block-large ">Manage Workflows</h4>
      <header className="workflow-container-header gap-medium">
        <label htmlFor="workflowName" className="form-label form-label-required">
          Workflow name
        </label>
        <input
          className="form-control form-input form-block"
          id="workflowName"
          placeholder="Workflow name"
          onChange={handleFormChange}
        />
        <label htmlFor="workflowDescription" className="form-label form-label-required">
          Workflow description
        </label>
        <textarea
          rows={1}
          className="form-control form-textarea form-block"
          id="workflowDescription"
          placeholder="A brief description or instructions. Accept multiple lines."
          onChange={handleFormChange}
        />
        <button
          onClick={handleSubmit}
          disabled={!newWorkflow?.workflowName || !newWorkflow?.workflowDescription}
          className="btn btn-primary block"
        >
          Add
        </button>
      </header>

      {workflows?.length ? (
        <ul className="workflow-list box">
          {workflows?.map((workflow: Workflow, index) => (
            <li key={workflow._id ?? workflow.tempId ?? "workflow-" + index} className="list-item workflow-item">
              <div className="workflow-item-header">
                <span>{workflow.workflowName}</span>
                <div
                  className="text-muted text-small"
                  dangerouslySetInnerHTML={{
                    __html: workflow.workflowDescription?.replace(/\n/g, "<br />") ?? "",
                  }}
                />
              </div>
              <div className="workflow-actions">
                <PencilIcon
                  className="btn-link"
                  title="Update workflow"
                  onClick={() => {
                    openModal(`edit-workflow-${workflow._id ?? workflow.tempId}`);
                  }}
                />
                <Modal
                  onClose={() => closeModalAndResetForm(`edit-workflow-${workflow._id ?? workflow.tempId}`)}
                  closeOnOverlayClick={false}
                  id={`edit-workflow-${workflow.tempId ?? workflow._id}`}
                  header="Update workflow"
                  footer={
                    <>
                      <button
                        className="btn btn-secondary block"
                        onClick={() => closeModalAndResetForm(`edit-workflow-${workflow._id ?? workflow.tempId}`)}
                      >
                        Cancel
                      </button>
                      <button
                        disabled={!newWorkflow}
                        className="btn btn-primary block"
                        onClick={() => onSaveEditedWorkflow(workflow)}
                      >
                        Update
                      </button>
                    </>
                  }
                >
                  <div className="form-group min-container-small">
                    <label htmlFor="workflowName" className="form-label">
                      Workflow name
                    </label>
                    <input
                      type="text"
                      name="workflowName"
                      id="workflowName"
                      className="form-control form-input"
                      placeholder={workflow.workflowName}
                      defaultValue={workflow.workflowName}
                      onChange={onChangeWorkflow}
                    />

                    <label htmlFor="workflowDescription" className="form-label">
                      Workflow description
                    </label>
                    <textarea
                      name="workflowDescription"
                      id="workflowDescription"
                      className="form-control form-textarea"
                      placeholder={workflow.workflowDescription}
                      defaultValue={workflow.workflowDescription}
                      onChange={onChangeWorkflow}
                    />
                  </div>
                </Modal>
                <DuplicateIcon
                  className="btn-link"
                  title="Duplicate workflow"
                  onClick={() => duplicateWorkflow(workflow)}
                />
                <TrashIcon
                  className="btn-link hover-error"
                  onClick={() => {
                    removeWorkflow(workflow._id ?? workflow.tempId);
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default NewWorkflow;
