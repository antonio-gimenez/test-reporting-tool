import axios from "axios";
import { useEffect, useState } from "react";

interface ArchivedTest {
  id: string;
  name: string;
  date: string;
  // Add any other properties that are returned by the API
}

interface UseArchivedTestsOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

interface UseArchivedTestsReturn {
  archivedTests: ArchivedTest[];
  loading: boolean;
  error: null | string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalTests: number;
  restoreTest: (id: string) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  emptyArchive: () => Promise<void>;
}

const useArchivedTests = ({ page = 1, limit = 20, sort = "date" }: UseArchivedTestsOptions): UseArchivedTestsReturn => {
  const [archivedTests, setArchivedTests] = useState<ArchivedTest[]>([]);
  const [update, setUpdate] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [totalTests, setTotalTests] = useState<number>(0);

  useEffect(() => {
    const fetchArchivedTests = async () => {
      try {
        const url = `${process.env.REACT_APP_API_URL}tests/status/archived`;
        const response = await axios.get(url, {
          params: {
            page: currentPage,
            limit,
          },
        });

        const { tests, totalTests } = response.data;
        setArchivedTests(tests);
        setTotalTests(totalTests);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchArchivedTests();
  }, [update, currentPage, limit]);

  const restoreTest = async (id: string) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}tests/archived/restore`, { id });
      setUpdate((prev) => !prev);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const deleteTest = async (id: string) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}tests/archived/${id}`);
      setUpdate((prev) => !prev);
    } catch (error:any) {
      setError(error.message);
    }
  };

  const emptyArchive = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}tests/archived/empty`);
      setUpdate((prev) => !prev);
    } catch (error:any) {
      setError(error.message);
    }
  };

  return {
    archivedTests,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalTests,
    restoreTest,
    deleteTest,
    emptyArchive,
  };
};

export default useArchivedTests;
