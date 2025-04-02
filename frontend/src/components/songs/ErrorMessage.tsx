import { AlertCircle } from "lucide-react";

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-4 rounded-md bg-destructive/15 text-destructive flex items-center gap-2">
    <AlertCircle className="h-4 w-4" />
    <span>{message}</span>
  </div>
);
