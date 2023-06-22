import { useState } from "react";
import { ReactComponent as DuplicateIcon } from "../../assets/icons/duplicate-16.svg";
import { ReactComponent as PencilIcon } from "../../assets/icons/pencil-16.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash-16.svg";
import Modal, { useModal } from "../../components/Modal";
import NewWorkflow from "../../components/NewWorkflow";
import useProducts from "../../hooks/useProducts";
import useTemplate from "../../hooks/useTemplates";
import { Template, Workflows } from "../../types";

function Templates() {
  const { activeProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(activeProducts[0]?.name ?? null);
  const [workflows, setWorkflows] = useState<Workflows>(null);
  const { templates, getTemplatesByProduct, addTemplate, updateTemplate, duplicateTemplate, deleteTemplate } =
    useTemplate();
  const [newTestName, setNewTestName] = useState<Template["name"] | null>(null);

  const { openModal, closeModal } = useModal();
  const handleSelectedProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setSelectedProduct(null);
    if (!value) return;
    setSelectedProduct(value);
    getTemplatesByProduct(value);
  };


  const handleAddDefaultTest = (e: React.FormEvent<HTMLFormElement>) => {
    // check if newTestName is valid
    e.preventDefault();
    if (templates.find((template: Template) => template.name === newTestName)) {
      return;
    }

    if (newTestName) {
      addTemplate({
        product: selectedProduct as Template["product"],
        name: newTestName as Template["name"],
        workflows: [] as Template["workflows"],
      } as Template);
    } else {
      setNewTestName(null);
    }
    closeModal("new-default-test");
  };

  const saveTest = (template: Template) => {
    if (!template) return;
    if (!workflows) return;
    const formattedWorkflows = workflows.map((w) => {
      return {
        workflowName: w.workflowName,
        workflowDescription: w.workflowDescription,
      };
    });

    try {
      updateTemplate(template, {
        name: newTestName ?? template.name,
        product: template.product ?? selectedProduct,
        workflows: formattedWorkflows,
      } as Template);
    } catch (error) {
      return;
    } finally {
      setNewTestName(null);
      setWorkflows([]);
      closeModal(`edit-template-${template._id}`);
    }
  };

  const onTestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (!value) return;
    setNewTestName(value);
  };

  const handleEditDefaultTest = (item: Template) => {
    if (!item) return;
    if (!item.workflows) return;
    setWorkflows(item.workflows);
    openModal(`edit-template-${item._id}`);
  };

  return (
    <div>
      <div className="section">
        <h1 className="section-name">Templates</h1>
        <p className="text-gray"> Create and manage templates when creating new tests.</p>
      </div>
      <div className="overview">
        <p>
          Create a template to use when creating a new test. You can create multiple templates for each product. You can
          also duplicate a template to create a new one with the same steps.
        </p>
      </div>
      <div className="box">
        <div className="box-header">
          <select
            id="product"
            className="form-control form-select"
            defaultValue={selectedProduct || ""}
            onChange={handleSelectedProduct}
          >
            <option value="" hidden>
              Select Product
            </option>
            {activeProducts.map((product) => (
              <option key={product.name} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
          <button onClick={() => openModal("new-default-test")} disabled={!selectedProduct} className="btn btn-success">
            Create template
          </button>
        </div>

        <Modal
          id="new-default-test"
          header={"New template"}
          footer={
            <>
              <button className="btn btn-secondary block" onClick={() => closeModal("new-default-test")}>
                Cancel
              </button>
              <button className="btn btn-primary block" type="submit" disabled={!newTestName || !selectedProduct} >
                Create
              </button>
            </>
          }
        >
          <form className="form-group" onSubmit={handleAddDefaultTest}>
            <label htmlFor="name" className="form-label-required">
              Template Name
            </label>
            <input
              autoFocus={true}
              id={"name"}
              placeholder="Template Name"
              className="form-control form-input"
              onChange={onTestNameChange}
            />
          </form>
        </Modal>
        <>
          {templates.length > 0 ? (
            <>
              <div className="">
                {templates.map((template: Template) => (
                  <li className={`list-item`} key={template._id}>
                    <span>{template.name}</span>
                    <div className="list-item-actions">
                      <DuplicateIcon
                        className="btn-link"
                        title="Duplicate template"
                        onClick={() => openModal(`duplicate-${template._id}`)}
                      />
                      <Modal
                        id={`duplicate-${template._id}`}
                        header="Duplicate template"
                        footer={
                          <>
                            <button className="btn btn-secondary block" onClick={() => closeModal(`duplicate-${template._id}`)}>
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary block"
                              onClick={() => {
                                duplicateTemplate(template);
                                closeModal(`duplicate-${template._id}`);
                              }}
                            >
                              Duplicate
                            </button>
                          </>
                        }
                      >
                        <p>
                          Are you sure you want to duplicate <em>{template.name}</em>?
                        </p>
                      </Modal>
                      <PencilIcon
                        className="btn-link"
                        title="Edit template"
                        onClick={() => handleEditDefaultTest(template)}
                      />
                      <TrashIcon
                        onClick={() => openModal(`delete-template-${template._id}`)}
                        className="btn-link hover-error"
                        title="Delete template"
                      />
                      <Modal id={`delete-template-${template._id}`} header="Delete template" footer={
                        <>
                          <button className="btn btn-secondary block" onClick={() => closeModal(`delete-template-${template._id}`)}>
                            Cancel
                          </button>
                          <button
                            className="btn btn-error block"
                            onClick={() => {
                              deleteTemplate(template);
                              closeModal(`delete-template-${template._id}`);
                            }}
                          >
                            Confirm delete
                          </button>
                        </>
                      }>
                        <p>
                          Are you sure you want to delete <strong>{template.name}</strong>?
                        </p>
                        <p>
                          This action cannot be undone
                        </p>
                      </Modal>
                    </div>
                    <Modal
                      id={`edit-template-${template._id}`}
                      header={"Edit"}
                      footer={
                        <>
                          <button
                            onClick={() => closeModal(`edit-template-${template._id}`)}
                            className="btn btn-secondary block "
                          >
                            Cancel
                          </button>
                          <button onClick={() => saveTest(template)}
                            className="btn btn-primary block">
                            Update Template
                          </button>
                        </>
                      }
                    >

                      <div className="gap-medium padding-medium grid-cols-auto">
                        <label htmlFor="name" className="form-label-required">
                          Test Name
                        </label>
                        <input
                          className="form-control form-input form-block"
                          placeholder={template.name}
                          defaultValue={template.name}
                          id={"name"}
                          onChange={onTestNameChange}
                        />

                        <NewWorkflow
                          workflows={workflows ?? []}
                          setWorkflows={setWorkflows}
                        />
                      </div>
                    </Modal>
                  </li>
                ))}
              </div>
            </>
          ) : !selectedProduct ? (
            <div className="box-content-empty">
              <p className="text-gray">Select a product to view templates.</p>
            </div>
          ) : (
            <div className="box-content-empty">
              <p className="text-gray">No templates found. Add one to get started.</p>
            </div>
          )}
        </>
      </div>
    </div>
  );
}

export default Templates;
