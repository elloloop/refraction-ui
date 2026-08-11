/// Media and video-conferencing components for Refraction UI.
///
/// These widgets were extracted from the `refraction_ui` core package so that
/// the core no longer carries the native `video_player` plugin. Add
/// `refraction_ui_media` only in apps that actually render video; everything
/// else keeps a plugin-free dependency on `refraction_ui`.
///
/// The components read their palette from the same [RefractionThemeData] as
/// the rest of the library — wrap your app in a `RefractionTheme` (from
/// `package:refraction_ui/refraction_ui.dart`) exactly as you would for any
/// other Refraction widget.
library;

export 'src/components/video_player.dart';
export 'src/components/video_tile.dart';
export 'src/components/video_grid.dart';
