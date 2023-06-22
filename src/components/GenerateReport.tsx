import React, { useEffect, useState } from "react";
import { COLORS } from "../constants/colors";
import useGenerateReport from "../hooks/useGenerateReport";
import { Test } from "../types";
import { formatDate } from "../utils/utils";
import DaySelector from "./DaySelector";
import Modal, { useModal } from "./Modal";
import useTestByDate from "../hooks/useTestByDate";

function GenerateReport() {
  const { closeModal } = useModal();
  const [selectedItems, setSelectedItems] = useState<Test[]>([]);
  const [selectedItemsIds, setSelectedItemsIds] = useState<string[]>([]);
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const { tests } = useTestByDate({ date: currentDate.toISOString() });
  const [isGenerating, generateReportAndAlert] = useGenerateReport({
    items: selectedItems,
  });

  const handleCheckbox = (item: Test) => {
    if (selectedItems.includes(item)) {
      setSelectedItems((prevItems) => prevItems.filter((prevItem) => prevItem._id !== item._id));
      setSelectedItemsIds((prevItems) => prevItems.filter((prevItem) => prevItem !== item._id));
    } else {
      setSelectedItems((prevItems) => [...prevItems, item]);
      setSelectedItemsIds((prevItems) => [...prevItems, item._id]);
    }
  };

  const showOrderNumber = (itemId: Test["_id"]) => {
    const index = selectedItems.findIndex((item) => item._id === itemId);
    return index + 1;
  };

  const handleIndeterminateCheckboxChange = () => {
    if (selectedItems.length === tests.length) {
      setSelectedItems([]);
      setSelectedItemsIds([]);
    } else {
      setSelectedItems([...tests]);
      setSelectedItemsIds([...tests.map((item) => item._id)]);
    }
  };

  useEffect(() => {
    const multipleCheckbox = document.getElementById("indeterminate-checkbox") as HTMLInputElement;
    if (multipleCheckbox) {
      multipleCheckbox.checked = selectedItems.length > 0 && selectedItems.length === tests.length;
      multipleCheckbox.indeterminate = selectedItemsIds.length > 0;
    }
  }, [selectedItemsIds, selectedItems, tests]);

  const isSelected = (item: Test) => selectedItemsIds.includes(item._id) || false;

  const closeModalAndReset = () => {
    closeModal("generate-report");
    setSelectedItems([]);
    setSelectedItemsIds([]);
  };

  return (
    <Modal
      id="generate-report"
      closeOnOverlayClick={false}
      header="Generate Report"
      onClose={closeModalAndReset}
      footer={
        <>
          <button type="button" className="btn btn-secondary block" onClick={closeModalAndReset}>
            Cancel
          </button>
          <button
            className="btn btn-primary block"
            onClick={generateReportAndAlert as React.MouseEventHandler<HTMLButtonElement>}
            disabled={selectedItems.length === 0 || Boolean(isGenerating)}
          >
            {isGenerating ? (
              <>
                <span className="loading" />
                Generating report
              </>
            ) : (
              "Generate report"
            )}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center justify-center w-full h-full">
        <DaySelector currentDate={currentDate} setDate={setCurrentDate} />
        <div className="table-wrapper">
          <table id="report-table" className="table no-selectable">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">
                  <input
                    id="indeterminate-checkbox"
                    type="checkbox"
                    disabled={tests.length === 0}
                    onChange={handleIndeterminateCheckboxChange}
                  />
                </th>
                <th className="table-header-cell">Order</th>
                <th className="table-header-cell">Test</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Release</th>
                <th className="table-header-cell">Machine</th>
                <th className="table-header-cell">Product</th>
                <th className="table-header-cell">Assigned to</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Files</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {tests.map((item: Test) => {
                const isSelectedItem = isSelected(item);
                return (
                  <tr
                    key={item._id}
                    className={isSelectedItem ? "table-row-active clickable" : "table-row clickable"}
                    onClick={() => handleCheckbox(item)}
                  >
                    <td className="table-cell">
                      <input
                        id={`checkbox-${item._id}`}
                        key={`checkbox-${item._id}`}
                        type="checkbox"
                        checked={isSelectedItem}
                        onChange={() => handleCheckbox(item)}
                      />
                    </td>
                    <td className="table-cell">{isSelectedItem ? showOrderNumber(item._id) : ""}</td>
                    <td className="table-cell" title={item.name}>{item.name}</td>
                    <td className="table-cell" title={item.completedAt ? formatDate(item.completedAt) : formatDate(item.scheduledTo)}>
                      {item.completedAt ? formatDate(item.completedAt) : formatDate(item.scheduledTo)}
                    </td>
                    <td className="table-cell" title={item.release}>{item.release}</td>
                    <td className="table-cell" title={item.machine}>{item.machine}</td>
                    <td className="table-cell" title={item.product}>{item.product}</td>
                    <td className="table-cell" title={item.assignedTo}>{item.assignedTo}</td>
                    <td className="table-cell" title={item.status}>
                      <span className={`badge badge-${COLORS[item.status as keyof typeof COLORS]}`}>{item.status}</span>
                    </td>
                    <td className="table-cell" title={(item?.files?.length || 'None') as string}>{item?.files?.length || null}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

export default GenerateReport;
