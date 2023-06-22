import React, { createContext, useState, useCallback, ReactNode } from "react";

interface ModalContextType {
  modals: Record<string, boolean>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
}

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalContext = createContext<ModalContextType>({
  modals: {},
  openModal: () => { },
  closeModal: () => { },
});

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<Record<string, boolean>>({});

  const openModal = (id: string) => {
    if (!id) throw new Error("Modal ID is required")
    setModals((prevModals) => ({ ...prevModals, [id]: true }));
  };

  const closeModal = (id: string) => {
    if (!id) throw new Error("Modal ID is required")
    setModals((prevModals) => ({ ...prevModals, [id]: false }));
  };

  const contextValue: ModalContextType = {
    modals,
    openModal,
    closeModal,
  };

  return (
    <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>
  );
};
