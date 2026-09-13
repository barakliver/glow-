/**
 * The club's unit of measure.
 *
 * A kilogram is correct and says nothing. Two hundred avocados is the same
 * number and you can picture it, which is the entire point: the club is named
 * after a fruit, so the fruit may as well do some work.
 *
 * This never replaces the real figure. Anyone deciding what to load next needs
 * kilograms, and a joke that hides the number people train by is not a joke,
 * it is a bug. Everything here is an aside printed beside the real one.
 *
 * And it only ever counts what someone LIFTED. Nothing in this file will ever
 * be pointed at a person's own body weight - the club does not rate bodies,
 * and turning somebody's weight into fruit is exactly the kind of cute that
 * stops being funny on the wrong morning.
 */

/** A Hass avocado, ripe, off the shelf. */
export const AVOCADO_KG = 0.2;

export function avocadoCount(kilograms: number): number {
  if (!Number.isFinite(kilograms) || kilograms <= 0) return 0;
  return Math.round(kilograms / AVOCADO_KG);
}

/**
 * The aside itself, already worded.
 *
 * Below one avocado there is nothing worth saying, so it returns null and the
 * caller prints nothing rather than "0 אבוקדו".
 */
export function inAvocados(kilograms: number): string | null {
  const count = avocadoCount(kilograms);
  if (count < 1) return null;
  if (count === 1) return 'אבוקדו אחד';
  return `${count.toLocaleString('he-IL')} אבוקדו`;
}

/**
 * For the big numbers, where the count stops being picturable.
 *
 * Past a few hundred the joke needs a bigger container, so it moves up to
 * crates - and past a lorry-load it simply says so.
 */
const CRATE = 50; // avocados in a crate

export function avocadoBrag(kilograms: number): string | null {
  const count = avocadoCount(kilograms);
  if (count < 1) return null;
  if (count < 60) return `${count.toLocaleString('he-IL')} אבוקדו`;

  const crates = Math.round(count / CRATE);
  if (crates < 40) return `${crates.toLocaleString('he-IL')} ארגזי אבוקדו`;
  return 'מטע שלם';
}
