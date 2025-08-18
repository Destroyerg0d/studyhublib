import { AlertTriangle, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SecurityAlertProps {
  type: 'warning' | 'info';
  title: string;
  message: string;
  className?: string;
}

export const SecurityAlert = ({ type, title, message, className }: SecurityAlertProps) => {
  const Icon = type === 'warning' ? AlertTriangle : Shield;
  
  return (
    <Alert 
      className={`border-l-4 ${
        type === 'warning' 
          ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/10' 
          : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/10'
      } ${className}`}
    >
      <Icon className={`h-4 w-4 ${
        type === 'warning' ? 'text-amber-600' : 'text-blue-600'
      }`} />
      <AlertTitle className={
        type === 'warning' ? 'text-amber-800 dark:text-amber-200' : 'text-blue-800 dark:text-blue-200'
      }>
        {title}
      </AlertTitle>
      <AlertDescription className={
        type === 'warning' ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'
      }>
        {message}
      </AlertDescription>
    </Alert>
  );
};