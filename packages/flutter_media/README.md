# refraction_ui_media

Opt-in media and video-conferencing components for
[Refraction UI](https://github.com/elloloop/refraction-ui).

These widgets were extracted from the `refraction_ui` core package so that the
core carries **no native plugins**. The `video_player` plugin
(ExoPlayer / AVFoundation) is pulled in here, and only here — apps that never
render video keep a plugin-free dependency on `refraction_ui`.

## Components

- `RefractionVideoPlayer` — a themed video player shell over `video_player`.
- `RefractionVideoTile` — a single conferencing participant tile.
- `RefractionVideoGrid` — a grid/speaker layout of participant tiles.

## Usage

Add both packages to your app:

```yaml
dependencies:
  refraction_ui: ^0.48.0
  refraction_ui_media: ^0.1.0
```

Wrap your app in a `RefractionTheme` (from `refraction_ui`) as usual — the
media components read the same [`RefractionThemeData`] tokens as the rest of
the library:

```dart
import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui_media/refraction_ui_media.dart';

void main() {
  runApp(
    RefractionTheme(
      data: RefractionThemeData.light(),
      child: const MaterialApp(
        home: Scaffold(
          body: RefractionVideoTile(name: 'Ada Lovelace'),
        ),
      ),
    ),
  );
}
```
