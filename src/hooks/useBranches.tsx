import { useEffect, useState } from "react";
import axios from "axios";
import { Branch } from "../types";


type UseBranchesReturnType = {
  branches: Branch[] | [];
  activeBranches: Branch[] | [];
  addBranch: (branch: { name: string }) => void;
  deleteBranch: (id: string) => void;
  updateBranch: (id: string, name: string, locked?: boolean, active?: boolean) => void;
};

function useBranches(update?: boolean): UseBranchesReturnType {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranches, setActiveBranches] = useState<Branch[]>([]);
  const [trigger, updateList] = useState<boolean>(update ?? false);

  useEffect(() => {
    axios
      .get<Branch[]>(process.env.REACT_APP_API_URL + "branches")
      .then((response) => response.data)
      .then((data) => {
        setBranches(data);
        setActiveBranches(data.filter((branch) => branch.active));
      });
  }, [trigger]);

  // add new branch
  const addBranch = (branch: { name: string }) => {
    axios
      .post<Branch>(process.env.REACT_APP_API_URL + "branches/", {
        name: branch.name,
      })
      .then((response) => response.data)
      .then((data) => {
        setBranches([...branches, data]);
        updateList(update || ((state) => !state));
      });
  };

  const deleteBranch = (id: string) => {
    axios
      .delete<Branch>(process.env.REACT_APP_API_URL + "branches/" + id)
      .then((response) => response.data)
      .then((data) => {
        updateList(update || ((state) => !state));
      });
  };

  const updateBranch = (id: string, name: string, active?: boolean) => {
    axios
      .put<Branch>(process.env.REACT_APP_API_URL + "branches/", { id, name: name, active: active })
      .then((response) => response.data)
      .then((data) => {
        updateList(update || ((state) => !state));
      });
  };



  return { branches, activeBranches, addBranch, deleteBranch, updateBranch };
}

export default useBranches;
