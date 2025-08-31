export interface CustomArgs {
  id: string;                    // Custom action identifier
  args: Record<string, any>;     // Action-specific parameters
  blocking?: boolean;            // Whether to await completion (default: true)
  timeout?: number;              // Optional timeout in milliseconds
}