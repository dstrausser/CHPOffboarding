interface StatusBadgeProps {
  status: "success" | "error" | "skipped" | "pending" | "running";
  label?: string;
}

const statusStyles = {
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  skipped: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {status === "running" && (
        <span className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full mr-1" />
      )}
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
