export type Workflow = {
  _id: string;
  workflowName: string;
  workflowDescription: string;
  machine?: string;
  session?: number;
  trolley?: string;
  content?: string;
  status?: string;
  ipAddress?: string;
  tempId?: string;
};

export type File = {
  _id: string;
  name: string;
  size: number;
  contentType: string;
  file: {
    type: string;
    data: number[];
  };
  createdAt: any;
};

export type Attachments = File[] | [] | null | undefined;

export type Workflows = Workflow[] | [] | null | undefined;

export type Test = {
  _id: string;
  testId: string;
  name: string;
  requestor?: string;
  product: string;
  branch: string;
  files?: string[];
  release: string;
  workflows: Workflows;
  machine?: string;
  assignedTo?: string;
  instructions?: string;
  notes?: string;
  status?: "Pending" | "Success" | "Fail" | "Skipped" | "HW Error" | "Warning" | "Running";
  deleted?: boolean;
  deletedAt?: Date | null;
  priority: "Low" | "Medium" | "High";
  createdAt: Date;
  scheduledTo: Date;
  completedAt?: Date | null;
};

export type Tests = Test[] | [] | null;

export type Template = {
  _id: string;
  name: string;
  product: string;
  workflows: Workflows;
};

export type Product = {
  _id: string;
  name: string;
  active?: boolean;
  locked?: boolean;
  updateHistory?: UpdateHistoryItem[];
};

export type User = {
  _id: string;
  name: string;
  email?: string;
  APIKey: string;
  active?: boolean;
};

export type UpdateHistoryItem = {
  date: string;
  data: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
  _id: string;
};

export type Branch = {
  _id: string;
  name: string;
  active?: boolean;
  locked?: boolean;
  updateHistory?: UpdateHistoryItem[];
};

export type Mail = {
  _id: string;
  name: string;
  recipientType: string | "to" | "cc" | "bcc";
  createdAt: string;
  updatedAt: string;
  updateHistory?: UpdateHistoryItem[];
};
