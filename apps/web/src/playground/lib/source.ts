/** Whatever the playground is currently baking. */
export interface Source {
  id: string;
  label: string;
  src: string;
}

/** The one source it starts from; everything else arrives by upload or drop. */
export const DEFAULT_SOURCE: Source = {
  id: "benday-mark",
  label: "benday mark",
  src: "/benday-mark.svg",
};
