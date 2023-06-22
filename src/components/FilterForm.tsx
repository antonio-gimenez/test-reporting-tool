import React, { useState } from "react";
import Modal, { useModal } from "./Modal";
import { ReactComponent as TrashIcon } from "../assets/icons/trash-16.svg";
import { ReactComponent as PlusIcon } from "../assets/icons/plus-16.svg";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterCondition {
  label: string;
  value: string;
}

interface Filter {
  column: string;
  condition: string;
  criteria: string;
}

export type Filters = Filter[];

interface FilterFormProps {
  columns: FilterOption[];
  conditions: FilterCondition[];
  onSubmit: (filters: Filter[]) => void;
}

const FilterForm: React.FC<FilterFormProps> = ({ columns, conditions, onSubmit }) => {
  const [filters, setFilters] = useState<Filter[]>([{ column: "", condition: "", criteria: "" }]);
  const { closeModal } = useModal();
  const handleChange = (index: number, field: string, value: string) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = {
      ...updatedFilters[index],
      [field]: value,
    };
    setFilters(updatedFilters);
  };

  const handleAddFilter = () => {
    setFilters([...filters, { column: "", condition: "", criteria: "" }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(filters);
    closeModal('filters')
  };

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);
  };

  return (
    <Modal id="filters" header="Filters">
      <form onSubmit={handleSubmit} className="flex flex-col gap-medium margin-block-medium">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={handleAddFilter}
          disabled={filters.some((filter) => !filter.column || !filter.condition || !filter.criteria)}
        >
          <PlusIcon title="Add filter" /> Filter
        </button>
        {filters.map((filter, index) => (
          <div key={index} className="flex flex-row-center gap-large">
            <select
              className="form-control form-select"
              value={filter.column}
              onChange={(e) => handleChange(index, "column", e.target.value)}
            >
              <option value="">Select a property</option>
              {columns.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="form-control form-select"
              value={filter.condition}
              onChange={(e) => handleChange(index, "condition", e.target.value)}
            >
              <option value="">Select a condition</option>
              {conditions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              className="form-control form-input"
              type="text"
              value={filter.criteria}
              onChange={(e) => handleChange(index, "criteria", e.target.value)}
              placeholder="Criteria"
            />
            {index !== 0 && (
              <button className="btn-link hover-error" onClick={() => handleRemoveFilter(index)}>
                <TrashIcon title="Remove filter" />
              </button>
            )}
          </div>
        ))}

        <button
          className="btn btn-primary"
          disabled={filters.some((filter) => !filter.column || !filter.condition || !filter.criteria)}
          type="submit"
        >
          Apply Filter
        </button>
      </form>
    </Modal>
  );
};

export default FilterForm;
