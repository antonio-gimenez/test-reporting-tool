import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import FilterForm, { Filters } from "../components/FilterForm";
import { useModal } from "../components/Modal";
import Pagination from "../components/Pagination";
import StackedProgress from "../components/Progress";
import { COLORS } from "../constants/colors";
import { formatDate } from "../utils/utils";
import useCompletedTests from "../hooks/useCompletedTests";
import { Test } from "../types";
import useSearch from "../hooks/useSearch";

const ITEMS_PER_PAGE = 50;

const CompletedTests = (): JSX.Element => {
  const { completedTests, currentPage, setCurrentPage, totalTests, loading } = useCompletedTests({
    limit: ITEMS_PER_PAGE,
  });

  const [filteredData, setFilteredData] = useState<Test[]>([]);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filterCount, setFilterCount] = useState<number>(0);
  const [filters, setFilters] = useState<Filters>([]);
  const [isLoading, setIsLoading] = useState<boolean>(loading || false);
  const { openModal } = useModal();

  const { searchResults, handleSearch, isSearching, resetSearch } = useSearch(
    filteredData?.length > 0 ? filteredData : completedTests,
    1 // Set the depth to 1 for search into workflows
  );




  useEffect(() => {
    if (isSearching) {
      setFilteredData(searchResults);
    } else {
      setFilteredData(completedTests);
    }

    setIsLoading(loading); // Update isLoading based on the loading status
  }, [searchResults?.length, completedTests, loading]);

  const Loading = (): JSX.Element => {
    return <h4 className="header-4 loading">Loading...</h4>;
  };

  const removeFilters = () => {
    setFilteredData(completedTests);
    setIsFiltering(false);
    setFilterCount(0);
  };


  const handlePageChange = (page: number) => {
    if (!page) return;
    setCurrentPage(page);
  };

  const onSubmit = (filters: Filters) => {
    if (!filters) return;

    setIsLoading(true);
    const url = process.env.REACT_APP_API_URL + "tests/advanced-filters/";

    axios
      .get(url, {
        params: {
          filters: filters,
        },
      })
      .then((res) => {
        setFilteredData(res.data);
        setFilters(filters);
        setIsFiltering(true);
        setFilterCount(Object.keys(filters).length); // Count the number of filter keys
      })
      .catch((error) => {
        console.error("Error occurred during API request:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const conditions = [
    { label: "equals", value: "equals" },
    { label: "contains", value: "contains" },
    { label: "starts with", value: "startsWith" },
    { label: "ends with", value: "endsWith" },
    { label: "does not contain", value: "doesNotContain" },
  ];

  const columns = [
    { label: "Name", value: "name" },
    { label: "Product", value: "product" },
    { label: "Branch", value: "branch" },
    { label: "Release", value: "release" },
    { label: "Status", value: "status" },
    { label: "Assigned To", value: "assignedTo" },
    { label: "Machine", value: "machine" },
  ];


  return (
    <>
      <>
        <FilterForm columns={columns} onSubmit={onSubmit} conditions={conditions} />
        <h2 className="header-2">Completed Tests</h2>
        <div className="container-items-center gap-medium margin-block-medium">
          <input
            className="form-control form-input"
            placeholder="Quick search"
            disabled={completedTests.length < 1 || isLoading}
            id="search"
            onChange={handleSearch}
          />
          <button
            className="btn btn-secondary"
            onClick={() => openModal("filters")}
            disabled={(isSearching as boolean) || isLoading}
          >
            Advanced Search
          </button>
        </div>
        {!isSearching && !isFiltering && (
          <Pagination
            disabled={isLoading}
            currentPage={currentPage}
            totalItems={totalTests}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        )}
        <div className="container-items-center gap-medium">
          {isFiltering && (
            <button className="btn btn-secondary" onClick={removeFilters}>
              Remove {filterCount} filter{filterCount > 1 ? "s" : ""}
            </button>
          )}
          {/* {isSearching && (
                            <button className="btn btn-primary" onClick={clearSearch}>
                                Reset Search
                            </button>
                        )} */}
        </div>
        {isLoading ? (
          <Loading />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Product</th>
                  <th className="table-header-cell">Branch</th>
                  <th className="table-header-cell">Release</th>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Machine</th>
                  <th className="table-header-cell">Progress</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Assigned To</th>
                  <th className="table-header-cell">Files</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredData?.map((test) => (
                  <tr className="table-row" key={test.testId}>
                    <td className="table-cell" title={formatDate(test.scheduledTo)}>{formatDate(test.scheduledTo)}</td>
                    <td className="table-cell" title={test.product}>{test.product}</td>
                    <td className="table-cell" title={test.branch}>{test.branch}</td>
                    <td className="table-cell" title={test.release} >{test.release}</td>
                    <td className="table-cell" title={test.name}>
                      <NavLink className={"link"} to={`/tests/${test.testId}`}>
                        {test.name}
                      </NavLink>
                    </td>
                    <td className="table-cell" title={test.machine}>{test.machine}</td>
                    <td className="table-cell">
                      <StackedProgress workflows={test.workflows} />
                    </td>
                    <td className="table-cell" title={test.status}>
                      <span className={`badge badge-${COLORS[test?.status || ""]}`}>{test.status}</span>
                    </td>
                    <td className="table-cell" title={test.assignedTo}>{test.assignedTo}</td>
                    <td className="table-cell" title={(test?.files?.length || 'None') as string}>{test?.files?.length || null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    </>
  );
};

export default CompletedTests;
