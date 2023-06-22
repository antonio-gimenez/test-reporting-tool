import { createContext, useContext, useEffect, useState } from "react";
import { groupBy } from "../utils/groupBy";
import { generateUUID } from "../utils/utils";

import { ReactComponent as XIcon } from "../assets/icons/x-24.svg";


interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  removeAlert: (id: Alert['id']) => void;
  isAlertVisible: (id: Alert['id']) => boolean;
}

interface AlertProviderProps {
  children: React.ReactNode;
}

interface Alert {
  id?: string;
  message: any;
  duration?: number;
  title?: string | null;
  dismissable?: boolean;
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
}

interface AlertProps {
  id: Alert['id'];
  children: React.ReactNode;
  duration?: Alert['duration'];
  title?: Alert['title'];
  position?: Alert['position'];
}

export const AlertContext = createContext<AlertContextType>({
  alerts: [],
  addAlert: () => { },
  removeAlert: () => { },
  isAlertVisible: () => false,
});

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = ({
    id = generateUUID(),
    message,
    dismissable = false,
    duration = dismissable ? 0 : 1000,
    title = null,
    position = "top-right",
  }: Alert) => {
    console.log({ id, message, duration, title, position })
    setAlerts((prevAlerts) => [...prevAlerts, { id, message, duration, title, position }]);
  };

  const removeAlert = (id: Alert['id']) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  const isAlertVisible = (id: Alert['id']) => {
    return alerts.some((alert: Alert) => alert.id === id);
  };

  const groupedAlerts = groupBy(alerts, "position");

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, isAlertVisible }} >
      {alerts && alerts.length > 0 && (
        <div className={`alert-overlay`}>
          {Object.entries(groupedAlerts as Record<string, Alert[]>).map(([position, alerts]) => (
            <div key={`stack-alerts-on-${position}`} className={`position-${position}`}>
              {alerts?.map((alert: Alert) => (
                <Alert
                  position={position as Alert['position']}
                  key={alert.id}
                  id={alert.id}
                  title={alert.title}
                  duration={alert.duration}
                >
                  {alert.message}
                </Alert>
              ))}
            </div>
          ))}
        </div>
      )}
      {children}
    </AlertContext.Provider>
  );
}

export function Alert({ id, children, duration, title, position, ...props }: AlertProps) {
  const [remainingTime, setRemainingTime] = useState<number>(duration ? duration : 0);
  const { removeAlert, isAlertVisible } = useContext(AlertContext);

  useEffect(() => {
    if (!duration) return
    if (duration > 0) {
      let interval: NodeJS.Timeout;
      const startTimer = () => {
        interval = setInterval(() => {
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
    <div id={id} className="alert" {...props} role="alert">
      <div className="alert-section">
        <div className="alert-description">
          {title && <div className="alert-title">{title}</div>}
          <div className="alert-message">{children}</div>
        </div>
        {!duration && (
          <button className="alert-dismiss" onClick={() => removeAlert(id)}>
            <XIcon className="icon-24" />
          </button>
        )}
      </div>
    </div>
  );
}

