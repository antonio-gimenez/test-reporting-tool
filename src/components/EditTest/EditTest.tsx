import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactComponent as ArrowDownIcon } from "../../assets/icons/arrow-down-16.svg";
import { ReactComponent as ArrowLeftIcon } from "../../assets/icons/arrow-left-16.svg";
import { ReactComponent as ArrowUpIcon } from "../../assets/icons/arrow-up-16.svg";
import { ReactComponent as DuplicateIcon } from "../../assets/icons/duplicate-16.svg";
import { ReactComponent as PencilIcon } from "../../assets/icons/pencil-16.svg";
import { ReactComponent as PlusIcon } from "../../assets/icons/plus-16.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash-16.svg";
import { COLORS } from "../../constants/colors";
import { PRIORITIES } from "../../constants/priorities";
import { STATUS } from "../../constants/status";
import useBranches from "../../hooks/useBranches";
import useDebounce from "../../hooks/useDebounce";
import usePresets from "../../hooks/usePresets";
import useProducts from "../../hooks/useProducts";
import useScrollState from "../../hooks/useScrollState";
import useUsers from "../../hooks/useUsers";
import { Branch, Product, Workflow } from "../../types";
import { scrollIntoView } from "../../utils/scrollIntoView";
import { addTimeOffset, getDateTime } from "../../utils/utils";
import { useAlert } from "../Alert";
import Attachments from "../Attachments";
import Modal, { useModal } from "../Modal";
import "./EditTest.css";
import useTestById from "../../hooks/useTestById";

