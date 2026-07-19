import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/*{
    Function Name: cn
    Purpose: Combines tailwind classes with clsx and twMerge
    Parameters: inputs (ClassValue[])
}*/
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
