import { useContext, useEffect, useState } from "react";
import { ReactComponent as CloseIcon } from "../assets/icons/x-24.svg";
import { AlertContext } from "../contexts/AlertContext";

interface AlertProps {
    children: React.ReactNode,
    id?: string,
    duration?: number,
    title?: React.ReactNode,
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left",
    dismissable?: boolean,
}



export const useAlert = () => {
    const { addAlert, removeAlert } = useContext(AlertContext);
    return { addAlert, removeAlert };
}

const Alert: React.FC<AlertProps> = ({ id, children, duration = 2000, title, dismissable, position, ...props }) => {
    const [remainingTime, setRemainingTime] = useState(duration);
    const { removeAlert, isAlertVisible } = useContext(AlertContext);
    useEffect(() => {
        if (!duration) return;
        if (duration > 0) {
            let interval: string | number | NodeJS.Timeout | undefined
            const startTimer = () => {
                interval = setInterval(() => {
                    if (!remainingTime) return;
                    if (remainingTime <= 0) {
                        removeAlert(id);
                        clearInterval(interval);
                    } else {
                        setRemainingTime(remainingTime - 1000);
                    }
                }, 1000);
            };
            startTimer();
            return () => {
                clearInterval(interval);
            };
        }
    }, [duration, id, remainingTime, removeAlert]);

    if (!isAlertVisible(id) || !children) return null;
    return (
        <div id={id} className={`alert`} {...props} role="alert">
            <div className="alert-section">
                <div className="alert-description">
                    {title ? <div className="alert-title">{title} </div> : null}
                    <div className="alert-message">{children}</div>
                </div>
                {!duration || dismissable && (
                    <button className="alert-dismiss" onClick={() => removeAlert(id)}>
                        <CloseIcon className="icon-24" />
                    </button>
                )}
            </div>
        </div>
    );
}


export default Alert;