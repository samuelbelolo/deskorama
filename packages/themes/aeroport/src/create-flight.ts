import { createAirfieldFlight } from './create-airfield-flight.ts';
import { createTerminalFlight } from './create-terminal-flight.ts';
import type { Flight, FlightStage } from './flight.ts';

/**
 * Returns the PROD flight of one screen: the line-up, the take-off and the failed deploy on the terminal side; the
 * fly-over and the fire truck's alarm on the airfield. Deploys reach every screen at once, so the flight plays as
 * soon as its step arrives, never queued behind a Gag.
 * @example
 * const flight = createFlight({ ...stage, board: ambient.board });
 * host.onEvent((event) => event.archetype === 'deploy' && flight.play(event));
 */
export function createFlight(stage: FlightStage): Flight {
  return stage.layout.side === 'terminal' ? createTerminalFlight(stage) : createAirfieldFlight(stage);
}
