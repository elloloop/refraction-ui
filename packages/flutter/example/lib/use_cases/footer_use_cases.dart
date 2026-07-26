import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionFooter)
Widget defaultFooter(BuildContext context) {
  return const RefractionFooter(
    copyright: '© 2026 Acme Inc.',
    columns: [
      FooterColumn(
        title: 'Product',
        links: [
          FooterLink(label: 'Features', href: '/features'),
          FooterLink(label: 'Pricing', href: '/pricing'),
          FooterLink(label: 'Changelog', href: '/changelog'),
        ],
      ),
      FooterColumn(
        title: 'Resources',
        links: [
          FooterLink(label: 'Docs', href: '/docs'),
          FooterLink(label: 'Support', href: '/support'),
        ],
      ),
      FooterColumn(
        title: 'Company',
        links: [
          FooterLink(label: 'About', href: '/about'),
          FooterLink(label: 'Careers', href: '/careers'),
        ],
      ),
    ],
    socialLinks: [
      SocialLink(label: 'Twitter', href: 'https://x.com/acme'),
      SocialLink(label: 'GitHub', href: 'https://github.com/acme'),
    ],
  );
}

@widgetbook.UseCase(name: 'Minimal', type: RefractionFooter)
Widget minimalFooter(BuildContext context) {
  return const RefractionFooter(copyright: '© 2026 Acme Inc.');
}
