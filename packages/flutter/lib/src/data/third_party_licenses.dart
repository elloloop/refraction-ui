import 'package:flutter/foundation.dart';

/// Package name every entry below is filed under in the licence page.
const String _package = 'refraction_ui';

/// Attribution for the third-party art bundled in `refraction_ui`.
///
/// Flutter's licence page lists each package's `LICENSE` file, which for
/// `refraction_ui` is MIT only. The bundled Twemoji glyphs and Noto animated
/// emoji are CC BY 4.0 and need their own credit. Call
/// [registerRefractionUiLicenses] once at startup and `showLicensePage` /
/// `LicenseRegistry` will include it.
const String kNotoAnimatedEmojiAttribution =
    '"Noto Animated Emoji" by Google, licensed under CC BY 4.0 '
    '(https://creativecommons.org/licenses/by/4.0/). Unmodified Lottie '
    'animations from https://googlefonts.github.io/noto-emoji-animation/ are '
    'bundled for animated emoji-only chat messages.';

/// Twemoji credit. See [kNotoAnimatedEmojiAttribution].
const String kTwemojiAttribution =
    'Twemoji graphics, Copyright 2020 Twitter, Inc and other contributors, '
    'licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). '
    'Source: https://github.com/jdecked/twemoji';

bool _registered = false;

/// Adds the CC BY 4.0 credits for the bundled emoji art to Flutter's
/// [LicenseRegistry], so an app's licence page carries them. Idempotent.
void registerRefractionUiLicenses() {
  if (_registered) return;
  _registered = true;
  LicenseRegistry.addLicense(
    () => Stream<LicenseEntry>.fromIterable(const [
      LicenseEntryWithLineBreaks([_package], kNotoAnimatedEmojiAttribution),
      LicenseEntryWithLineBreaks([_package], kTwemojiAttribution),
    ]),
  );
}
