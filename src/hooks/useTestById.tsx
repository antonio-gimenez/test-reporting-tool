import { useState, useEffect } from "react";
import { Test } from "../types";
import axios from "axios";

interface UseTestByIdProps {
  testId: string | null| undefined;
}

interface UseTestByIdReturn {
  fetchTest: () => Promise<void>;
  test: Test | null;
  loading: boolean;
  empty: boolean;
  error: string | null;
}

const useTestById = ({ testId }: UseTestByIdProps): UseTestByIdReturn => {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState<boolean>(false);
  const [update, setUpdate] = useState<boolean>(false);

  const fetchTest = async () => {
    setUpdate(!update);
  };

  useEffect(() => {
    if (testId) {
      setLoading(true);
      try {
        const url = process.env.REACT_APP_API_URL + `tests/${testId}`;
        axios
          .get(url)
          .then((response) => response.data)
          .then((data) => {
            setLoading(false);
            setTest(data);
            setEmpty(data.length === 0);
          });
      } catch (error: any) {
        setLoading(false);
        setEmpty(true);
        setError(error?.message ?? "An error occurred");
      }
    } else {
      setError("No test ID provided");
      return setLoading(false);
    }
  }, [testId, update]);

  return { fetchTest, test, loading, empty, error };
};

export default useTestById;
