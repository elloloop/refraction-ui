import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Recording or live stream status for the browser chrome mock.
enum RefractionBrowserChromeStatus {
  /// Emerald live indicator.
  live,

  /// Destructive/red recording indicator.
  rec,
}

/// RefractionBrowserChromeMock — a decorative browser window frame.
///
/// Renders a mock browser chrome with traffic-light dots, a monospace URL bar
/// (bold domain + normal path), an optional status badge, and a content area.
///
/// Mirrors the react-browser-chrome-mock / astro-browser-chrome-mock equivalents.
class RefractionBrowserChromeMock extends StatelessWidget {
  /// URL to display in the address bar. Bold domain + normal path.
  final String url;

  /// Optional status badge shown in the chrome bar.
  final RefractionBrowserChromeStatus? status;

  /// Content to display inside the browser viewport.
  final Widget child;

  /// Creates a [RefractionBrowserChromeMock].
  const RefractionBrowserChromeMock({
    super.key,
    required this.url,
    this.status,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    // Split URL into domain and path
    final slashIndex = url.indexOf('/');
    final String domain = slashIndex == -1 ? url : url.substring(0, slashIndex);
    final String path = slashIndex == -1 ? '' : url.substring(slashIndex);

    // Traffic light dots
    final trafficDots = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildTrafficDot(Colors.red.shade400),
        const SizedBox(width: 6),
        _buildTrafficDot(Colors.yellow.shade400),
        const SizedBox(width: 6),
        _buildTrafficDot(Colors.green.shade400),
      ],
    );

    // URL bar
    final urlBar = Expanded(
      child: Center(
        child: RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: const TextStyle(
              fontFamily: 'monospace',
              fontSize: 11.0,
            ).copyWith(color: colors.mutedForeground),
            children: [
              TextSpan(
                text: domain,
                style: const TextStyle(fontWeight: FontWeight.bold).copyWith(
                  color: colors.foreground,
                ),
              ),
              if (path.isNotEmpty) TextSpan(text: path),
            ],
          ),
        ),
      ),
    );

    // Status badge
    Widget? statusWidget;
    if (status != null) {
      final isRec = status == RefractionBrowserChromeStatus.rec;
      final badgeColor = isRec ? colors.destructive : const Color(0xFF10B981);
      final badgeBgColor = badgeColor.withValues(alpha: 0.1);

      statusWidget = Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: badgeBgColor,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isRec) ...[
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: colors.destructive,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 4),
            ],
            Text(
              status!.name.toUpperCase(),
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
                color: badgeColor,
              ),
            ),
          ],
        ),
      );
    }

    return Semantics(
      container: true,
      label: 'Browser frame for $url',
      child: Container(
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: colors.border),
          boxShadow: theme.softShadow,
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Chrome toolbar row
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: colors.muted.withValues(alpha: 0.4),
                border: Border(
                  bottom: BorderSide(color: colors.border),
                ),
              ),
              child: Row(
                children: [
                  trafficDots,
                  urlBar,
                  if (statusWidget != null) statusWidget,
                ],
              ),
            ),
            // Viewport content
            child,
          ],
        ),
      ),
    );
  }

  Widget _buildTrafficDot(Color color) {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }
}
