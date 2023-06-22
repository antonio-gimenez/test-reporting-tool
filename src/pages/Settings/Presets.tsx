import React, { useEffect, useState } from "react";
import { ReactComponent as DuplicateIcon } from "../../assets/icons/duplicate-16.svg";
import { ReactComponent as PencilIcon } from "../../assets/icons/pencil-16.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash-16.svg";
import Collapse from "../../components/Collapse";
import Modal, { useModal } from "../../components/Modal";
import usePresets, { Preset } from "../../hooks/usePresets";

function Presets(): JSX.Element {
  const { presets, addPreset, deletePreset, duplicatePreset, updatePreset } = usePresets();
  const [newPreset, setNewPreset] = useState<Preset | null>(null);
  const { openModal, closeModal } = useModal();

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, id } = event.target;
    if (!value) return setNewPreset({ ...newPreset!, [id]: null });
    setNewPreset({
      ...newPreset!,
      [id]: value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!newPreset) return null;
    try {
      addPreset(newPreset);
      setNewPreset(null);
      (document.getElementById("name") as HTMLInputElement).value = "";
    } catch (error) {
      return;
    } finally {
      closeModal("addPreset");
    }
  };

  const handleUpdateChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const { value, id } = event.target;
    if (!value) return setNewPreset({ ...newPreset!, [id]: null });
    setNewPreset({
      ...newPreset!,
      [id]: value,
    });
  };

  const handleUpdatePreset = (
    event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
    preset: Preset
  ) => {
    event.preventDefault();
    if (!preset) return null;
    if (!newPreset) return null;
    try {
      updatePreset(preset, newPreset!.name, newPreset!.content);
      closeModal(`edit-${preset._id}`);
    } catch (error) {
      return;
    } finally {
      setNewPreset(null);
    }
  };

  const handleRemovePreset = (preset: Preset) => {
    if (!preset) return null;
    try {
      deletePreset(preset._id);
    } catch (error) {
      return;
    } finally {
      closeModal(`remove-${preset._id}`);
    }
  };

  useEffect(() => {
    return () => {
      setNewPreset(null);
    };
  }, [closeModal]);

  return (
    <div>
      <div className="section">
        <h2 className="section-name">Comment presets</h2>
        <button className="btn btn-success" onClick={() => openModal("addPreset")}>
          Add Preset
        </button>
        <Modal id="addPreset" header="Create preset" footer={
          <>
            <button className="btn btn-secondary block" onClick={() => closeModal("addPreset")}>Cancel</button>
            <button className="btn btn-primary block" disabled={!newPreset?.name || !newPreset?.content} onClick={handleSubmit}>Create preset</button>
          </>
        }>
          <div className="min-container-small">
            <div className="form-group">
              <label htmlFor="name" className="form-label form-label-required">Preset Name</label>
              <input type="text" id="name" autoFocus={true} className="form-control" onChange={handleFormChange} />
              <label htmlFor="content" className="form-label form-label-required">Preset Content</label>
              <textarea
                rows={5}
                cols={5}
                spellCheck="false" id="content" className="form-control form-textbox" onChange={handleFormChange} />

            </div>
          </div>
        </Modal>
      </div>
      <div className="overview">
        <p>Comment Presets are a way to quickly insert a predefined message into the message box.</p>
        <p className="notecard">
          Click on the <PencilIcon /> icon to edit a preset, <TrashIcon /> to delete it, or <DuplicateIcon /> to
          duplicate it.
        </p>
      </div>

      <div className="box">
        <div className="box-content">
          {presets.length > 0 ? (
            <ul className="list">
              {presets.map((preset: Preset) => (
                <li className="list-item" key={preset._id}>
                  <Collapse title={preset.name}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: preset.content.replace(/\n/g, "<br/>"),
                      }}
                    />
                  </Collapse>

                  <div className="list-item-actions">
                    <DuplicateIcon
                      className="btn-link"
                      title="Duplicate preset"
                      onClick={() => openModal(`duplicate-${preset._id}`)}
                    />
                    <Modal id={`duplicate-${preset._id}`} header="Duplicate preset" footer={
                      <>
                        <button className="btn btn-secondary block" onClick={() => closeModal(`duplicate-${preset._id}`)}>Cancel</button>
                        <button className="btn btn-primary block" onClick={() => {

                          duplicatePreset(preset._id)
                          closeModal(`duplicate-${preset._id}`)
                        }}>Duplicate</button>
                      </>
                    }>
                      <p>
                        Are you sure you want to duplicate <strong>{preset.name}</strong>?
                      </p>
                      <p className="paragraph">
                        This will create a new preset with the same name and content, but with a different ID
                      </p>
                    </Modal>

                    <PencilIcon className="btn-link" title="Edit" onClick={() => openModal(`edit-${preset._id}`)} />
                    <Modal
                      id={`edit-${preset._id}`}
                      header="Update preset"
                      footer={
                        <>
                          <button className="btn btn-secondary block" onClick={() => closeModal(`edit-${preset._id}`)}>Cancel</button>
                          <button
                            className="btn btn-primary block"
                            disabled={!newPreset?.name && !newPreset?.content}
                            onClick={(event) => handleUpdatePreset(event, preset)}
                          >
                            Update
                          </button>
                        </>
                      }
                    >
                      <div className="min-container-small">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">
                            Preset name:
                          </label>
                          <input
                            type="text"
                            autoFocus={true}
                            id="name"
                            placeholder={preset.name}
                            defaultValue={preset.name}
                            className="form-control"
                            onChange={handleUpdateChange}
                          />

                          <label htmlFor="content" className="form-label">
                            Preset content:
                          </label>
                          <textarea
                            spellCheck="false"
                            id="content"
                            defaultValue={preset.content}
                            placeholder={preset.content}
                            className="form-control form-textarea"
                            onChange={handleUpdateChange}
                          />
                        </div>
                      </div>
                    </Modal>

                    <TrashIcon
                      className="btn-icon btn-icon-error"
                      title="Delete"
                      onClick={() => openModal(`remove-${preset._id}`)}
                    />
                    <Modal id={`remove-${preset._id}`} header="Delete preset" footer={
                      <>
                        <button className="btn btn-secondary block" onClick={() => closeModal(`remove-${preset._id}`)}>Cancel</button>
                        <button className="btn btn-error block" onClick={() => handleRemovePreset(preset)}>
                          Delete
                        </button>
                      </>
                    }>
                      <p>
                        Are you sure you want to delete <strong>{preset.name}</strong>?
                      </p>
                      <p>This action cannot be undone.</p>
                    </Modal>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="box-content-empty"> No presets found. Add one to get started.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Presets;
