import { useEffect, useState } from "react";
import axios from "axios";
import { Mail } from "../types";


type UseMailsReturnType = {
  mails: Mail[] | [];
  addMail: (mail: { name: string, recipientType?: string }) => void;
  deleteMail: (id: string) => void;
  updateMail: (mail: Mail, name: string, recipientType: string) => void;
  isLoading: boolean;
}

function useMails(update?: boolean): UseMailsReturnType {
  const [mails, setMails] = useState<Mail[]>([]);
  const [trigger, updateList] = useState<boolean>(update ?? false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    axios
      .get<Mail[]>(process.env.REACT_APP_API_URL + "mails/")
      .then((response) => response.data)
      .then((data) => {
        setMails(data);
        setIsLoading(false);
      });

    return () => {
      setIsLoading(false)
    }
  }, [trigger]);


  const addMail = (mail: { name: string, recipientType?: string }) => {
    if (!mail.recipientType) {
      mail.recipientType = 'cc';
    }
    axios
      .post<Mail>(process.env.REACT_APP_API_URL + "mails/", {
        name: mail.name,
        recipientType: mail.recipientType
      })
      .then((response) => response.data)
      .then(() => {
        updateList(update || ((state) => !state));
      });
  };



  const deleteMail = (id: string) => {
    axios
      .delete<Mail>(process.env.REACT_APP_API_URL + "mails/" + id)
      .then((response) => response.data)
      .then((data) => {
        updateList(update || ((state) => !state));
      });
  };

  const updateMail = (mail: Mail, name: string, recipientType: string) => {
    axios
      .put
      <Mail>
      (process.env.REACT_APP_API_URL + "mails/", { id: mail._id, name: name, recipientType: recipientType })
      .then((response) => response.data)
      .then((data) => {
        updateList(update || ((state) => !state));
      });
  };

  return { mails, addMail, deleteMail, updateMail, isLoading };
}

export default useMails;
