import { useState, useEffect } from "react";
import { Test } from "../types";
import axios from "axios";

interface UseTestByDate {
  date: Date | string;
}

interface UseTestByDateReturn {
  fetchTest: () => Promise<void>;
  tests: Test[];
  loading: boolean;
  empty: boolean;
  error: string | null;
}

const useTestByDate = ({ date = new Date()}: UseTestByDate): UseTestByDateReturn => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState<boolean>(false);
  const [update, setUpdate] = useState<boolean>(false);

  const fetchTest = async () => {
    setUpdate(!update);
  };

  useEffect(() => {
    if (date) {
      try {
        const url = process.env.REACT_APP_API_URL + `tests/date/${date}`;
        axios
          .get(url)
          .then((response) => response.data)
          .then((data) => {
            setTests(data);
            setLoading(false);
            setEmpty(data.length === 0);
          });
      } catch (error: any) {
        setError(error?.message);
        setLoading(false);
      }
    } else {
      setError("No test ID provided");
      return setLoading(false);
    }
  }, [date, update]);

  return { fetchTest, tests, loading, empty, error };
};

export default useTestByDate;
