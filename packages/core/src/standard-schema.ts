// The Standard Schema interface (standardschema.dev), copied as its authors recommend so core keeps no dependency.
// Valibot and zod/mini schemas implement it.

/** A schema of any validation library that implements Standard Schema, validating unknown data into `Output`. */
export interface StandardSchema<Output> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>;
  };
}

/** The outcome of a Standard Schema validation: the value, or the issues. */
export type StandardResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: readonly StandardIssue[] };

/** One problem found by a Standard Schema validation. */
export interface StandardIssue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined;
}