const EditTest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { test, fetchTest, loading, empty, error } = useTestById({ testId: id });

  const { openModal, closeModal } = useModal();
  const { addAlert } = useAlert();
  const workflows = test?.workflows || [];

  const { presets } = usePresets();

  const [autoComplete, setAutoComplete] = useState<boolean>(true);

  const { activeUsers } = useUsers();
  const { activeBranches } = useBranches();
  const { products } = useProducts();

  const [newWorkflowName, setNewWorkflowName] = useState<string | null>(null);
  const [newWorkflowDescription, setNewWorkflowDescription] = useState<string | null>(null);

  const [isActionsScrolled] = useScrollState({
    initialState: false,
    offset: document.getElementById("#actions")?.offsetTop ?? 150,
    axis: "y",
  });

  useEffect(() => {
    // disable autocomplete when the first workflow is filled (exclude status)
    if (workflows.length > 0) {
      const firstWorkflow = workflows[0];
      if (firstWorkflow.machine && firstWorkflow.ipAddress && firstWorkflow.trolley && firstWorkflow.session) {
        setAutoComplete(false);
      }
    }
  }, [workflows]);

  useEffect(() => {
    if (!test) return;
    if (test.status === "Pending") {
      if (!workflows.length) return;
      const isRunning = workflows.some((workflow: { [key: string]: any }) => workflow.status !== "Pending");
      if (isRunning) {
        updateTest("status", "Running");
      }
    }
    if (test.status !== "Pending") {
      if (!workflows.length) return;
      const notRunning = workflows.every((workflow: { [key: string]: any }) => workflow.status === "Pending");
      if (notRunning) {
        updateTest("status", "Pending");
      }
    }
  }, [test?.status, workflows?.map((workflow) => workflow.status)]);

  const updateWorkflowSession = async (workflowId: Workflow["_id"], value: any) => {
    if (!workflowId) {
      throw new Error("No workflow id");
    }

    try {
      // Check if value is a number
      if (isNaN(value)) {
        throw new Error("Value is not a number");
      }
      if (!test) {
        throw new Error("No test");
      }

      const updatePromises = workflows.map(async (workflow) => {
        if (workflow._id === workflowId) {
          const url = `${process.env.REACT_APP_API_URL}workflows/update/${test?._id}/${workflowId}`;
          await axios.put(url, {
            field: "session",
            value: value ?? null,
          });
        } else {
          const url = `${process.env.REACT_APP_API_URL}workflows/update/${test?._id}/${workflow._id}`;
          const newSession = parseInt(value.toString()) + 1 || 0;
          if (isNaN(newSession)) {
            throw new Error("New session is not a number");
          }
          await axios.put(url, {
            field: "session",
            value: newSession ?? null,
          });
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const onPaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    // remove all the html format except line breaks
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
  };

  const updateWorkflow = async (workflowId: Workflow["_id"], field: string, value: any, index?: number) => {
    if (!workflowId || !field) {
      throw new Error("No workflow id or field");
    }
    if (!test) {
      throw new Error("No test");
    }
    if (!test._id) {
      throw new Error("No test id");
    }

    let cascade = autoComplete;
    if (field === "content" || field === "status") {
      cascade = false;
    }
    if (autoComplete && field === "session" && index === 0) {
      try {
        await updateWorkflowSession(workflowId, value);
        value = parseInt(value) + 1 || null;
      } catch (error) {
        value = null;
      }
    }

    try {
      const method = cascade ? "/workflows/update-on-cascade" : "/workflows/update";
      const url = `${process.env.REACT_APP_API_URL}${method}/${test._id}/${workflowId}`;
      await axios.put(url, {
        field,
        value: value ?? null,
      });
    } catch (error: any) {
      addAlert({
        position: "top-center",
        message: `Error updating workflow: ${error?.message}`,
      });
    } finally {
      fetchTest();
    }
  };

  const updateTest = async (field: string, value: any) => {
    if (!test?._id) return console.log("No test id");
    if (!field) return console.log("No field");

    try {
      const url = process.env.REACT_APP_API_URL + `/tests/${test?._id}`;
      await axios.put(url, {
        field,
        value,
      });
      fetchTest();
    } catch (error: any) {
      addAlert({
        position: "top-center",
        message: (
          <p>
            <strong>Error updating test:</strong> {error.message}
          </p>
        ),
      });
    }
  };

  const debouncedUpdateTest = useDebounce((field: string, value: any) => {
    updateTest(field, value);
  }, 500);

  const removeWorkflow = async (workflowId: Workflow["_id"]) => {
    if (!workflowId) return;
    if (!test?._id) return;
    try {
      const url = process.env.REACT_APP_API_URL + `workflows/${test?._id}/${workflowId}`;
      await axios.delete(url);
      closeModalAndReset(`remove-workflow-${workflowId}`);
      fetchTest();
    } catch (error: any) {
      addAlert({
        position: "top-center",
        message: (
          <p>
            <strong>Error removing workflow:</strong> {error.message}
          </p>
        ),
      });
    }
  };

  const duplicateWorkflow = async (workflowId: Workflow["_id"]) => {
    if (!workflowId) return;
    if (!test?._id) return;
    try {
      const url = process.env.REACT_APP_API_URL + `/workflows/${test?._id}/${workflowId}`;
      await axios.put(url);
    } catch (error: any) {
      addAlert({
        position: "top-center",
        message: (
          <p>
            <strong>Error duplicating workflow:</strong> {error.message}
          </p>
        ),
      });
    } finally {
      fetchTest();
      closeModalAndReset(`duplicate-workflow-${workflowId}`);
    }
  };

  const addWorkflow = async () => {
    if (!test?._id) return;
    try {
      const url = process.env.REACT_APP_API_URL + `/workflows/${test?._id}`;
      await axios.post(url, {
        workflowName: newWorkflowName,
        workflowDescription: newWorkflowDescription,
      });
    } catch (error: any) {
      addAlert({
        position: "top-center",
        message: (
          <p>
            <strong>Error adding workflow:</strong> {error.message}
          </p>
        ),
      });
    } finally {
      fetchTest();
      closeModalAndReset("new-workflow");
    }
  };

  const renameWorkflow = async (workflowId: Workflow["_id"]) => {
    if (!workflowId) return;
    if (!test?._id) return;

    try {
      const url = process.env.REACT_APP_API_URL + `/workflows/update-info/${test?._id}/${workflowId}`;
      await axios.put(url, {
        workflowName: newWorkflowName,
        workflowDescription: newWorkflowDescription,
      });
    } catch (error: any) {
      addAlert({
        position: "top-center",
        message: (
          <p>
            <strong>Error renaming workflow:</strong> {error.message}
          </p>
        ),
      });
    } finally {
      fetchTest();
      closeModalAndReset(`edit-workflow-${workflowId}`);
    }
  };

  const closeModalAndReset = (modalId: string) => {
    closeModal(modalId);
    setNewWorkflowName(null);
    setNewWorkflowDescription(null);
  };

  if (loading && !test) {
    return <div className="loading">Loading...</div>;
  }

  if (!loading && empty) {
    return (
      <div className="et-main-container">
        <div className="main">
          <div className="header-2">Test not found</div>
          <div className="divider-block margin-block-medium" />
          <div className="flex-row-center-gap">
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Go back
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/test")}>
              Go to test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="et-main-container">
      <div className="et-sidebar">
        <h4 className="header-4">Test information</h4>
        <div className="form-info">
          <div className="grid content-end grid-flow-col-dense grid-cols-2">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              className="form-control form-input form-block"
              defaultValue={test?.name || ""}
              onChange={(e) => updateTest("name", e?.target?.value)}
            />
          </div>
        </div>
        <div className="grid">
          <label htmlFor={"scheduleTo"} className="form-label">
            Date
          </label>
          <input
            id={"scheduleTo"}
            type="datetime-local"
            className="form-control form-input form-block"
            defaultValue={test?.scheduledTo ? getDateTime(addTimeOffset(test?.scheduledTo)) : ""}
            onChange={(e) => debouncedUpdateTest("scheduledTo", e?.target?.value)}
          />
        </div>
        <div className="grid-cols-2">
          <label htmlFor="assignedTo" className="form-label">
            Assigned to
          </label>
          <select
            id="assignedTo"
            className="form-control form-select "
            value={test?.assignedTo || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateTest("assignedTo", e?.target?.value)}
          >
            <option value="" defaultChecked disabled>
              Select tester
            </option>
            {activeUsers.map((user) => {
              return (
                <option key={user.name} value={user.name}>
                  {user.name}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <div className="grid-cols-2">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id={"status"}
              className={`form-control form-select ${COLORS[test?.status ?? ""]}`}
              value={test?.status || ""}
              onChange={(e) => updateTest("status", e?.target?.value)}
              disabled={workflows.some((workflow) => workflow.status === "Pending")}
              aria-disabled={workflows.some((workflow) => workflow.status === "Pending")}
            >
              <option value="" defaultChecked disabled>
                Select status
              </option>
              {Object.keys(COLORS).map((status) => {
                return (
                  <option key={status} value={status}>
                    {status}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-description form-flex">
            {workflows?.map((workflow) => workflow.status).includes("Pending") ? (
              <p className="text-error">Cannot change status while there are pending workflows</p>
            ) : null}
          </div>
        </div>
        <div className="grid content-end grid-cols-2">
          <label htmlFor="machine" className="form-label">
            Machine
          </label>
          <input
            className={"form-control form-input"}
            id="machine"
            value={test?.machine || ""}
            onChange={(e) => updateTest("machine", e?.target?.value)}
          />
        </div>
        <div className="grid content-end grid-cols-2">
          <label htmlFor="release" className="form-label">
            Release
          </label>
          <input
            className={"form-control form-input"}
            id="release"
            value={test?.release || ""}
            onChange={(e) => updateTest("release", e?.target?.value)}
          />
        </div>
        <div className="grid content-end grid-cols-2">
          <label htmlFor="branch" className="form-label">
            Branch
          </label>
          <select
            className={"form-control form-select"}
            id={"branch"}
            value={test?.branch || ""}
            onChange={(e) => updateTest("branch", e?.target?.value)}
          >
            <option value="" defaultChecked disabled>
              Select branch
            </option>
            {activeBranches.map((branch: Branch) => {
              return (
                <option key={branch._id} value={branch.name}>
                  {branch.name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="grid content-end grid-cols-2">
          <label htmlFor="priority" className="form-label">
            Priority
          </label>
          <select
            className={"form-control form-select"}
            id="priority"
            value={test?.priority || "Medium"}
            onChange={(e) => updateTest("priority", e?.target?.value)}
          >
            <option value="" defaultChecked disabled>
              Select priority
            </option>
            {PRIORITIES.map((priority) => {
              return (
                <option key={priority.id} value={priority.value}>
                  {priority.value}
                </option>
              );
            })}
          </select>
        </div>
        <div className="grid-cols-2">
          <label htmlFor="product" className="form-label">
            Product
          </label>
          <select className={"form-control form-select"} id="product" value={test?.product || ""} disabled={true}>
            <option value="" defaultChecked disabled>
              Select product
            </option>
            {products.map((product: Product) => {
              return (
                <option key={product._id} value={product.name}>
                  {product.name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="grid content-end grid-cols-2">
          <label htmlFor="requestor" className="form-label">
            Requestor
          </label>
          <input
            id="requestor"
            value={test?.requestor ?? ""}
            onChange={(e) => updateTest("requestor", e?.target?.value)}
          />
        </div>
        <div className="divider-block muted" />
        <div className="grid content-end grid-cols-1">
          <label htmlFor="description" className="form-label">
            Instructions
          </label>
          <textarea
            spellCheck={false}
            id="instructions"
            className="form-control form-textarea"
            placeholder={"Instructions for the tester"}
            defaultValue={test?.instructions || ""}
            onChange={(e) => debouncedUpdateTest("instructions", e?.target?.value)}
          />
          <div className="form-description">Instructions will not be included on the mail report.</div>
        </div>
        <div className="grid content-end grid-cols-1">
          <label htmlFor="notes" className="form-label">
            Notes
          </label>
          <textarea
            spellCheck={false}
            className="form-control form-textarea"
            id="notes"
            rows={1}
            defaultValue={test?.notes || ""}
            onChange={(e) => debouncedUpdateTest("notes", e?.target?.value)}
          />
          <div className="form-description">Notes will be included on the mail report.</div>
        </div>
      </div>

      <div className="et-content">
        <div id="actions" className={`et-content-actions ${isActionsScrolled ? "et-content-actions-scrolled" : ""}`}>
          <button onClick={() => navigate(-1)} className="btn btn-primary block">
            <ArrowLeftIcon className="icon" />
            Go Back
          </button>
          <button
            className="btn btn-secondary block"
            onClick={() => navigate(`/settings/templates/based/${test?.testId}`)}
          >
            <PlusIcon />
            Create template
          </button>
          <button className="btn btn-secondary block" onClick={() => navigate(`/tests/new-test/${test?.testId}`)}>
            <PlusIcon />
            Clone test
          </button>
          <button className="btn btn-secondary block" onClick={() => openModal("new-workflow")}>
            <PlusIcon />
            New Workflow
          </button>
          <Modal
            id="new-workflow"
            header="New Workflow"
            footer={
              <>
                <button className="btn btn-secondary block" onClick={() => closeModalAndReset("new-workflow")}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary block"
                  disabled={!newWorkflowName || !newWorkflowDescription}
                  onClick={addWorkflow}
                >
                  Create
                </button>
              </>
            }
            onClose={() => {
              closeModalAndReset("new-workflow");
            }}
          >
            <div className="form-group margin-block-large">
              <label htmlFor="workflow-name" className="form-label form-label-required">
                Workflow Name
              </label>
              <input
                id="workflow-name"
                className="form-control form-input"
                onChange={(e) => setNewWorkflowName(e?.target?.value)}
              />
              <label htmlFor="workflow-description" className="form-label form-label-required">
                Workflow Description
              </label>
              <textarea
                id="workflow-description"
                className="form-control form-textarea"
                spellCheck={false}
                onChange={(e) => setNewWorkflowDescription(e?.target?.value)}
              />
            </div>
            <p className="paragraph text-small content-muted">
              The new workflow will be added at the bottom of the list.
            </p>
          </Modal>
        </div>

        <h4 className="header-4">Attachments</h4>
        <Attachments test={test} />

        <ul>
          <h4 className="header-4">Workflow List</h4>
          {workflows.map((workflow, workflowIndex) => {
            return (
              <li key={workflow._id} className=" workflow " id={workflow.workflowName + "-" + workflowIndex}>
                <div className="margin-block-medium">
                  <div className="workflow-actions margin-block-large">
                    <select
                      className={`form-control form-select ${COLORS[workflow?.status ?? ""]}`}
                      name="status"
                      id={`status-${workflow._id}-${workflowIndex}`}
                      defaultValue={workflow?.status ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        updateWorkflow(workflow._id, "status", e?.target?.value)
                      }
                    >
                      <option value="" defaultChecked disabled>
                        Select a status
                      </option>

                      {STATUS.map((status) => {
                        return (
                          <option key={"workflow" + status.value} value={status.value}>
                            {status.label}
                          </option>
                        );
                      })}
                    </select>
                    <div className="align-end gap-medium text-small">
                      <button
                        title="Edit workflow"
                        onClick={() => openModal(`edit-workflow-${workflow._id}`)}
                        className="btn btn-secondary  text-small"
                      >
                        <PencilIcon />
                      </button>

                      <Modal
                        id={`edit-workflow-${workflow._id}`}
                        header={`Edit workflow: ${workflow.workflowName}`}
                        onClose={() => {
                          closeModalAndReset(`edit-workflow-${workflow._id}`);
                        }}
                        footer={
                          <>
                            <button
                              className="btn btn-secondary block"
                              onClick={() => closeModalAndReset(`edit-workflow-${workflow._id}`)}
                            >
                              Cancel
                            </button>
                            <button
                              disabled={!newWorkflowName && !newWorkflowDescription}
                              className="btn btn-primary block"
                              onClick={() => renameWorkflow(workflow._id)}
                            >
                              Update
                            </button>
                          </>
                        }
                      >
                        <div className="form-group margin-block-large">
                          <label htmlFor="workflow-name" className="form-label form-label-required">
                            Workflow Name
                          </label>
                          <input
                            id="workflow-name"
                            type="text"
                            className="form-control form-input form-large"
                            defaultValue={workflow.workflowName}
                            onChange={(e) => setNewWorkflowName(e?.target?.value)}
                            placeholder={workflow.workflowName}
                          />
                          <label htmlFor="workflow-description" className="form-label form-label-required">
                            Workflow Description
                          </label>
                          <textarea
                            spellCheck={false}
                            id="workflow-description"
                            className="form-control form-textarea form-large"
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setNewWorkflowDescription(e?.target?.value)
                            }
                            defaultValue={workflow.workflowDescription}
                            placeholder={workflow.workflowDescription}
                          />
                        </div>
                      </Modal>

                      <button
                        title="Duplicate workflow"
                        className="btn btn-secondary  "
                        onClick={() => openModal(`duplicate-workflow-${workflow._id}`)}
                      >
                        <DuplicateIcon />
                      </button>
                      <Modal
                        id={`duplicate-workflow-${workflow._id}`}
                        header={`Duplicate workflow: ${workflow.workflowName}`}
                        footer={
                          <>
                            <button
                              className="btn btn-secondary block"
                              onClick={() => closeModalAndReset(`duplicate-workflow-${workflow._id}`)}
                            >
                              Cancel
                            </button>

                            <button className="btn btn-primary block" onClick={() => duplicateWorkflow(workflow._id)}>
                              Duplicate
                            </button>
                          </>
                        }
                      >
                        <p>
                          Are you sure you want to duplicate <strong>{workflow?.workflowName}</strong>?
                        </p>
                        <p className="paragraph">
                          This will create a new workflow with the same information as the current workflow. Will be
                          placed after the current workflow.
                        </p>
                      </Modal>

                      <button
                        title="Delete workflow"
                        className="btn btn-secondary   link-error"
                        onClick={() => openModal(`remove-workflow-${workflow._id}`)}
                      >
                        <TrashIcon />
                      </button>
                      <Modal
                        id={`remove-workflow-${workflow._id}`}
                        header={`Delete workflow: ${workflow.workflowName}`}
                        footer={
                          <>
                            <button
                              className="btn btn-secondary block"
                              onClick={() => closeModalAndReset(`remove-workflow-${workflow._id}`)}
                            >
                              Cancel
                            </button>
                            <button className="btn btn-error block" onClick={() => removeWorkflow(workflow._id)}>
                              Delete
                            </button>
                          </>
                        }
                      >
                        <p>
                          Are you sure you want to delete <strong>{workflow?.workflowName}</strong>?
                        </p>
                        <p className="paragraph">This action cannot be undone.</p>
                      </Modal>
                    </div>
                  </div>

                  <div className="flex-row-center-gap between">
                    <h3 className="header-3">{workflow?.workflowName} </h3>
                  </div>
                  <span
                    className="text-muted text-small"
                    dangerouslySetInnerHTML={{ __html: workflow?.workflowDescription?.replace(/\n/g, "<br/>") }}
                  />
                </div>
                <div key={workflow._id + "fields"} className="form-grid">
                  <input
                    id={"machine" + workflow._id + workflowIndex}
                    className={`form-control form-input`}
                    autoComplete="true"
                    defaultValue={workflow?.machine ?? ""}
                    placeholder="Machine"
                    onBlur={(e) => updateWorkflow(workflow._id, "machine", e?.target?.value)}
                  />
                  <input
                    className={`form-control form-input`}
                    placeholder="IP Address"
                    id={"ipAddress" + workflow._id + workflowIndex}
                    defaultValue={workflow?.ipAddress ?? ""}
                    onBlur={(e) => updateWorkflow(workflow._id, "ipAddress", e?.target?.value)}
                  />
                  <input
                    className={`form-control form-input`}
                    name="trolley"
                    autoComplete="true"
                    placeholder="Trolley"
                    id={"trolley" + workflow._id + workflowIndex}
                    defaultValue={workflow?.trolley ?? ""}
                    onBlur={(e) => updateWorkflow(workflow._id, "trolley", e?.target?.value)}
                  />
                  <input
                    className={`form-control form-input`}
                    id={"session" + workflow._id + workflowIndex}
                    autoComplete="true"
                    placeholder="Session"
                    defaultValue={workflow.session || ""}
                    onBlur={(e) => {
                      updateWorkflow(workflow._id, "session", e?.target?.value, workflowIndex);
                    }}
                  />
                </div>

                <div id={"rich-text-editor" + workflowIndex} className="margin-block-large">
                  <h5 className="header-5">Content</h5>
                  <div
                    spellCheck={false}
                    contentEditable={true}
                    // onPaste={onPaste}
                    id={"content" + workflowIndex}
                    dangerouslySetInnerHTML={{
                      __html: workflow?.content?.replace(/\n/g, "<br/>") ?? "",
                    }}
                    className="form-control form-textbox form-large"
                    onBlur={(e: React.FormEvent<HTMLDivElement>) => {
                      const target = e.target as HTMLDivElement;
                      updateWorkflow(workflow._id, "content", target.innerHTML);
                    }}
                  />
                  <div className="form-grid">
                    <label htmlFor={"preset" + workflow._id + workflowIndex} className="form-label">
                      Predefined comments
                    </label>
                    <select
                      id={"preset" + workflow._id + workflowIndex}
                      className="form-control form-select"
                      onChange={(e) => {
                        const currentContent = document.getElementById("content" + workflowIndex);
                        if (!currentContent) {
                          return updateWorkflow(workflow._id, "content", e.target.value);
                        }
                        return updateWorkflow(workflow._id, "content", currentContent?.innerHTML + '\n' +  e.target.value);
                      }}
                    >
                      <option value="" disabled>
                        Select a preset
                      </option>
                      {presets.map((preset, index) => {
                        return (
                          <option key={index} value={preset.content}>
                            {preset.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="et-navigation" aria-disabled={!workflows?.length}>
        <h4 className="header-4">Settings</h4>
        <label className="form-label">
          <input
            type={"checkbox"}
            className="form-checkbox"
            checked={autoComplete}
            onChange={(e) => {
              setAutoComplete(e.target.checked);
            }}
          />
          <span className={`margin-inline-small ${autoComplete ? "text-primary" : ""}`}>Autocomplete fields</span>
        </label>
        <div className="form-description">
          Automatically update the fields of the other workflows when a field is updated.
        </div>
        <div className="form-description">Increment +1 the session number of the first workflow.</div>
        <div className="divider-block" />

        {workflows.length > 0 && (
          <>
            <h4 className="header-4">Quick Navigation</h4>
            <button
              className="btn btn-secondary margin-block-medium"
              name="top"
              disabled={!workflows?.length}
              onClick={(event) => scrollIntoView(event)}
            >
              <ArrowUpIcon />
              Top
            </button>
            <ul className="et-navigation-list">
              {workflows?.map((workflow: Workflow, workflowIndex) => (
                <li key={workflow._id} className="truncate ">
                  <button
                    className={`link-secondary semibold text-${COLORS[workflow?.status ?? ""]} `}
                    name={workflow.workflowName + "-" + workflowIndex}
                    onClick={(event) =>
                      scrollIntoView(event, document?.querySelector("#et-content-actions") as HTMLElement)
                    }
                  >
                    {workflow.workflowName}
                  </button>
                </li>
              ))}
            </ul>
            <button
              disabled={!workflows?.length}
              className="btn btn-secondary margin-block-medium"
              name="bottom"
              onClick={(event) => scrollIntoView(event)}
            >
              <ArrowDownIcon />
              Bottom
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditTest;
