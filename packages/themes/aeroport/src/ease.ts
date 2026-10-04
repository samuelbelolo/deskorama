/**
 * The easing curves of the airport's motion, each mapping progress from 0 to 1 onto 0 to 1.
 * `out` starts fast and lands gently, `in` starts gently and leaves fast, `inOut` does both.
 */
export const EASE = {
  out: (progress: number): number => 1 - (1 - progress) ** 3,
  in: (progress: number): number => progress ** 3,
  inOut: (progress: number): number => (progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2),
} as const;
