import React, { useState, useEffect } from "react";
import { formatDate } from "../utils/utils";

interface LatestReleaseValidationData {
  date: string | null;
  day: string | null;
  completedAt: string;
  // Add any other fields from the response object
}

function useLatestReleaseValidation(days: number = 7): {
  data: LatestReleaseValidationData[];
  loading: boolean;
} {
  const apiUrl = process.env.REACT_APP_API_URL + "tests/validated-releases/";
  const [data, setData] = useState<LatestReleaseValidationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl + days)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching data");
        }
        return response.json();
      })
      .then((response: LatestReleaseValidationData[]) => {
        // add a new field to the response object
        response.forEach((item) => {
          item.date = item.completedAt ? formatDate(item.completedAt) : null;
          item.day = item.completedAt ? formatDate(item.completedAt, false, false) : null;
        });
        setData(response);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [apiUrl, days]);

  return { data, loading };
}

export default useLatestReleaseValidation;
