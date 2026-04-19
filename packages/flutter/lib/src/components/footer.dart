import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class SocialLink {
  final String label;
  final String href;
  final Widget? icon;

  const SocialLink({required this.label, required this.href, this.icon});
}

class FooterLink {
  final String label;
  final String href;

  const FooterLink({required this.label, required this.href});
}

class FooterColumn {
  final String title;
  final List<FooterLink> links;

  const FooterColumn({required this.title, required this.links});
}

class RefractionFooter extends StatelessWidget {
  final String? copyright;
  final List<SocialLink> socialLinks;
  final List<FooterColumn> columns;
  final ValueChanged<String>? onNavigate;

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
