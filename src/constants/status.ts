

export const STATUS = Object.freeze([
  { value: "Pending", label: "Pending" },
  { value: "Success", label: "Success" },
  { value: "Warning", label: "Warning" },
  { value: "Fail", label: "Fail" },
  { value: "HW Error",label: "HW Error" },
  { value: "Skipped", label: "Skipped" },
])

export const TEST_STATUS = Object.freeze([...STATUS, { value: "Running", label: "Running" }]);
