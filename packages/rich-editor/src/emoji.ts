/**
 * Emoji system — shortcode to unicode mapping and search.
 */

// ---------------------------------------------------------------------------
// Emoji map
// ---------------------------------------------------------------------------

export const EMOJI_MAP: Record<string, string> = {
  ':smile:': '\u{1F604}',
  ':laugh:': '\u{1F602}',
  ':joy:': '\u{1F602}',
  ':grin:': '\u{1F601}',
  ':wink:': '\u{1F609}',
  ':blush:': '\u{1F60A}',
  ':heart_eyes:': '\u{1F60D}',
  ':kissing:': '\u{1F617}',
  ':thinking:': '\u{1F914}',
  ':neutral:': '\u{1F610}',
  ':expressionless:': '\u{1F611}',
  ':unamused:': '\u{1F612}',
  ':sweat:': '\u{1F613}',
  ':pensive:': '\u{1F614}',
  ':confused:': '\u{1F615}',
  ':disappointed:': '\u{1F61E}',
  ':worried:': '\u{1F61F}',
  ':angry:': '\u{1F620}',
  ':rage:': '\u{1F621}',
  ':cry:': '\u{1F622}',
  ':sob:': '\u{1F62D}',
  ':scream:': '\u{1F631}',
  ':fearful:': '\u{1F628}',
  ':cold_sweat:': '\u{1F630}',
  ':relieved:': '\u{1F60C}',
  ':sleepy:': '\u{1F62A}',
  ':sleeping:': '\u{1F634}',
  ':mask:': '\u{1F637}',
  ':sunglasses:': '\u{1F60E}',
  ':nerd:': '\u{1F913}',
  ':heart:': '\u{2764}\u{FE0F}',
  ':broken_heart:': '\u{1F494}',
  ':sparkling_heart:': '\u{1F496}',
  ':two_hearts:': '\u{1F495}',
  ':fire:': '\u{1F525}',
  ':100:': '\u{1F4AF}',
  ':star:': '\u{2B50}',
  ':star2:': '\u{1F31F}',
  ':sparkles:': '\u{2728}',
  ':thumbsup:': '\u{1F44D}',
  ':thumbsdown:': '\u{1F44E}',
  ':wave:': '\u{1F44B}',
  ':clap:': '\u{1F44F}',
  ':raised_hands:': '\u{1F64C}',
  ':pray:': '\u{1F64F}',
  ':muscle:': '\u{1F4AA}',
  ':point_up:': '\u{261D}\u{FE0F}',
  ':point_down:': '\u{1F447}',
  ':point_left:': '\u{1F448}',
  ':point_right:': '\u{1F449}',
  ':ok_hand:': '\u{1F44C}',
  ':v:': '\u{270C}\u{FE0F}',
  ':eyes:': '\u{1F440}',
  ':tongue:': '\u{1F445}',
  ':lips:': '\u{1F444}',
  ':rocket:': '\u{1F680}',
  ':tada:': '\u{1F389}',
  ':confetti:': '\u{1F38A}',
  ':balloon:': '\u{1F388}',
  ':gift:': '\u{1F381}',
  ':trophy:': '\u{1F3C6}',
  ':medal:': '\u{1F3C5}',
  ':crown:': '\u{1F451}',
  ':gem:': '\u{1F48E}',
  ':bell:': '\u{1F514}',
  ':check:': '\u{2705}',
  ':x:': '\u{274C}',
  ':warning:': '\u{26A0}\u{FE0F}',
  ':no_entry:': '\u{26D4}',
  ':question:': '\u{2753}',
  ':exclamation:': '\u{2757}',
  ':bulb:': '\u{1F4A1}',
  ':book:': '\u{1F4D6}',
  ':memo:': '\u{1F4DD}',
  ':pencil:': '\u{270F}\u{FE0F}',
  ':calendar:': '\u{1F4C5}',
  ':clock:': '\u{1F550}',
  ':hourglass:': '\u{231B}',
  ':lock:': '\u{1F512}',
  ':key:': '\u{1F511}',
  ':hammer:': '\u{1F528}',
  ':wrench:': '\u{1F527}',
  ':link:': '\u{1F517}',
  ':paperclip:': '\u{1F4CE}',
  ':scissors:': '\u{2702}\u{FE0F}',
  ':package:': '\u{1F4E6}',
  ':email:': '\u{1F4E7}',
  ':phone:': '\u{1F4DE}',
  ':computer:': '\u{1F4BB}',
  ':house:': '\u{1F3E0}',
  ':tree:': '\u{1F333}',
  ':sun:': '\u{2600}\u{FE0F}',
  ':moon:': '\u{1F319}',
  ':cloud:': '\u{2601}\u{FE0F}',
  ':rain:': '\u{1F327}\u{FE0F}',
  ':snow:': '\u{2744}\u{FE0F}',
  ':zap:': '\u{26A1}',
  ':rainbow:': '\u{1F308}',
  ':pizza:': '\u{1F355}',
  ':hamburger:': '\u{1F354}',
  ':coffee:': '\u{2615}',
  ':beer:': '\u{1F37A}',
  ':wine:': '\u{1F377}',
  ':cake:': '\u{1F370}',
  ':dog:': '\u{1F436}',
  ':cat:': '\u{1F431}',
  ':poop:': '\u{1F4A9}',
  ':ghost:': '\u{1F47B}',
  ':skull:': '\u{1F480}',
  ':alien:': '\u{1F47D}',
  ':robot:': '\u{1F916}',
  ':handshake:': '\u{1F91D}',
  ':pray2:': '\u{1F64F}',
  ':salute:': '\u{1FAE1}',
}

// ---------------------------------------------------------------------------
// Detection and search
// ---------------------------------------------------------------------------

/**
 * Detect if a text ends with a completed emoji shortcode like `:smile:`.
 * Returns the shortcode and its unicode value if found, null otherwise.
 */
export function detectEmojiShortcode(
  text: string,
): { shortcode: string; unicode: string } | null {
  // Look for a pattern like :word: at the end of text
  const match = text.match(/:([a-z0-9_]+):$/)
  if (!match) return null

  const shortcode = `:${match[1]}:`
  const unicode = EMOJI_MAP[shortcode]
  if (!unicode) return null

  return { shortcode, unicode }
}

/**
 * Search emoji by partial query (matches against shortcode names).
 */
export function searchEmoji(
  query: string,
): { shortcode: string; unicode: string }[] {
  const q = query.toLowerCase().replace(/^:/, '').replace(/:$/, '')
  if (q === '') {
    return Object.entries(EMOJI_MAP).map(([shortcode, unicode]) => ({ shortcode, unicode }))
  }

  return Object.entries(EMOJI_MAP)
    .filter(([shortcode]) => {
      const name = shortcode.slice(1, -1) // remove colons
      return name.includes(q)
    })
    .map(([shortcode, unicode]) => ({ shortcode, unicode }))
    .sort((a, b) => {
      const aName = a.shortcode.slice(1, -1)
      const bName = b.shortcode.slice(1, -1)
      // Exact start match first
      const aStarts = aName.startsWith(q)
      const bStarts = bName.startsWith(q)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      return aName.localeCompare(bName)
    })
}
