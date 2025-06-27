import { toast } from "react-toastify";

interface ConfirmToastProps {
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmToast = ({
  message,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ConfirmToastProps) => {
  const toastId = toast.info(
    <div>
      <p>{message}</p>
      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => {
            toast.dismiss(toastId);
            onConfirm();
          }}
          style={{
            backgroundColor: "#d33",
            color: "#fff",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          {confirmText}
        </button>
        <button
          onClick={() => toast.dismiss(toastId)}
          style={{
            backgroundColor: "#aaa",
            color: "#fff",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          {cancelText}
        </button>
      </div>
    </div>,
    {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
    }
  );
};
