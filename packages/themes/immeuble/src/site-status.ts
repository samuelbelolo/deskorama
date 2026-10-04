/** What the site sign's last line says, and how: in red after a failure, its border blinking while a deploy runs. */
export interface SiteStatus {
  readonly line: string;
  readonly alarm: boolean;
  readonly blink: boolean;
}
