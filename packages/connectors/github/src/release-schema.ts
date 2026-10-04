import * as v from 'valibot';
import { TIME_SCHEMA } from './time-schema.ts';

/** What the Connector reads of a release. */
export interface Release {
  readonly id: number;
  readonly tag_name: string;
  readonly name: string | null;
  readonly draft: boolean;
  /** Null while it is a draft. */
  readonly published_at: number | null;
}

/** `GET /repos/{owner}/{repo}/releases`; every other field is ignored. */
export const RELEASES_SCHEMA: v.GenericSchema<unknown, readonly Release[]> = v.array(
  v.object({
    id: v.number(),
    tag_name: v.string(),
    name: v.nullable(v.string()),
    draft: v.boolean(),
    published_at: v.nullable(TIME_SCHEMA),
  }),
);
