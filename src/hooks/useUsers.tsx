import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../types";

type UseUsersReturnType = {
  users: User[] | [],
  activeUsers: User[] | [],
  addUser: (user: { name: string }) => void,
  deleteUser: (id: string) => void,
  updateUser: (user: User, name: string, email?: string, active?: boolean, APIKey?: string) => void
};

function useUsers(update?: boolean): UseUsersReturnType {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [trigger, updateList] = useState<boolean>(update ?? false);

  useEffect(() => {
    axios
      .get<User[]>(process.env.REACT_APP_API_URL + "users")
      .then((response) => response.data)
      .then((data) => {
        setUsers(data);
        setActiveUsers(data.filter((user) => user.active));
      });
  }, [trigger]);

  const addUser = (tester: { name: string }) => {
    axios
      .post<User>(process.env.REACT_APP_API_URL + "users/", {
        name: tester.name,
      })
      .then((response) => response.data)
      .then((data) => {
        setUsers([...users, data]);
        updateList(update || ((state) => !state));
      });
  };

  const deleteUser = (id: string) => {
    axios
      .delete<User>(process.env.REACT_APP_API_URL + "users/" + id)
      .then((response) => response.data)
      .then(() => {
        setUsers(users.filter((user) => user._id !== id));
        updateList(update || ((state) => !state));
      });
  };

  const updateUser = (user: User, name: string, email?: string, active?: boolean, APIKey?: string) => {
    axios
      .put(process.env.REACT_APP_API_URL + "users/", { id: user._id, name: name, email: email, active: active, APIKey: APIKey })
      .then((response) => response.data)
      .then(() => {
        updateList(update || ((state) => !state));
      });
  };




  return { users, activeUsers, addUser, deleteUser, updateUser };
}

export default useUsers;
