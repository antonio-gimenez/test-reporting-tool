import React from "react";
import { ReactComponent as RestoreIcon } from "../../assets/icons/undo-16.svg";
import { ReactComponent as TrashIcon } from "../../assets/icons/trash-16.svg";
import Modal, { useModal } from "../../components/Modal";
import Pagination from "../../components/Pagination";
import useArchivedTests from "../../hooks/useArchivedTests";
import { formatDate } from "../../utils/utils";

const ITEMS_PER_PAGE = 20;

function ArchivedTests(): JSX.Element {
  const { archivedTests, currentPage, setCurrentPage, totalTests, restoreTest, deleteTest, loading } = useArchivedTests(
    { limit: ITEMS_PER_PAGE }
  );

  const { openModal, closeModal } = useModal();

  const handleDeleteTest = (id: string) => {
    if (!id) return null;
    try {
      deleteTest(id);
    } catch (error) {
      return;
    } finally {
      closeModal(`delete-test-${id}`);
    }
  };

  const handleRestoreTest = (id: string) => {
    if (!id) return null;
    try {
      restoreTest(id);
    } catch (error) {
      return;
    } finally {
      closeModal(`restore-test-${id}`);
    }
  };

  const handlePageChange = (page: number) => {
    if (!page) return;
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="section">
        <h2 className="section-name">Archived Tests</h2>
      </div>
      <div className="overview">
        <p>Here you can find all the tests that have been archived and restore them.</p>
      </div>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {archivedTests?.length > 0 && (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th>Test Name</th>
                      <th>Test Product</th>
                      <th>Assigned to</th>
                      <th>Deleted at</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {archivedTests?.map((test: any) => (
                      <tr className="table-row" key={test._id}>
                        <td className="table-cell" title={test.name}>{test.name}</td>
                        <td className="table-cell" title={test.product}>{test.product}</td>
                        <td className="table-cell" title={test.assignedTo}>{test.assignedTo}</td>
                        <td className="table-cell" title={formatDate(test.deletedAt)}>{formatDate(test.deletedAt)}</td>
                        <td className="list-item-actions">
                          <RestoreIcon
                            title="Restore"
                            className="btn-link"
                            onClick={() => openModal(`restore-test-${test._id}`)}
                          />
                          <Modal
                            id={`restore-test-${test._id}`}
                            header="Restore test"
                            footer={
                              <>
                                <button
                                  className="btn btn-secondary block"
                                  onClick={() => closeModal(`restore-test-${test._id}`)}
                                >
                                  
                                  Cancel
                                </button>
                                <button className="btn btn-primary block" onClick={() => handleRestoreTest(test._id)}>
                                  
                                  Restore
                                </button>
                              </>
                            }
                          >
                            <p>The test will be restored with the same data as it was when it was archived.</p>
                            <p>
                              Test name: <strong>{test.name}</strong>
                            </p>
                            <p>
                              Deleted date: <strong>{formatDate(test.deletedAt)}</strong>
                            </p>
                          </Modal>
                          <TrashIcon
                            title="Delete test"
                            className="btn-link hover-error"
                            onClick={() => openModal(`delete-test-${test._id}`)}
                          />
                          <Modal
                            id={`delete-test-${test._id}`}
                            header="Delete test"
                            footer={
                              <>
                                <button
                                  className="btn btn-secondary block"
                                  onClick={() => closeModal(`delete-test-${test._id}`)}
                                >
                                  Cancel
                                </button>
                                <button className="btn btn-error block" onClick={() => handleDeleteTest(test._id)}>
                                  Delete
                                </button>
                              </>
                            }
                          >
                            <p>This action cannot be undone.</p>
                            <p>
                              Test name: <strong>{test.name}</strong>
                            </p>
                            <p>
                              Deleted date: <strong>{formatDate(test.deletedAt)}</strong>
                            </p>
                          </Modal>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={totalTests}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ArchivedTests;
