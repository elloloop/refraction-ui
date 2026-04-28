import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single entry shown inside a [RefractionNavbar].
///
/// Each link maps a human readable [label] to a route [href] that the host
/// application is responsible for resolving. An optional [icon] can be shown
/// alongside the label for richer presentations.
///
/// ```dart
/// const NavLink(label: 'Docs', href: '/docs', icon: Icons.menu_book);
/// ```
class NavLink {
  /// Text shown inside the navbar for this link.
  final String label;

  /// Application route or URL associated with the link.
  ///
  /// The navbar passes this value to [RefractionNavbar.onNavigate] when the
  /// user taps the link and is also compared against
  /// [RefractionNavbar.currentPath] to derive the active state.
  final String href;

  /// Optional leading icon rendered next to the [label].
  final IconData? icon;

  /// Creates an immutable description of a navbar link.
  const NavLink({required this.label, required this.href, this.icon});
}

/// A horizontal site-wide navigation bar styled with [RefractionTheme].
///
/// `RefractionNavbar` mirrors the `RefractionNavbar` component shipped with
/// the React, Angular and Astro flavours of Refraction UI (a shadcn-inspired
/// pattern). It hosts an optional [logo], a list of [links] in the centre and
/// trailing [actions] such as a sign-in button or theme toggle.
///
/// On viewports narrower than 768 logical pixels (or whenever
/// [forceMobileLayout] is `true`) the centre links collapse and only the logo
/// and actions are shown — host applications are expected to surface the
/// hidden links via a drawer or sheet of their own.
///
/// Because it implements [PreferredSizeWidget] it can be supplied directly to
/// [Scaffold.appBar].
///
/// ```dart
/// Scaffold(
///   appBar: RefractionNavbar(
///     logo: const Text('Acme'),
///     currentPath: '/pricing',
///     links: const [
///       NavLink(label: 'Home', href: '/'),
///       NavLink(label: 'Pricing', href: '/pricing'),
///       NavLink(label: 'Docs', href: '/docs'),
///     ],
///     actions: TextButton(onPressed: () {}, child: const Text('Sign in')),
///     onNavigate: (href) => Navigator.of(context).pushNamed(href),
///   ),
///   body: const Center(child: Text('Hello world')),
/// );
/// ```
///
/// See also:
///
///  * [NavLink], the data type accepted by [links].
///  * [RefractionColors.background] and [RefractionColors.border], the theme
///    tokens used to paint the bar.
class RefractionNavbar extends StatelessWidget implements PreferredSizeWidget {
  /// The links rendered in the centre of the navbar on wide viewports.
  ///
  /// Defaults to an empty list, in which case only the [logo] and [actions]
  /// slots are visible.
  final List<NavLink> links;

  /// The href of the currently active route.
  ///
  /// Used to highlight the matching entry of [links] with a stronger weight
  /// and foreground colour.
  final String? currentPath;

  /// Optional brand or logo widget shown at the leading edge of the navbar.
  final Widget? logo;

  /// Optional widget shown at the trailing edge — typically a [Row] of
  /// actions such as buttons, search fields or avatars.
  final Widget? actions;

  /// Callback invoked with [NavLink.href] when the user taps any link.
  ///
  /// `null` makes the links visually present but inert — useful when the
  /// navbar is only for display.
  final ValueChanged<String>? onNavigate;

  /// When `true`, always uses the compact mobile layout regardless of
  /// viewport width.
  ///
  /// Useful for embedding the navbar inside a constrained area such as a
  /// preview pane or test harness.
  final bool forceMobileLayout;

  /// Creates a navbar with the supplied content.
  const RefractionNavbar({
    super.key,
    this.links = const [],
    this.currentPath,
    this.logo,
    this.actions,
    this.onNavigate,
    this.forceMobileLayout = false,
  });

  /// The navbar reserves a fixed height of 56 logical pixels (Tailwind `h-14`).
  @override
  Size get preferredSize => const Size.fromHeight(56.0); // Equivalent to h-14

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;

    // In Flutter we do layout constraints via LayoutBuilder or MediaQuery
    // In React this was handled via `hidden md:flex`.
    final isMobile =
        forceMobileLayout || MediaQuery.of(context).size.width < 768;

    return Container(
      height: preferredSize.height,
      decoration: BoxDecoration(
        color: colors.background.withValues(alpha: 0.95), // Slight glass feel
        border: Border(bottom: BorderSide(color: colors.border)),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Logo / Brand
              if (logo != null) logo! else const SizedBox.shrink(),

              // Main Navigation Links
              if (!isMobile && links.isNotEmpty)
                Expanded(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: links.map((link) {
                      final isActive = currentPath == link.href;
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                        child: InkWell(
                          onTap: () => onNavigate?.call(link.href),
                          borderRadius: BorderRadius.circular(6),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: Text(
                              link.label,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isActive
                                    ? FontWeight.w600
                                    : FontWeight.w500,
                                color: isActive
                                    ? colors.foreground
                                    : colors.mutedForeground,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                )
              else if (links.isNotEmpty || actions != null)
                const Spacer(),

              // Trailing Actions Slot
              ?actions,
            ],
          ),
        ),
      ),
    );
  }
}
