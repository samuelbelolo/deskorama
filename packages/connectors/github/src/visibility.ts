/**
 * Which kind of repository a GitHub Source is: a private one never has stars, forks from strangers or first-time
 * contributors from outside, so only a public one reports them.
 */
export type Visibility = 'private' | 'public';
