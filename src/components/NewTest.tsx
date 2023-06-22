import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PRIORITIES } from "../constants/priorities";
import useBranches from "../hooks/useBranches";
import useTemplate from "../hooks/useTemplates";
import useProducts from "../hooks/useProducts";
import { addTimeOffset, generateUUID, getDateTime } from "../utils/utils";
import Collapse from "./Collapse";
import NewWorkflow from "./NewWorkflow";
import { AlertContext } from "../contexts/AlertContext";
import useUsers from "../hooks/useUsers";
import { ModalContext } from "../contexts/ModalContext";
import Modal from "./Modal";
import { Template, Test, Workflow, Workflows } from "../types";
import useTestById from "../hooks/useTestById";

function NewTest({ template = false, previousPage = false }) {
  const navigate = useNavigate();
  const { activeUsers } = useUsers();
  const { activeBranches } = useBranches();
  const { activeProducts } = useProducts();
  const [workflows, setWorkflows] = useState<Workflows>([]);
  const now = getDateTime(addTimeOffset(Date.now()));
  const { closeModal } = useContext(ModalContext);
  const [state, setState] = useState<any>([
    {
      id: "scheduledTo",
      value: now,
    },
    {
      id: "priority",
      value: "Medium",
    },
    {
      id: "workflows",
      value: [],
    },
  ]);
  const { templates, getTemplatesByProduct } = useTemplate();

  const [emptyFields, setEmptyFields] = useState<string[]>([]);
  const requiredFields = ["name", "product", "branch", "release", "scheduledTo", "workflows"];

  const { addAlert } = useContext(AlertContext);

  const { testId } = useParams();
  const { test } = useTestById({ testId: testId });

  useEffect(() => {
    if (!test) return
    if (template) {
      const { name, product, branch, release, workflows, requestor, instructions, assignedTo, priority, machine, notes } =
        test as any
      const mappedWorkflows =
        workflows?.map((workflow: Workflow) => {
          return {
            tempId: workflow._id ?? workflow.tempId ?? generateUUID(),
            workflowName: workflow.workflowName,
            workflowDescription: workflow.workflowDescription,
          };
        }) as any[];

      setState([
        {
          id: "name",
          value: name,
        },
        {
          id: "product",
          value: product,
        },
        {
          id: "branch",
          value: branch,
        },
        {
          id: "release",
          value: release,
        },
        {
          id: "scheduledTo",
          value: now,
        },
        {
          id: "workflows",
          value: mappedWorkflows as Workflows,
        },
        {
          id: "requestor",
          value: requestor ?? '' as Test['requestor'],
        },
        {
          id: "instructions",
          value: instructions ?? '' as Test['instructions'],
        },
        {
          id: "assignedTo",
          value: assignedTo ?? '' as Test['assignedTo'],
        },
        {
          id: "priority",
          value: priority,
        },
        {
          id: 'notes',
          value: notes,
        },
        {
          id: "machine",
          value: machine ?? '' as Test['machine'],
        },
      ]);

      setWorkflows(mappedWorkflows ?? [] as Workflows);
    }
  }, [template, test]);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    if (id === "product") {
      getTemplatesByProduct(value);
    }
    if (id === "selectedDefaultTest") {
      fillFields(event as React.ChangeEvent<HTMLSelectElement>);
    }

    const index = state.findIndex((item: any) => item.id === id);
    index !== -1 ? (state[index].value = value) : state.push({ id, value });
    setState([...state]);
  };

  const isValid = () => {
    setEmptyFields([]);
    // Remove aria-invalid from all input fields
    const allInputs = requiredFields.map((field) => document.getElementById(field)).filter(Boolean);
    allInputs.forEach((input) => input?.removeAttribute("aria-invalid"));
    // Check for empty fields
    const emptyFields = requiredFields.reduce((acc: string[], field: string) => {
      const index = state.findIndex((item: any) => item.id === field);
      const value = state[index]?.value;
      if (index === -1 || !value) {
        return [...acc, field];
      }
      return acc;
    }, []);
    setEmptyFields(emptyFields);
    return emptyFields;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    // Check if there are any empty fields
    const emptyFields = isValid();
    if (emptyFields.length !== 0) {
      // Colorize empty fields inputs
      const emptyFieldsInputs = emptyFields.map((field) => {
        const input = document.getElementById(field);
        if (!input) {
          console.warn(`Could not find input element with ID "${field}"`);
        }
        return input;
      });

      // Add aria-invalid="true" to inputs
      emptyFieldsInputs.forEach((input) => {
        if (input) {
          input.setAttribute("aria-invalid", "true");
        }
      });

      // Show error message
      const errorMessage = (
        <>
          <p>Please fill the following fields:</p>
          <span className="capitalize">{emptyFields.join(", ")}</span>
        </>
      );
      addAlert({
        position: "top-center",
        message: errorMessage,
      });
      return;
    }

    // Prepare data for API request
    const workflowsWithoutId = workflows?.map((workflow: Workflow) => {
      return {
        workflowName: workflow.workflowName,
        workflowDescription: workflow.workflowDescription
      };
    }) ?? [];
    const requestData = state.reduce((obj: any, item: any) => {
      if (item.id) {
        obj[item.id] = item.value as string;
      }
      return obj;
    }, {});
    requestData.workflows = workflowsWithoutId;

    // Send API request
    try {
      await axios.post(process.env.REACT_APP_API_URL + "tests/", requestData);

      navigate(previousPage ? -1 : "/tests/" as any);
    } catch (error: any) {
      addAlert({
        position: "top-center",
        message: error.response.data.message,
      });
    } finally {
      closeModal("create-new-test");
    }
  };



  const fillFields = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (!value) return;
    if (!templates) return;
    const selectedDefaultTest = templates.find((item: Template) => item.name === value) ?? null as Template | null;
    if (!selectedDefaultTest) return
    const selectedDefaultTestWorkflows = selectedDefaultTest?.workflows?.map((object: Workflow) => {
      return {
        workflowName: object.workflowName,
        workflowDescription: object.workflowDescription,
        _id: object._id,
      };
    }) ?? [] as Workflows;
    const nameIndex = state.findIndex((item: any) => item.id === "name");
    nameIndex !== -1 ? (state[nameIndex].value = value) : state.push({ id: "name", value });

    const workflowsIndex = state.findIndex((item: any) => item.id === "workflows");
    workflowsIndex !== -1
      ? (state[workflowsIndex].value = selectedDefaultTestWorkflows)
      : state.push({ id: "workflows", value: selectedDefaultTestWorkflows });

    const nameInput = document.getElementById("name") as HTMLInputElement;

    if (!nameInput) return
    nameInput.value = selectedDefaultTest?.name ?? '';

    setWorkflows(selectedDefaultTestWorkflows || [] as Workflows);
  };

  const defaultTestOptions = templates.map((item: any) => {
    return {
      _id: item._id as string,
      value: item.name as string,
      label: item.name as string,
    };
  });

  return (
    <Modal
      id="new-test"
      open={true}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      header={'Create new test'}
      onClose={() => navigate(-1)}
      footer={

        <>
          <button className="btn btn-secondary block" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="btn btn-primary block " onClick={handleSubmit}>
            Create test
          </button>
        </>
      }
    >
      <div className="flex flex-col justify-center px-2">
        <div className="max-w-7xl grid grid-cols-2 gap-2">
          <section className="w-full space-y-4">
            <Collapse title={"Test details"} open={true}>
              <div className={"grid grid-cols-2 sm:grid-cols-1 space-y-2"}>
                <label htmlFor={"product"} className="form-label form-label-required">
                  Product
                </label>
                <select
                  autoFocus
                  className="form-control form-select"
                  id="product"
                  value={state.find((item: any) => item.id === "product")?.value || ""}
                  onChange={handleFormChange}
                >
                  <option value="" defaultChecked hidden>
                    Select product
                  </option>
                  {activeProducts.map((product) => {
                    return (
                      <option key={'product-' + product._id} value={product.name}>
                        {product.name}
                      </option>
                    );
                  })}
                </select>
                <label htmlFor="selectedDefaultTest" className="form-label">
                  Template
                </label>

                <select
                  className="form-control form-select"
                  id="selectedDefaultTest"
                  value={state.find((item: any) => item.id === "selectedDefaultTest")?.value || ""}
                  disabled={templates.length === 0}
                  onChange={handleFormChange}
                >
                  <option value="" defaultChecked hidden>
                    {!state.find((item: any) => item.id === "product")
                      ? "First select a product"
                      : templates.length === 0
                        ? "No templates available"
                        : "Select a template"}
                  </option>
                  {defaultTestOptions.map((template: any) => (
                    <option key={'template-' + template._id} value={template.value}>
                      {template.value}
                    </option>
                  ))}
                </select>
                <label htmlFor={"scheduledTo"} className="form-label form-label-required">
                  Schedule test to
                </label>
                <input
                  type={"datetime-local"}
                  id="scheduledTo"
                  className="form-control form-input w-96"
                  defaultValue={now}
                  value={state?.scheduledTo}
                  onChange={handleFormChange}
                />

                <label htmlFor={"name"} className="form-label form-label-required">
                  Test Name
                </label>
                <input
                  className="form-control form-input"
                  type={"text"}
                  id="name"
                  placeholder="A name that will be used to identify this test"
                  defaultValue={state.find((item: any) => item.id === "name")?.value || ""}
                  onChange={handleFormChange}
                />

                <label htmlFor={"branch"} className="form-label form-label-required">
                  Branch
                </label>
                <select
                  id="branch"
                  className="form-control form-select"
                  value={state.find((item: any) => item.id === "branch")?.value || ""}
                  onChange={handleFormChange}
                >
                  <option value="" hidden disabled>
                    No branch selected
                  </option>
                  {activeBranches.map((item) => {
                    return (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>

                <label htmlFor={"release"} className="form-label form-label-required">
                  Release
                </label>
                <input
                  className="form-control form-input"
                  type={"text"}
                  id="release"
                  placeholder="
                  The release that this test is targeting.
                  "
                  onChange={handleFormChange}
                  defaultValue={state.find((item: any) => item.id === "release")?.value || ""}
                />
              </div>
            </Collapse>
            <Collapse open={true} title="Additional details">
              <div className="grid-cols-auto">
                <label htmlFor={"release"} className="form-label">
                  Requested by:
                </label>
                <input
                  className="form-control form-input form-block"
                  type={"text"}
                  id="requestor"
                  onChange={handleFormChange}
                  placeholder="If applicable, the name of the person requesting this test."
                  defaultValue={state.find((item: any) => item.id === "requestor")?.value || ""}
                />
                <label htmlFor="instructions" className="form-label">
                  Instructions
                </label>

                <textarea
                  id="instructions"
                  rows={3}
                  placeholder={`Instructions for the test executor.\n\nCan be edited after test creation.`}
                  className="form-control form-textarea"
                  onChange={handleFormChange}
                  defaultValue={state.find((item: any) => item.id === "instructions")?.value || ""}
                />
                <div className="form-description">
                  Instructions will not be included in the test report. Use the test notes for that.
                </div>
                <label htmlFor="notes" className="form-label">
                  Test Notes
                </label>

                <textarea
                  id="notes"
                  rows={3}
                  placeholder={`Notes\n\nAccepts multiple lines.`}
                  className="form-control form-textarea"
                  onChange={handleFormChange}
                  defaultValue={state.find((item: any) => item.id === "notes")?.value || ""}
                />
                <div className="form-description">
                  Notes will be included in the test report. If you want to add instructions for the test executor, use the instructions field.
                </div>


                <label htmlFor="priority" className="form-label">
                  Priority
                </label>
                <select
                  id="priority"
                  className="form-control form-select"
                  value={state.find((item: any) => item.id === "priority")?.value || ""}
                  onChange={handleFormChange}
                >
                  <option value="" defaultChecked hidden>
                    Select priority
                  </option>
                  {PRIORITIES.map((item) => {
                    return (
                      <option key={item.id} value={item.value}>
                        {item.value}
                      </option>
                    );
                  })}
                </select>

                <label htmlFor="assignedTo" className="form-label">
                  Assigned to
                </label>
                <select
                  id="assignedTo"
                  className="form-control form-select form-block"
                  onChange={handleFormChange}
                  value={state.find((item: any) => item.id === "assignedTo")?.value || (test ? test?.assignedTo : "")}
                >
                  <option value="" defaultChecked hidden>
                    Select user
                  </option>
                  {activeUsers.map((item) => {
                    return (
                      <option key={item._id} value={item.name}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>

                <label htmlFor="machine" className="form-label">
                  Machine
                </label>
                <input
                  id="machine"
                  className="form-control form-input form-block"
                  placeholder="Leave blank to fill in later"
                  onChange={handleFormChange}
                  defaultValue={state.find((item: any) => item.id === "machine")?.value || ""}
                />
              </div>
            </Collapse>
          </section>
          <NewWorkflow
            workflows={workflows}
            setWorkflows={setWorkflows}
          />
        </div>
      </div>
    </Modal>
  );
}

export default NewTest;
