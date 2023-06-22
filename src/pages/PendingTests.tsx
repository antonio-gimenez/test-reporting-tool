import axios from "axios";
import React, { useContext, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ReactComponent as TrashIcon } from "../assets/icons/trash-16.svg";
import GenerateReport from "../components/GenerateReport";
import StackedProgress from "../components/Progress";
import { COLORS } from "../constants/colors";
import { ModalContext } from "../contexts/ModalContext";
import usePendingTests from "../hooks/usePendingTests";
import { Test } from "../types";
import { formatDate } from "../utils/utils";

const PendingTests: React.FC = () => {
  const { pendingTests, fetchPendingTests, empty, loading } = usePendingTests({
    sort: "createdAt",
  });
  const { openModal } = useContext(ModalContext);

  const archiveTest = (item: Test) => {
    const id = item._id;
    if (!id) return;
    const url = `tests/archive/${id}`;
    axios
      .put(process.env.REACT_APP_API_URL + url)
      .then((response) => {
        fetchPendingTests();
      })
      .catch((error: any) => {
        console.log();
      });
  };

  // fetch pending tests every 1 minute

  const minutes = 1;
  const delta = minutes * 60 * 1000;

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingTests();
    }, delta);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <button onClick={() => openModal("generate-report")} className="btn btn-primary ">
        Generate report
      </button>
      <GenerateReport />
      <h2 className="header-2">Pending Tests</h2>
      {loading ? (
        <h4 className="header-4 loading">Loading...</h4>
      ) : !empty ? (
        <div className="table-wrapper">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Product</th>
                <th className="table-header-cell hide-on-mobile">Branch</th>
                <th className="table-header-cell">Release</th>
                <th className="table-header-cell">Name</th>
                {pendingTests.some((test: Test) => test.requestor) && (
                  <th className="table-header-cell hide-on-mobile">Requestor</th>
                )}
                <th className="table-header-cell hide-on-mobile">Machine</th>
                <th className="table-header-cell hide-on-mobile">Priority</th>
                <th className="table-header-cell hide-on-mobile">Progress</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Assigned To</th>
                <th className="table-header-cell">Files</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {pendingTests?.map((test: Test) => (
                <tr className="table-row" key={test._id}>
                  <td title={formatDate(test.scheduledTo)} className="table-cell">
                    {formatDate(test.scheduledTo)}
                  </td>
                  <td title={test.product} className="table-cell">
                    {test.product}
                  </td>
                  <td title={test.branch} className="table-cell hide-on-mobile">
                    {test.branch}
                  </td>
                  <td title={test.release} className="table-cell">
                    {test.release}
                  </td>
                  <td className="table-cell" title={test.name}>
                    <NavLink className={"link"} to={`/tests/${test.testId}`}>
                      {test.name}
                    </NavLink>
                  </td>
                  {pendingTests.some((test: Test) => test.requestor) && (
                    <td className="table-cell hide-on-mobile" title={test.requestor}>
                      {test.requestor}
                    </td>
                  )}
                  <td className="table-cell hide-on-mobile" title={test.machine}>
                    {test.machine}
                  </td>
                  <td className="table-cell hide-on-mobile" title={test.priority}>
                    {test.priority}
                  </td>
                  <td className="table-cell hide-on-mobile">
                    <StackedProgress workflows={test.workflows as Test["workflows"]} />
                  </td>
                  <td className="table-cell" title={test.status}>
                    <span className={`badge badge-${COLORS[test.status as keyof typeof COLORS] ?? "secondary"}`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="table-cell" title={test.assignedTo}>
                    {test.assignedTo}
                  </td>
                  <td className="table-cell" title={(test?.files?.length || "None") as string}>
                    {test?.files?.length || null}
                  </td>
                  <td className="table-cell">
                    <button onClick={() => archiveTest(test)} className="btn-link hover-error">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="workflow">
          <h4 className="header-4 padding-block-medium">No pending tests
          </h4>
          <p className="flex-row-center-gap">
            Auto refresh every
            <span className="semibold text-primary">
              {minutes} minute{minutes > 1 ? "s" : ""}
            </span>
          </p>
          <p>

          </p>
        </div>
      )}
    </>
  );
};

export default PendingTests;
