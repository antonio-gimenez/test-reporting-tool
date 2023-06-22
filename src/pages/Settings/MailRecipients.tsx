import { useEffect, useState } from "react";
import { ReactComponent as PencilIcon } from "../../assets/icons/pencil-16.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash-16.svg";
import Modal, { useModal } from "../../components/Modal";
import useMails from "../../hooks/useMails";
import useSearch from "../../hooks/useSearch";
import { Mail } from "../../types";

function MailRecipients(): JSX.Element {
  const { mails, addMail, deleteMail, updateMail, isLoading } = useMails();
  const [newMail, setNewMail] = useState<Mail | null>(null);
  const { openModal, closeModal } = useModal();
  const { searchTerm, searchResults, handleSearch, isSearching } = useSearch(mails)
  const [filteredMails, setFilteredMails] = useState<Mail[]>(searchResults?.length > 0 ? searchResults : mails);

  const handleNewMailChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { value, id } = event.target;
    if (!value) return setNewMail(null);
    if (id === "name") {
      setNewMail({
        ...newMail!,
        name: value,
      });
    }
    if (id === "recipientType") {
      setNewMail({
        ...newMail!,
        recipientType: value as "cc" | "to" | "bcc",
      });
    }
  };

  const handleNewMailSubmit = () => {
    if (!newMail) return;
    if (!newMail.recipientType) {
      newMail.recipientType = 'cc';
    }
    try {
      addMail(newMail);
    } catch (error) {
      console.error(error);
    } finally {
      setNewMail(null);
      closeModal("addMail");
    }
  };

  const handleEditMailChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { value, id } = event.target;
    if (!value) return setNewMail(null);
    if (id === "name") {
      setNewMail({
        ...newMail!,
        name: value,
      });
    }
    if (id === "recipientType") {
      setNewMail({
        ...newMail!,
        recipientType: value as "cc" | "to" | "bcc",
      });
    }
  };

  const handleUpdateMail = (mail: Mail) => {
    if (!newMail) return;
    if (!mail) return;
    try {
      updateMail(mail, newMail.name!, newMail.recipientType!);
    } catch (error) {
      console.error(error);
    } finally {
      setNewMail(null);
      closeModal(`edit-${mail._id}`);
    }
  };

  const handleRemoveMail = (mail: Mail) => {
    if (!mail) return;
    try {
      deleteMail(mail._id);
    } catch (error) {
      console.error(error);
    } finally {
      closeModal(`remove-${mail._id}`);
    }
  };


  useEffect(() => {
    setNewMail(null);
    return () => {
      setNewMail(null);
    }
  }, [closeModal]);

  useEffect(() => {
    if (isSearching) {
      return setFilteredMails(searchResults)
    } else {
      setFilteredMails(mails)
    }
  }, [searchResults, mails, isSearching, filteredMails?.length, mails?.length]);

  return (
    <div>
      <div className="section">
        <h2 className="section-name">Mail Recipients</h2>
        <button className="btn btn-success" onClick={() => openModal("addMail")}>
          Add Mail
        </button>

        <Modal id="addMail" header="Create mail address" footer={
          <>
            <button className="btn btn-secondary block" onClick={() => closeModal("addMail")}>
              Cancel
            </button>
            <button className="btn  btn-primary block" disabled={!newMail?.name || !newMail?.recipientType} onClick={handleNewMailSubmit}>
              Create Mail 
            </button>
          </>
        }>
          <div className="form-group" >
            <label htmlFor="name" className="form-label form-label-required">Mail address:</label>
            <input type="text" id="name" autoFocus={true} className="form-control"
              placeholder={'name@mail.com'}
              onChange={handleNewMailChange} />
            <label htmlFor="recipientType" className="form-label form-label-required">Recipient type:</label>
            <select id="recipientType" className="form-control" onChange={handleNewMailChange}>
              <option value="">Select recipient type</option>
              <option value="cc">CC</option>
              <option value="to">To</option>
              <option value="bcc">BCC</option>
            </select>
          </div>
        </Modal>
      </div>
      <div className="overview">
        <p>
          Mail recipients are the email addresses that will receive the report when it's generated.
        </p>
        <div>

          <p>
            Cc stands for "carbon copy." They will receive a copy of the message, and all other recipients will be able to see that the person was included.
          </p>
          <p>
            Bcc stands for "blind carbon copy." They will receive a copy of the message, but none of the other recipients will be able to see that the person was included.
          </p>
        </div>
      </div>
      <input type="text" disabled={!mails.length || isLoading} className="form-control form-block" placeholder="Search" onChange={handleSearch} />
      {mails?.length === 0 && !isLoading ? <div className="box">
        <div className="box-content-empty">No mail addresses found</div>
      </div> :
        (

          <div className="table-wrapper">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Mail address</th>
                  <th>Recipient type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {isLoading ? (
                  <tr className="box-content-empty">
                    <td className="loading" />
                  </tr>

                ) : (
                    filteredMails?.map((mail: Mail) => (
                      <tr className="table-row" key={mail._id}>
                        <td className="table-cell">{mail.name}</td>
                        <td className="table-cell">
                          {mail.recipientType}
                        </td>
                        <td className="table-cell">
                          <div className="list-item-actions">
                            <PencilIcon
                              className="btn-link"
                              title="Edit"
                              onClick={() => openModal(`edit-${mail._id}`)}
                            />
                            <Modal id={`edit-${mail._id}`} header="Update mail address" footer={
                            <>
                            <button className="btn btn-secondary block" onClick={() => closeModal(`edit-${mail._id}`)}>
                              Cancel
                            </button>
                            <button className="btn btn-primary block" disabled={!newMail} onClick={() => handleUpdateMail(mail)}>
                              Update   
                            </button>
                            </>
                          }>
                              <div className="form-group" >
                                <label htmlFor="mail" className="form-label form-label-required">Mail address:</label>
                                <input
                                  type="text"
                                  autoFocus={true}
                                  id="name"
                                  defaultValue={mail.name}
                                  placeholder={mail.name}
                                  className="form-control"
                                  onChange={handleEditMailChange}
                                />
                                <label htmlFor="recipientType" className="form-label form-label-required">Recipient type:</label>
                                <select
                                  id="recipientType"
                                  className="form-control"
                                  defaultValue={mail.recipientType}
                                  onChange={handleEditMailChange}
                                >
                                  <option value="cc">CC</option>
                                  <option value="to">To</option>
                                  <option value="bcc">BCC</option>
                                </select>
                              </div>
                            </Modal>

                            <TrashIcon
                              className="btn-icon btn-icon-error"
                              title="Delete"
                              onClick={() => openModal(`remove-${mail._id}`)}
                            />
                            <Modal id={`remove-${mail._id}`} header="Delete mail" footer={
                            <>
                            <button className="btn btn-secondary block" onClick={() => closeModal(`remove-${mail._id}`)}>
                              Cancel
                            </button>
                            <button className="btn btn-error block" onClick={() => handleRemoveMail(mail)} disabled={!mail}
                            >Delete</button>
                            </>
                            }>
                              <p>
                                Are you sure you want to delete <strong>{mail.name}</strong>?
                              </p>
                              <p>This action cannot be undone.</p>
                            </Modal>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

        )}
    </div>
  );
}

export default MailRecipients;
