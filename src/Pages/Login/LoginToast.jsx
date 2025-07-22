import React from "react";
import { CheckCircle, Info, AlertTriangle, XCircle, X } from "lucide-react";

const iconMap = {
  success: <CheckCircle className="text-green-500" />,
  info: <Info className="text-blue-500" />,
  warning: <AlertTriangle className="text-yellow-500" />,
  error: <XCircle className="text-red-500" />,
};

const styleMap = {
  success: {
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    defaultTitle: "Success!",
  },
  info: {
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    defaultTitle: "Information",
  },
  warning: {
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    defaultTitle: "Warning!",
  },
  error: {
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    defaultTitle: "Error!",
  },
};

const LoginToast = ({ type = "info", title, message, onClose }) => {
  if (!message) return null;

  const alertStyles = styleMap[type] || styleMap.info;
  const alertIcon = iconMap[type] || iconMap.info;
  const displayTitle = title || alertStyles.defaultTitle;

  return (
    <div
      className={`fixed bottom-4 left-4 flex items-start p-4 rounded-lg shadow-lg border-l-4 z-50 ${alertStyles.bgColor} ${alertStyles.borderColor}`}
      style={{ maxWidth: '350px' }} // Adjust max-width as needed
    >
      <div className="mr-3 mt-1">{alertIcon}</div>
      <div className="flex-1">
        <div className="font-semibold mb-1">{displayTitle}</div>
        <div className="text-sm text-gray-700">{message}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600" aria-label="Close notification">
            <X size={18} />
        </button>
      )}
    </div>
  );
};

export default LoginToast;
