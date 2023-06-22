import { useContext, useEffect, useState } from "react";
import { ReactComponent as EyeIcon } from "../../assets/icons/eye-16.svg";
import { ReactComponent as EyeCloseIcon } from "../../assets/icons/eye-closed-16.svg";
import { ReactComponent as PencilIcon } from "../../assets/icons/pencil-16.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash-16.svg";
import Modal, { useModal } from "../../components/Modal";
import useBranches from "../../hooks/useBranches";
import { Branch } from "../../types";

function Branches(): JSX.Element {
  const { branches, addBranch, deleteBranch, updateBranch } = useBranches();
  const [newBranch, setNewBranch] = useState<Branch | null>(null);

  const { openModal, closeModal } = useModal();

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = event.target;
    if (!value) return setNewBranch(null);
    setNewBranch({
      ...newBranch!,
      [id]: value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!newBranch) return null;
    try {
      addBranch(newBranch);
      setNewBranch(null);
      (document.getElementById("name") as HTMLInputElement).value = "";
    } catch {
      return;
    } finally {
      closeModal("addBranch");
    }
  };

  const handleUpdateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, checked } = event.target;
    if (id === "active") {
      return setNewBranch({
        ...newBranch!,
        [id]: checked,
      });
    }
    setNewBranch({
      ...newBranch!,
      [id]: value,
    });
  };

  const handleUpdateBranch = (
    event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
    branch: Branch
  ) => {
    event.preventDefault();
    if (!branch) return null;
    if (!newBranch) return null;
    try {
      updateBranch(branch._id, newBranch.name!, newBranch.active!);
    } catch {
      return;
    } finally {
      setNewBranch(null);
      closeModal(`edit-${branch._id}`);
    }
  };

  const handleRemoveBranch = (branch: Branch) => {
    if (!branch) return null;
    try {
      deleteBranch(branch._id);
    } catch {
      return;
    } finally {
      closeModal(`edit-${branch._id}`);
    }
  };

  useEffect(() => {
    if (newBranch !== null) {
      setNewBranch(null);
    }
    return () => {
      setNewBranch(null);
    };
  }, [closeModal]);

  return (
    <div>
      <div className="section">
        <h2 className="section-name">Branches</h2>
        <button className="btn btn-success" onClick={() => openModal("addBranch")} >
          Add Branch
        </button>
        <Modal id="addBranch" header="Create branch" footer={
          <>
            <button className="btn btn-secondary block" onClick={() => closeModal('addBranch')}>
              Cancel
            </button>
            <button className="btn btn-primary block" onClick={handleSubmit} disabled={!newBranch || false}>
              Create branch
            </button>
          </>
        }>
          <div className="form-group" >
            <label htmlFor="name" className="form-label form-label-required">Branch Name</label>
            <input
              type="text"
              id="name"
              autoFocus={true}
              className="form-control"
              placeholder={"master"}
              onChange={handleFormChange}
            />

          </div>
        </Modal>
      </div>
      <div className="overview">
        <p>
          Branches are used to help teams manage code changes more efficiently, reduce conflicts and errors, and enable
          better collaboration.
        </p>
        <p></p>
        <p>You can create as many branches as you want, and you can update or delete them at any time.</p>
      </div>

      <div className="box">
        <div className="box-content">
          {branches.length > 0 && (
            <ul className="list">
              {branches.map((branch) => (
                <li className="list-item" key={branch._id}>
                  <span className={branch?.active ? "" : "content-muted"}>{branch.name}</span>

                  <div className="list-item-actions">
                    <>
                      {branch.active ? (
                        <EyeIcon className="icon btn-active " title="Branch is inactive" />
                      ) : (
                        <EyeCloseIcon title="Branch is active" className="icon btn-grayscale" />
                      )}
                      <div>
                        <span className="divider-inline" />
                      </div>
                      <PencilIcon
                        className="btn-link"
                        title="Update branch"
                        onClick={() => openModal(`edit-${branch._id}`)}
                      />
                      <Modal
                        id={`edit-${branch._id}`}
                        header="Update branch"
                        footer={
                          <>
                          <button className="btn btn-secondary block" onClick={() => closeModal(`edit-${branch._id}`)}>
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary block"
                            onClick={(event) => handleUpdateBranch(event, branch)}
                            disabled={!newBranch}
                          >
                            Update
                          </button>
                          </>
                        }
                      >
                        <div className="form-group">
                          <label className="form-label" htmlFor="name">Branch name:</label>
                          <input
                            type="text"
                            autoFocus={true}
                            id="name"
                            placeholder={branch.name || "stable"}
                            defaultValue={branch.name}
                            className="form-control"
                            onChange={handleUpdateChange}
                          />
                          <div>
                            <input
                              type="checkbox"
                              id="active"
                              className="box"
                              defaultChecked={branch.active}
                              onChange={handleUpdateChange}
                            />
                            <label htmlFor="active" className="form-label">
                              Active
                            </label>
                            <p className="form-description">
                              By switching a branch to inactive, will be not listed in the branch list, and will not be
                              available for selection on other pages.
                            </p>
                          </div>
                        </div>
                      </Modal>
                      <TrashIcon
                        className="btn-icon btn-icon-error"
                        title="Delete branch"
                        onClick={() => openModal(`remove-${branch._id}`)}
                      />
                      <Modal
                        id={`remove-${branch._id}`}
                        header="Delete branch"
                        footer={
                          <>
                          <button className="btn btn-secondary block" onClick={() => closeModal(`remove-${branch._id}`)}>
                            Cancel
                          </button>
                          <button className="btn btn-error block" onClick={() => handleRemoveBranch(branch)}>
                            Delete 
                          </button>
                          </>
                        }
                      >
                        <p>
                          Are you sure you want to delete <strong>{branch.name}</strong>?
                        </p>
                        <p>This action cannot be undone.</p>
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

export default Branches;
