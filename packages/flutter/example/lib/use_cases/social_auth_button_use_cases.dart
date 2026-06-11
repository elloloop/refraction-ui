import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Buttons', type: RefractionSocialAuthButton)
Widget socialAuthButtons(BuildContext context) {
  return SizedBox(
    width: 360,
    child: Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        RefractionSocialAuthButton(
          provider: RefractionSocialProvider.google,
          lastUsed: true,
          onPressed: () {},
        ),
        const SizedBox(height: 16),
        RefractionSocialAuthButton(
          provider: RefractionSocialProvider.github,
          onPressed: () {},
        ),
        const SizedBox(height: 16),
        RefractionSocialAuthButton(
          provider: RefractionSocialProvider.microsoft,
          loading: true,
          onPressed: () {},
        ),
        const SizedBox(height: 16),
        RefractionSocialAuthButton(
          provider: RefractionSocialProvider.apple,
          onPressed: () {},
        ),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'Row', type: RefractionSocialAuthRow)
Widget socialAuthRow(BuildContext context) {
  return SizedBox(
    width: 520,
    child: RefractionSocialAuthRow(
      children: [
        RefractionSocialAuthButton(
          provider: RefractionSocialProvider.google,
          onPressed: () {},
        ),
        RefractionSocialAuthButton(
          provider: RefractionSocialProvider.apple,
          onPressed: () {},
        ),
      ],
    ),
  );
}
