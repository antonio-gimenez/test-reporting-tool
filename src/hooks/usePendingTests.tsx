import { useEffect, useState } from "react";
import axios from "axios";
import { Test } from "../types";

interface UseCompletedTestsOptions {
  sort?: string;
}

const usePendingTests = ({ sort = "createdAt" }: UseCompletedTestsOptions) => {
  const [pendingTests, setPendingTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState(null);
  const [empty, setEmpty] = useState<boolean>(false);
  const [update, setUpdate] = useState<boolean>(false);

  const fetchPendingTests = async () => {
    setUpdate(!update);
  };

  useEffect(() => {
    try {
      const url = process.env.REACT_APP_API_URL + "tests/status/pending";
      axios
        .get(url)
        .then((response) => response.data)
        .then((data) => {
          setPendingTests(data);
          setLoading(false);
          setEmpty(data.length === 0);
        });
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  }, [sort, update]);


  return {
    fetchPendingTests,
    pendingTests,
    loading,
    error,
    empty,
  };
};

export default usePendingTests;
