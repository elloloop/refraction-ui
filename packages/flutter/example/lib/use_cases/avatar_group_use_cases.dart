import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionAvatarGroup)
Widget avatarGroupDefaultUseCase(BuildContext context) {
  return RefractionAvatarGroup(
    avatars: const [
      RefractionAvatar(fallbackText: 'AB'),
      RefractionAvatar(fallbackText: 'CD'),
      RefractionAvatar(fallbackText: 'EF'),
      RefractionAvatar(fallbackText: 'GH'),
    ],
  );
}

@widgetbook.UseCase(name: 'Custom Size', type: RefractionAvatarGroup)
Widget avatarGroupCustomSizeUseCase(BuildContext context) {
  return RefractionAvatarGroup(
    size: 64.0,
    avatars: const [
      RefractionAvatar(fallbackText: 'A'),
      RefractionAvatar(fallbackText: 'B'),
      RefractionAvatar(fallbackText: 'C'),
      RefractionAvatar(fallbackText: 'D'),
    ],
  );
}

@widgetbook.UseCase(name: 'No Overflow', type: RefractionAvatarGroup)
Widget avatarGroupNoOverflowUseCase(BuildContext context) {
  return RefractionAvatarGroup(
    max: 5,
    avatars: const [
      RefractionAvatar(fallbackText: '1'),
      RefractionAvatar(fallbackText: '2'),
      RefractionAvatar(fallbackText: '3'),
    ],
  );
}

@widgetbook.UseCase(name: 'Many Avatars', type: RefractionAvatarGroup)
Widget avatarGroupManyAvatarsUseCase(BuildContext context) {
  return RefractionAvatarGroup(
    max: 3,
    avatars: const [
      RefractionAvatar(fallbackText: 'JD'),
      RefractionAvatar(fallbackText: 'AB'),
      RefractionAvatar(fallbackText: 'CD'),
      RefractionAvatar(fallbackText: 'EF'),
      RefractionAvatar(fallbackText: 'GH'),
    ],
  );
}
