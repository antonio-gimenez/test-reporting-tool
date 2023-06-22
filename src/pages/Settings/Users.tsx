import React, { useEffect, useState } from "react";
import { ReactComponent as EyeIcon } from "../../assets/icons/eye-16.svg";
import { ReactComponent as EyeCloseIcon } from "../../assets/icons/eye-closed-16.svg";
import { ReactComponent as PencilIcon } from "../../assets/icons/pencil-16.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash-16.svg";
import Modal, { useModal } from "../../components/Modal";
import useUsers from "../../hooks/useUsers";
import { User } from "../../types";

function Users(): JSX.Element {
  const { users, addUser, deleteUser, updateUser } = useUsers();
  const [newUser, setNewUser] = useState<User | null>(null);
  const { openModal, closeModal } = useModal();

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = event.target;
    if (!value) return null;
    setNewUser({
      ...newUser!,
      [id]: value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!newUser) return null;
    try {
      addUser(newUser);
      (document.getElementById("name") as HTMLInputElement).value = "";
    } catch (error) {
      return;
    } finally {
      setNewUser(null);
      closeModal("addUser");
    }
  };

  const handleUpdateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, checked } = event.target;
    if (id === "active") {
      return setNewUser({
        ...newUser!,
        [id]: checked,
      });
    }

    setNewUser({
      ...newUser!,
      [id]: value,
    });
  };

  const handleUpdateUser = (
    event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
    user: User
  ) => {
    console.log(user);
    event.preventDefault();
    if (!user) return null;
    if (!newUser) return null;
    try {
      updateUser(user, newUser!.name, newUser!.email, newUser!.active, newUser!.APIKey);
    } catch (error) {
      return;
    } finally {
      setNewUser(null);
      closeModal(`edit-${user._id}`);
    }
  };

  const handleRemoveUser = (user: User) => {
    if (!user) return null;
    try {
      deleteUser(user._id);
    } catch (error) {
      return;
    } finally {
      closeModal(`remove-${user._id}`);
    }
  };

  useEffect(() => {
    if (newUser !== null) {
      setNewUser(null);
    }
    return () => {
      setNewUser(null);
    };
  }, [closeModal]);

  return (
    <div>
      <div className="section">
        <h2 className="section-name">Team Users</h2>
        <button className="btn btn-success" onClick={() => openModal("addUser")}>
          Add User
        </button>
        <Modal
          id="addUser"
          header="Create user"
          footer={
            <>
              <button className="btn btn-secondary block" onClick={() => closeModal("addUser")}>
                Cancel
              </button>
              <button className="btn btn-primary block" disabled={!newUser} onClick={handleSubmit}>
                Create
              </button>
            </>
          }
        >
          <form className="form-group" onSubmit={handleSubmit}>
            <label htmlFor="name">User Name</label>
            <input
              type="text"
              id="name"
              autoFocus={true}
              placeholder="John Doe"
              className="form-control"
              onChange={handleFormChange}
            />
          </form>
        </Modal>
      </div>
      <div className="overview">
        <p>Control who can assign tests to themselves. You can add as many users as you like.</p>
      </div>

      <div className="box">
        {users.length > 0 ? (
          <div className="box-content">
            <ul className="list">
              {users.map((user: User) => (
                <li className="list-item" key={user._id}>
                  <span className={user?.active ? "" : "content-muted"}>{user.name}</span>
                  <div className="list-item-actions">
                    {user.active ? (
                      <EyeIcon className="icon btn-active " title="User is active" />
                    ) : (
                      <EyeCloseIcon className="icon btn-grayscale" title="User is inactive" />
                    )}
                    <div>
                      <span className="divider-inline" />
                    </div>
                    <PencilIcon className="btn-link" title="Edit" onClick={() => openModal(`edit-${user._id}`)} />
                    <Modal
                      id={`edit-${user._id}`}
                      header="Update user"
                      footer={
                        <>
                          <button className="btn btn-secondary block" onClick={() => closeModal(`edit-${user._id}`)}>
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary block"
                            disabled={!newUser}
                            onClick={(event) => handleUpdateUser(event, user)}
                          >
                            Update
                          </button>
                        </>
                      }
                    >
                      <form className="form-group">
                        <span>User name:</span>
                        <input
                          type="text"
                          autoFocus={true}
                          id="name"
                          placeholder={user.name ? user.name : "John Doe"}
                          defaultValue={user.name}
                          className="form-control"
                          onChange={handleUpdateChange}
                        />
                        <div className="flex flex-col max-w-md">
                          <label htmlFor="active" className="flex items-center gap-small">
                            <input
                              type="checkbox"
                              id="active"
                              defaultChecked={user.active}
                              onChange={handleUpdateChange}
                            />
                            <strong>Active</strong>
                          </label>
                          <span className="form-description">
                            By switching a user to inactive, will be not listed in the users list, and will not be
                            available for selection on other pages.
                          </span>
                        </div>
                      </form>
                    </Modal>

                    <TrashIcon
                      className="btn-icon btn-icon-error"
                      title="Delete"
                      onClick={() => openModal(`remove-${user._id}`)}
                    />
                    <Modal
                      id={`remove-${user._id}`}
                      header="Delete user"
                      footer={
                        <button className="btn btn-error btn-outline" onClick={() => handleRemoveUser(user)}>
                          Delete user
                        </button>
                      }
                    >
                      <p>
                        Are you sure you want to delete <strong>{user.name}</strong>?
                      </p>
                      <p>This action cannot be undone.</p>
                    </Modal>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="box-content-empty"> No users found. Add one to get started.</div>
        )}
      </div>
    </div>
  );
}

export default Users;
