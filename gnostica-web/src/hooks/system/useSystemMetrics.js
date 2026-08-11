import { useState, useEffect } from "react";
import { systemService } from "@/services/system/systemService";

const MAX_DATA_POINTS = 24;

const initialData = Array.from({ length: MAX_DATA_POINTS }).map(() => ({
  time: "",
  cpu: 0,
  ram: 0,
}));

export const useSystemMetrics = () => {
  const [metricsData, setMetricsData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
      try {
        const response = await systemService.getSystemMetrics();
        console.log("System Metrics Response:", response);
        if (response?.data && isMounted) {
          const newMetric = {
            time: response.data.timestamp,
            cpu: response.data.cpuUsage,
            ram: Math.round((response.data.usedRam / response.data.totalRam) * 100),
          };
          console.log("New Metric:", newMetric);

          setMetricsData((prevData) => {
            const newData = [...prevData, newMetric];
            if (newData.length > MAX_DATA_POINTS) {
              newData.shift(); // Remove oldest to keep window size
            }
            return newData;
          });
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch system metrics", err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Fetch immediately on mount
    fetchMetrics();

    // Set interval for every 5 seconds
    const intervalId = setInterval(fetchMetrics, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { metricsData, isLoading, error };
};
