import type { Cancel, Rect } from '@deskorama/core';
import { createDeployPlane, type DeployPlane } from './create-deploy-plane.ts';
import { PLANE } from './flight-geometry.ts';
import { holdingPoint } from './holding-point.ts';
import type { FlightStage } from './flight.ts';
import type { Wreck } from './play-jackpot.ts';

/** What stands on runway 09 for the PROD flight, kept off-limits to every Gag while it is there. */
export interface RunwayHold {
  readonly plane: () => DeployPlane | null;
  /** What a failed deploy left on the runway, until it is towed away. */
  readonly wreck: () => Wreck | null;
  /** Returns the plane waiting at the threshold, brought there at once if needed, a wreck scrapped first. */
  readonly atThreshold: () => DeployPlane;
  /** Brings a new plane beyond the left edge, ready to taxi in, the threshold held for it. */
  readonly arriving: () => DeployPlane;
  /** The plane took off: the runway is free. */
  readonly left: (plane: DeployPlane) => void;
  /** A failed deploy stranded the plane: what it left is held until towed. */
  readonly stranded: (wreck: Wreck) => void;
  /** The tow took the plane and the wreck away. */
  readonly towed: () => void;
  readonly dispose: Cancel;
}

/**
 * Returns the runway's hold for the PROD flight on the terminal side: the plane at the threshold and what a failed
 * deploy leaves around it, each reserved while it stands there.
 * @example
 * const runway = createRunwayHold(stage);
 * runway.atThreshold().place({ x: 255, y: 814, r: 0 });
 */
export function createRunwayHold(stage: FlightStage): RunwayHold {
  const { host, layout, text } = stage;
  const hold = { ...holdingPoint(layout), r: 0 };
  let plane: DeployPlane | null = null;
  let wreck: Wreck | null = null;
  let parked: Cancel | null = null;

  const park = (box: Rect | null): void => {
    parked?.();
    parked = box === null ? null : host.reserve(box);
  };

  const scrap = (): void => {
    wreck?.stop();
    wreck?.layer.remove();
    plane?.node.remove();
    wreck = null;
    plane = null;
    park(null);
  };

  return {
    plane: () => plane,
    wreck: () => wreck,
    atThreshold() {
      if (wreck !== null) scrap();
      plane ??= createDeployPlane(stage.root, text.paint.flight, hold);
      plane.place(hold);
      park(plane.box());

      return plane;
    },
    arriving() {
      const next = createDeployPlane(stage.root, text.paint.flight, { ...hold, x: -PLANE.w });
      plane = next;
      park({ ...next.box(), x: hold.x - PLANE.gear.x });

      return next;
    },
    left(leaving) {
      leaving.node.remove();
      if (plane !== leaving) return;

      plane = null;
      park(null);
    },
    stranded(next) {
      wreck = next;
      park(next.box);
    },
    towed() {
      wreck = null;
      plane = null;
      park(null);
    },
    dispose: scrap,
  };
}
