import { useEffect, useState } from "react";
import { ReactComponent as EyeIcon } from "../../assets/icons/eye-16.svg";
import { ReactComponent as EyeCloseIcon } from "../../assets/icons/eye-closed-16.svg";
import { ReactComponent as PencilIcon } from "../../assets/icons/pencil-16.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash-16.svg";

import Modal, { useModal } from "../../components/Modal";
import useProducts from "../../hooks/useProducts";
import { Product } from "../../types/";

function Products(): JSX.Element {
  const { products, addProduct, deleteProduct, updateProduct } = useProducts();
  const [newProduct, setNewProduct] = useState<Product | null>(null);

  const { openModal, closeModal } = useModal();

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = event.target;
    if (!value) return setNewProduct(null);
    setNewProduct({
      ...newProduct!,
      [id]: value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!newProduct) return null;
    try {
      addProduct(newProduct);
      setNewProduct(null);
      (document.getElementById("name") as HTMLInputElement).value = "";
    } catch {
      return;
    } finally {
      closeModal("addProduct");
    }
  };

  const handleUpdateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, checked } = event.target;
    if (id === "active") {
      return setNewProduct({
        ...newProduct!,
        [id]: checked,
      });
    }

    setNewProduct({
      ...newProduct!,
      [id]: value,
    });
  };

  const handleUpdateProduct = (
    event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
    product: Product
  ) => {
    event.preventDefault();
    if (!newProduct) return null;
    try {
      updateProduct(product._id, newProduct.name!, newProduct.active!);
    } catch {
      return;
    } finally {
      setNewProduct(null);
      closeModal(`edit-${product._id}`);
    }
  };

  const handleRemoveProduct = (product: Product) => {
    if (!product) return null;
    try {
      deleteProduct(product._id);
    } catch {
      return;
    } finally {
      closeModal(`remove-${product._id}`);
    }
  };

  useEffect(() => {
    return () => {
      setNewProduct(null);
    };
  }, [closeModal]);

  return (
    <div>
      <div className="section">
        <h2 className="section-name">Products</h2>
        <button className="btn btn-success" onClick={() => openModal("addProduct")}>
          Add Product
        </button>
        <Modal id="addProduct" header="Create product" footer={
          <>
            <button className="btn btn-secondary block" onClick={() => closeModal("addProduct")}> Cancel </button>
            <button className="btn btn-primary block" onClick={handleSubmit} disabled={!newProduct}> Create product </button>
          </>
        }>
          <div className="form-group" >
            <label htmlFor="name" className="form-label form-label-required">Product Name</label>
            <input type="text" id="name" autoFocus={true} className="form-control" onChange={handleFormChange} />

          </div>
        </Modal>
      </div>
      <div className="overview">
        <p>On this page you can create products that will be used in other parts of the app.</p>
      </div>

      <div className="box">
        <div className="box-content">
          {products.length > 0 && (
            <ul className="list">
              {products.map((product) => (
                <li className="list-item" key={product._id}>
                  <span className={product?.active ? "" : "content-muted"}>{product.name}</span>
                  <div className="list-item-actions">
                    <>
                      {product.active ? (
                        <EyeIcon className="icon btn-active " title="Product is active" />
                      ) : (
                        <EyeCloseIcon title="Product is inactive" className="icon btn-grayscale" />
                      )}
                      <div>
                        <span className="divider-inline" />
                      </div>
                      <PencilIcon
                        className="btn-link "
                        title="Edit this product"
                        onClick={() => openModal(`edit-${product._id}`)}
                      />
                      <Modal id={`edit-${product._id}`} header="Update product" footer={
                        <>
                          <button className="btn btn-secondary block" onClick={() => closeModal(`edit-${product._id}`)}> Cancel </button>
                          <button className="btn btn-primary block" onClick={(event) => handleUpdateProduct(event, product)} disabled={!newProduct}>
                            Update
                          </button>
                        </>
                      } >
                        <div className="form-group" >
                          <label className="form-label">Product name:</label>
                          <input
                            type="text"
                            autoFocus={true}
                            id="name"
                            placeholder={product.name}
                            defaultValue={product.name}
                            className="form-control"
                            onChange={handleUpdateChange}
                          />
                          <div className="flex flex-col max-w-md">
                            <label htmlFor="active" className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="active"
                                defaultChecked={product.active}
                                onChange={handleUpdateChange}
                              />
                              <strong>Active</strong>
                            </label>
                            <span className="form-description">
                              By switching a product to inactive, will be not listed in the products list, and will not
                              be available for selection on other pages.
                            </span>
                          </div>
                        </div>
                      </Modal>
                      <TrashIcon
                        className="icon hover-error "
                        title="Delete product"
                        onClick={() => openModal(`remove-${product._id}`)}
                      />
                      <Modal id={`remove-${product._id}`} header="Delete product"
                        footer={
                          <>
                            <button className="btn btn-secondary block" onClick={() => closeModal(`remove-${product._id}`)}> Cancel </button>
                            <button className="btn btn-error block" onClick={() => handleRemoveProduct(product)}>
                              Delete
                            </button>

                          </>
                        }
                      >
                        <p>
                          Are you sure you want to delete <strong>{product.name}</strong>?
                        </p>
                        <p className="newline emphatize">
                          Be aware!
                          This product is referenced in other parts of the app, so if you delete it, can cause
                          unexpected behaviors on the other components. This action cannot be undone.
                        </p>

                      </Modal>
                    </>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
