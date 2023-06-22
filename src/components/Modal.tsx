import React, { useContext, useRef, useEffect } from "react";
import { ReactComponent as CloseIcon } from "../assets/icons/x-16.svg";
import { ModalContext } from "../contexts/ModalContext";
import useKey from "../hooks/useKey";
import useScrollLock from "../hooks/useScrollLock";
import useOnClickOutside from "../hooks/useOnClickOutside";
import { generateUUID } from "../utils/utils";

interface ModalProps {
  children: React.ReactNode;
  id?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  closeKey?: string;
  open?: boolean;
  hideClose?: boolean;
  onClose?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  trigger?: React.ReactNode;
}



export const useModal = () => {
  const { openModal, closeModal } = useContext(ModalContext);
  return { openModal, closeModal };
}


const Modal = ({
  children,
  id = generateUUID(),
  hideClose,
  closeOnOverlayClick = hideClose ? false : true,
  closeOnEscape = hideClose ? false : true,
  closeKey = "Escape",
  onClose,
  open = false,
  header = null,
  footer,
  trigger,
}: ModalProps) => {
  const { modals, closeModal } = useContext(ModalContext);
  const isOpen = open || modals[id] || false;
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal(id);
    }
  }

  useOnClickOutside({
    ref: modalRef,
    handler: closeOnOverlayClick && isOpen ? handleClose : () => { },
  });


  useKey({
    key: closeKey,
    handler: closeOnEscape && isOpen ? handleClose : () => { },
  });

  useScrollLock(document, isOpen);

  return (
    <>
      {trigger}
      {isOpen && (
        <dialog
          className="modal-overlay"
          {...(isOpen ? { open: true } : {})}>
          <div className={`modal`} ref={modalRef} id={id}>
            <span className="sentinel" tabIndex={0} aria-hidden="true" />
            {!hideClose ? <div className="modal-header-wrapper">
              <div className="modal-header-title">{header}</div>
              <div className="modal-header-action">
                <button className="btn-close" onClick={handleClose}>
                  <CloseIcon />
                </button>
              </div>
            </div> : null}
            <div className="modal-body">{children}</div>
            {footer ? <div className="modal-footer">{footer}</div> : null}
          </div>
        </dialog>
      )}
    </>
  );
}

const memoizedModal = React.memo(Modal);
export default memoizedModal;
