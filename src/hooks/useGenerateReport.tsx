import { useState } from "react";
import { useAlert } from "../components/Alert";
import { Test } from "../types";
import { createEmail } from "../utils/mail";
import useMails from "./useMails";

interface GenerateReportProps {
    items: Test[]
}

const useGenerateReport = ({ items }: GenerateReportProps) => {
    const { mails } = useMails();
    const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
    const { addAlert } = useAlert();


    const generateReport = async () => {
        try {
            if (!items || !mails) {
                return addAlert({
                    message: "No items or mails selected",
                    position: "top-center",
                    dismissable: true,
                });
            }
            const message = createEmail(items, mails);
            return message;
        } catch (error: any) {
            throw new Error(`Error generating report: ${error.message}`);
        }
    };

    const generateReportAndAlert = async () => {
        try {
            setIsGeneratingReport(true);
            const message = await generateReport();
            if (!message) {
                addAlert({
                    message: "Error generating report: no status returned",
                    position: "top-center",
                    dismissable: true,
                });
            } else {
                addAlert({
                    message: message.message,
                    position: "top-center",
                    dismissable: true,
                });
            }
        } catch (error: any) {
            addAlert({
                message: `Error generating report: ${error.message}`,
                position: "top-center",
                dismissable: true,
            });
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return [isGeneratingReport, generateReportAndAlert];
};

export default useGenerateReport;