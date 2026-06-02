import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class CookieConsentPage extends StatefulWidget {
  const CookieConsentPage({super.key});

  @override
  State<CookieConsentPage> createState() => _CookieConsentPageState();
}

class _CookieConsentPageState extends State<CookieConsentPage> {
  final _controller = CookieConsentController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: RefractionCookieConsent(controller: _controller),
    );
  }
}
