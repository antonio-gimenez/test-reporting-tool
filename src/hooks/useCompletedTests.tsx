import { useEffect, useState } from "react";
import axios from "axios";
import { Test } from "../types";

interface UseCompletedTestsOptions {
    page?: number;
    limit?: number;
}

const useCompletedTests = ({ page = 1, limit = 50 }: UseCompletedTestsOptions) => {
    const [completedTests, setCompletedTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(page);
    const [totalTests, setTotalTests] = useState(0);

    useEffect(() => {
        setLoading(true);
        const fetchCompletedTests = async () => {
            try {
                const url = process.env.REACT_APP_API_URL + "tests/status/completed";
                const response = await axios.get(url, {
                    params: {
                        page: currentPage,
                        limit,
                    },
                });

                const { tests, totalTests: responseTotalTests } = response.data;
                setCompletedTests(tests);
                setTotalTests(responseTotalTests);
            } catch (error: any) {
                setError(error.message);
            }
        };

        fetchCompletedTests();
        setLoading(false);
    }, [currentPage, limit]);



    return {
        completedTests,
        loading,
        error,
        currentPage,
        setCurrentPage,
        totalTests,
    };
};

export default useCompletedTests;
