import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Collapse from "../components/Collapse";
import { COLORS } from "../constants/colors";
import useLatestReleaseValidation from "../hooks/useLatestReleaseValidation";
import useSearch from "../hooks/useSearch";
import { groupBy } from "../utils/groupBy";
import { formatDate } from "../utils/utils";
const dayOptions = [
  { value: 1, label: "1 day" },
  { value: 7, label: "1 week" },
  { value: 30, label: "1 month" },
  { value: 90, label: "3 months" },
  { value: 180, label: "6 months" },
  { value: 365, label: "1 year" },
];

const groupOptions = [
  { value: "product", label: "Product" },
  { value: "release", label: "Release" },
  { value: "branch", label: "Branch" },
  { value: "status", label: "Status" },
  { value: "day", label: "Date" },
];

interface Item {
  _id: string;
  completedAt: string;
  name: string;
  release: string;
  product: string;
  branch: string;
  status: string;
  testId: string;
}

function Validation() {
  const [days, setDays] = useState(7);
  const [group, setGroup] = useState("");
  const { data, loading } = useLatestReleaseValidation(days);
  const { searchTerm, searchResults, handleSearch, isSearching } = useSearch(data);
  const [filteredData, setFilteredData] = useState(searchResults?.length > 0 ? searchResults : data);
  const [groupedData, setGroupedData] = useState([] as any[]);

  useEffect(() => {
    let filtered = isSearching ? searchResults : data ?? null;
    let grouped = null;
    if (filtered) {
      if (group) {
        if (group === "completedAt") {
          // only group by day and month
          filtered = filtered.map((item: any) => {
            const date = new Date(item[group]);
            return {
              ...item,
              [group]: formatDate(date),
            };
          });
        }
        grouped = groupBy(filtered, group);
      }
      setFilteredData(filtered);
    }
    if (grouped) {
      setGroupedData(grouped);
    }
  }, [searchResults, group, isSearching, filteredData?.length, data?.length]);

  // get current date as format: Month: full Day: 2-digit, Year: numeric
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  // get date of 7 days ago as format: Month: full Day: 2-digit, Year: numeric
  const daysAgo = new Date(new Date().setDate(new Date().getDate() - days)).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div className="container-responsive pt-4">

      <div className="section">
        <h3 className="section-name">
          {daysAgo} - {currentDate}
        </h3>
        <div className="gap-medium flex-row-center">
          <input
            className="form-control form-input"
            placeholder="Filter..."
            disabled={data.length < 1}
            id="search"
            defaultValue={searchTerm ?? ""}
            autoComplete="off"
            onChange={handleSearch}
          />
          <select
            id="select-days"
            className="form-control form-select "
            value={days}
            placeholder="days"
            onChange={(e) => setDays(e.target.value as any)}
          >
            {dayOptions.map((item) => {
              return (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              );
            })}
          </select>
          <select
            id="group-by"
            className="form-control form-select "
            value={group ?? ""}
            disabled={filteredData?.length < 1}
            placeholder="groupBy"
            onChange={(e) => setGroup(e.target.value as any)}
          >
            <option value="">Group by</option>
            {groupOptions.map((item) => {
              return (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              );
            })}
          </select>
          {!!group && (
            <button className="btn btn-secondary " onClick={() => setGroup("")}>
              Ungroup
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="content-muted">
          Here you will find a section that showcases the test results within a specific time frame. It highlights successful tests or tests with non-critical warnings that do not affect the core functionality of the firmware. This section offers an overview of the recent validation status, allowing users to evaluate the overall performance and reliability of the latest firmware release.
        </p>
      </div>
      <div className="divider-block margin-block-large" />

      {loading ? (
        <h4 className="header-4 loading">Loading...</h4>
      ) : group ? (
        <>
          {Object.entries(groupedData).map(([group, data]: [string, any[]]) => (
            <Collapse key={group} title={group}>
              <div className="table-wrapper">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th>Date</th>
                      <th>Release Version</th>
                      <th>Test Name</th>
                      <th>Product</th>
                      <th>Branch</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item: any) => (
                      <tr key={item._id} id={item._id} className="table-row">
                        <td className="table-cell" title={item.completedAt}>
                          {formatDate(item.completedAt)}
                        </td>
                        <td className="table-cell" title={item.release}>
                          {item.release}
                        </td>
                        <td className="table-cell" title={item.name}>
                          <NavLink className={"link"} to={`/tests/${item.testId}`}>
                            {item.name}
                          </NavLink>
                        </td>
                        <td className="table-cell" title={item.product}>
                          {item.product}
                        </td>
                        <td className="table-cell" title={item.branch}>
                          {item.branch}
                        </td>
                        <td className="table-cell" title={item.status}>
                          <span className={`badge badge-${COLORS[item.status]}`}>{item.status}</span>
                        </td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Collapse>
          ))}
        </>
      ) : filteredData && filteredData.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Date</th>
                  <th>Release Version</th>
                  <th>Test Name</th>
                  <th>Product</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredData.map((item: Item) => {
                  return (
                    <tr key={item._id} className="table-row">
                      <td className="table-cell" title={item.completedAt}>
                        {formatDate(item.completedAt)}
                      </td>
                      <td className="table-cell" title={item.release}>
                        {item.release}
                      </td>
                      <td className="table-cell" title={item.name}>
                        <NavLink className={"link"} to={`/tests/${item.testId}`}>
                          {item.name}
                        </NavLink>
                      </td>
                      <td className="table-cell" title={item.product}>
                        {item.product}
                      </td>
                      <td className="table-cell" title={item.branch}>
                        {item.branch}
                      </td>
                      <td className="table-cell" title={item.status}>
                        <span className={`badge badge-${COLORS[item.status]}`}>{item.status}</span>
                      </td>
                     
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex justify-center">
          <h4 className="header-4">No data available</h4>
        </div>
      )}
    </div>
  );
}

export default Validation;
