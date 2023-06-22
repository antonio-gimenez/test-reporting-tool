import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useProducts from "../hooks/useProducts";
import useTemplate from "../hooks/useTemplates";
import { Product, Template, Test, Workflows } from "../types";
import { useAlert } from "./Alert";
import Modal from "./Modal";
import NewWorkflow from "./NewWorkflow";
import useTestById from "../hooks/useTestById";

const BasedTemplate = () => {
  const { testId } = useParams();
  const { test } = useTestById({ testId });
  const { addTemplate } = useTemplate();
  const { activeProducts } = useProducts();
  const [productId, setProductId] = useState<Product["_id"] | null>(null);
  const [newTestName, setNewTestName] = useState<string | null>(null);
  const [newTestProduct, setNewTestProduct] = useState<Product["_id"] | null>(null);
  const { addAlert } = useAlert();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflows>(test?.workflows || []);

  const handleSetProductId = () => {
    if (test?.product && activeProducts.length > 0) {
      const productNameToId = getProductId(test.product as Test["product"]);
      if (productNameToId) {
        setProductId(productNameToId);
      }
    }
  };

  const getProductId = (productName: Product["name"]) => {
    if (!productName) return null;
    if (test?.product && activeProducts.length > 0) {
      const product = activeProducts.find((product) => product.name === productName);
      return product?._id || null;
    }
    return null;
  };

  const handleNewTestProduct = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (!value) return;
    setNewTestProduct(value);
  };

  const handleNewTestName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (!value) return;
    setNewTestName(value);
  };

  useEffect(() => {
    handleSetProductId();
  }, [test?.product, activeProducts]);


  useEffect(() => {
    if (test) {
      setWorkflows(test.workflows);
    }
  }
    , [test])

  const handleAddDefaultTest = (
    event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    const { name } = test as Test;
    const newTest = {
      product: newTestProduct ?? productId,
      name: newTestName ?? (name as Test["name"]),
      workflows: workflows as Test["workflows"],
    };

    try {
      addTemplate(newTest as Template);
      navigate(-1);
      addAlert({
        message: (
          <p>
            Template <strong>{newTest.name}</strong> created
          </p>
        ),
        position: "top-center",
      });
    } catch (error) {
      addAlert({ message: `error` });
    }
  };

  // if (!testId || !test || !workflows) return null;
  return test ? (
    <Modal
      id="based-template"
      header={`Templated based on ${test?.testId}`}
      open={true}
      onClose={() => navigate(-1)}
      footer={<>
        <button type="button" className="btn btn-secondary block" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary block" onClick={handleAddDefaultTest}>
          Create Template
        </button>
      </>
      }
    >
      <div className="flex flex-col ">
        <div className="form-flex flex-col gap-medium ">
          <label htmlFor={"name"} className="form-label form-label-required">
            Template Name
          </label>
          <input
            className="form-control form-input"
            placeholder={test?.name}
            defaultValue={test?.name}
            id={"name"}
            onChange={handleNewTestName}
          />
          <label htmlFor={"product"} className="form-label">
            Product
          </label>
          <select
            id={"product"}
            className="form-control form-select"
            value={newTestProduct ?? (getProductId(test.product) ?? "")}
            onChange={handleNewTestProduct}
          >
            <option value="" defaultChecked hidden>
              Select product
            </option>
            {activeProducts.map((product) => {
              return (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <ul >
            {workflows && workflows?.length === 0 && <p className="text-sm">No workflows</p>}
            <NewWorkflow workflows={workflows} setWorkflows={setWorkflows} />
          </ul>
        </div>
      </div>
    </Modal>
  ) : null;
};

export default BasedTemplate;
