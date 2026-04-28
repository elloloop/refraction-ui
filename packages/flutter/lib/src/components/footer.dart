import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A social-media link displayed in the trailing row of [RefractionFooter].
///
/// If [icon] is provided it is used as the visual; otherwise [label] is
/// rendered as text. Tapping the link emits [href] through
/// [RefractionFooter.onNavigate].
class SocialLink {
  /// Accessible label, also used as the visual fallback when [icon] is null.
  final String label;

  /// Navigation target reported through [RefractionFooter.onNavigate].
  final String href;

  /// Optional icon — typically a brand glyph.
  final Widget? icon;

  /// Creates a [SocialLink].
  const SocialLink({required this.label, required this.href, this.icon});
}

/// A single navigational link displayed inside a [FooterColumn].
class FooterLink {
  /// Visible text of the link.
  final String label;

  /// Navigation target reported through [RefractionFooter.onNavigate].
  final String href;

  /// Creates a [FooterLink].
  const FooterLink({required this.label, required this.href});
}

/// A titled column of [FooterLink]s rendered inside a [RefractionFooter].
class FooterColumn {
  /// Column heading.
  final String title;

  /// Links displayed beneath the heading.
  final List<FooterLink> links;

  /// Creates a [FooterColumn].
  const FooterColumn({required this.title, required this.links});
}

/// Site-wide footer with link columns, social links, and a copyright row.
///
/// Renders the [columns] of [FooterLink]s in a wrapping row; below them a
/// divider separates the bottom row containing [copyright] (left) and
/// [socialLinks] (right). All link taps emit through [onNavigate].
///
/// ```dart
/// RefractionFooter(
///   copyright: '(c) 2026 Acme',
///   onNavigate: (href) => router.go(href),
///   columns: const [
///     FooterColumn(title: 'Product', links: [
///       FooterLink(label: 'Pricing', href: '/pricing'),
///     ]),
///   ],
///   socialLinks: const [
///     SocialLink(label: 'Twitter', href: 'https://twitter.com/acme'),
///   ],
/// )
/// ```
class RefractionFooter extends StatelessWidget {
  /// Copyright text shown at the bottom-left. If null, defaults to the
  /// current year prefixed with the copyright symbol.
  final String? copyright;

  /// Social links shown at the bottom-right.
  final List<SocialLink> socialLinks;

  /// Columns of footer links shown above the divider. Defaults to empty.
  final List<FooterColumn> columns;

  /// Called with the tapped link's href.
  final ValueChanged<String>? onNavigate;

  /// Creates a [RefractionFooter].
  const RefractionFooter({
    super.key,
    this.copyright,
    this.socialLinks = const [],
    this.columns = const [],
    this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;

    return Container(
      width: double.infinity,
      color: colors.background, // Footer bg is usually standard background
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (columns.isNotEmpty)
            Wrap(
              spacing: 48,
              runSpacing: 40,
              children: columns.map((col) {
                return SizedBox(
                  width: 140, // Base width for a column
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        col.title,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: colors.foreground,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...col.links.map((link) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12.0),
                          child: InkWell(
                            onTap: () => onNavigate?.call(link.href),
                            child: Text(
                              link.label,
                              style: TextStyle(
                                fontSize: 14,
                                color: colors.mutedForeground,
                              ),
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                );
              }).toList(),
            ),

          if (columns.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 32.0),
              child: Divider(color: colors.border, height: 1),
            ),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  copyright ?? '© ${DateTime.now().year}',
                  style: TextStyle(fontSize: 14, color: colors.mutedForeground),
                ),
              ),
              if (socialLinks.isNotEmpty)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: socialLinks.map((social) {
                    return Padding(
                      padding: const EdgeInsets.only(left: 16.0),
                      child: InkWell(
                        onTap: () => onNavigate?.call(social.href),
                        borderRadius: BorderRadius.circular(20),
                        child:
                            social.icon ??
                            Text(
                              social.label,
                              style: TextStyle(
                                fontSize: 14,
                                color: colors.mutedForeground,
                              ),
                            ),
                      ),
                    );
                  }).toList(),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
