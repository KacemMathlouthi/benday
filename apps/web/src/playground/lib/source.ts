/** Whatever the playground is currently baking. */
export interface Source {
  id: string;
  label: string;
  src: string;
}

/**
 * The one source the playground starts from. Everything else arrives by upload
 * or drop, so there is no sample picker to work through.
 */
export const DEFAULT_SOURCE: Source = {
  id: "benday-mark",
  label: "benday mark",
  src: "/benday-mark.svg",
};
