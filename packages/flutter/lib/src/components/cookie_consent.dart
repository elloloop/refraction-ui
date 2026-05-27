import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';
import 'switch.dart';

/// A category of cookies for user consent.
class CookieCategory {
  final String id;
  final String label;
  final String? description;
  final bool required;

  const CookieCategory({
    required this.id,
    required this.label,
    this.description,
    this.required = false,
  });
}

/// The state model for the cookie consent UI.
class CookieConsentState {
  final bool consented;
  final bool open;
  final Map<String, bool> preferences;
  final List<CookieCategory> categories;

  const CookieConsentState({
    required this.consented,
    required this.open,
    required this.preferences,
    required this.categories,
  });

  CookieConsentState copyWith({
    bool? consented,
    bool? open,
    Map<String, bool>? preferences,
    List<CookieCategory>? categories,
  }) {
    return CookieConsentState(
      consented: consented ?? this.consented,
      open: open ?? this.open,
      preferences: preferences ?? this.preferences,
      categories: categories ?? this.categories,
    );
  }
}

/// Headless controller managing the cookie consent logic.
class CookieConsentController extends ValueNotifier<CookieConsentState> {
  static const List<CookieCategory> defaultCategories = [
    CookieCategory(
      id: 'necessary',
      label: 'Strictly necessary',
      description: 'Required for the site to function. Always on.',
      required: true,
    ),
    CookieCategory(
      id: 'preferences',
      label: 'Preferences',
      description: 'Remembers your settings and choices.',
    ),
    CookieCategory(
      id: 'analytics',
      label: 'Analytics',
      description: 'Helps us understand how the site is used.',
    ),
    CookieCategory(
      id: 'marketing',
      label: 'Marketing',
      description: 'Used to personalize ads and measure campaigns.',
    ),
  ];

  CookieConsentController({
    List<CookieCategory>? categories,
    Map<String, bool>? initialPreferences,
    bool initialConsented = false,
    bool initialOpen = true,
  }) : super(CookieConsentState(
          consented: initialConsented,
          open: initialConsented ? false : initialOpen,
          preferences: initialPreferences ?? _baseline(categories ?? defaultCategories),
          categories: categories ?? defaultCategories,
        ));

  static Map<String, bool> _baseline(List<CookieCategory> categories) {
    final prefs = <String, bool>{};
    for (final cat in categories) {
      prefs[cat.id] = cat.required;
    }
    return prefs;
  }

  void acceptAll() {
    final prefs = <String, bool>{};
    for (final cat in value.categories) {
      prefs[cat.id] = true;
    }
    savePreferences(prefs);
  }

  void rejectAll() {
    savePreferences(_baseline(value.categories));
  }

  void savePreferences(Map<String, bool> prefs) {
    final merged = Map<String, bool>.from(_baseline(value.categories))..addAll(prefs);
    for (final cat in value.categories) {
      if (cat.required) {
        merged[cat.id] = true;
      }
    }
    value = value.copyWith(
      preferences: merged,
      consented: true,
      open: false,
    );
  }

  void setPreference(String id, bool val) {
    final cat = value.categories.firstWhere((c) => c.id == id, orElse: () => const CookieCategory(id: '', label: ''));
    if (cat.id.isEmpty || cat.required) return;

    final newPrefs = Map<String, bool>.from(value.preferences);
    newPrefs[id] = val;
    value = value.copyWith(preferences: newPrefs);
  }

  void reset() {
    value = value.copyWith(
      preferences: _baseline(value.categories),
      consented: false,
      open: true,
    );
  }

  void openSettings() {
    if (value.open) return;
    value = value.copyWith(open: true);
  }

  void close() {
    if (!value.open) return;
    value = value.copyWith(open: false);
  }
}

/// Where the cookie consent banner is anchored.
enum RefractionCookieConsentPosition { bottom, top }

/// A battery-included cookie consent banner/dialog.
/// 
/// Renders a responsive prompt to collect cookie consent preferences.
/// Powered by [CookieConsentController]. Can be placed in a `Stack`,
/// or will naturally size itself within a flex container.
class RefractionCookieConsent extends StatefulWidget {
  final CookieConsentController controller;
  final RefractionCookieConsentPosition position;
  final String title;
  final String description;
  final String? policyUrl;
  final String? policyLabel;
  final VoidCallback? onPolicyTap;

  const RefractionCookieConsent({
    super.key,
    required this.controller,
    this.position = RefractionCookieConsentPosition.bottom,
    this.title = 'We use cookies',
    this.description = 'We use cookies to run the site, remember your preferences, and measure traffic. Choose which to allow.',
    this.policyUrl,
    this.policyLabel = 'Cookie policy',
    this.onPolicyTap,
  });

  @override
  State<RefractionCookieConsent> createState() => _RefractionCookieConsentState();
}

class _RefractionCookieConsentState extends State<RefractionCookieConsent> {
  bool _settingsOpen = false;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<CookieConsentState>(
      valueListenable: widget.controller,
      builder: (context, state, child) {
        if (!state.open) return const SizedBox.shrink();

        final theme = RefractionTheme.of(context);
        
        final view = _settingsOpen
            ? _buildSettingsView(context, state, theme)
            : _buildResponsivePrompt(context, state, theme);

        return SafeArea(
          child: Align(
            alignment: widget.position == RefractionCookieConsentPosition.bottom
                ? Alignment.bottomCenter
                : Alignment.topCenter,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 672),
                child: Material(
                  type: MaterialType.transparency,
                  child: Container(
                    decoration: BoxDecoration(
                      color: theme.colors.background,
                      border: Border.all(color: theme.colors.border),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: const [
                        BoxShadow(
                          color: Colors.black12,
                          blurRadius: 10,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: SingleChildScrollView(
                      child: view,
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildIcon(RefractionTheme theme) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: theme.colors.accent,
        shape: BoxShape.circle,
      ),
      child: const Center(
        child: Text('🍪', style: TextStyle(fontSize: 20)),
      ),
    );
  }

  Widget _buildText(RefractionTheme theme, Widget? policy) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: theme.colors.foreground,
          ),
        ),
        const SizedBox(height: 2),
        Wrap(
          children: [
            Text(
              widget.description + (policy != null ? ' ' : ''),
              style: TextStyle(
                fontSize: 14,
                color: theme.colors.mutedForeground,
                height: 1.5,
              ),
            ),
            ?policy,
          ],
        ),
      ],
    );
  }

  Widget _buildPromptButtons(RefractionTheme theme, {bool isMobile = false}) {
    if (!isMobile) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          RefractionButton(
            variant: RefractionButtonVariant.ghost,
            onPressed: () => setState(() => _settingsOpen = true),
            child: const Text('Customize'),
          ),
          const SizedBox(width: 8),
          RefractionButton(
            variant: RefractionButtonVariant.outline,
            onPressed: widget.controller.rejectAll,
            child: const Text('Reject all'),
          ),
          const SizedBox(width: 8),
          RefractionButton(
            variant: RefractionButtonVariant.primary,
            onPressed: widget.controller.acceptAll,
            child: const Text('Accept all'),
          ),
        ],
      );
    }
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      alignment: WrapAlignment.end,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        RefractionButton(
          variant: RefractionButtonVariant.ghost,
          onPressed: () => setState(() => _settingsOpen = true),
          child: const Text('Customize'),
        ),
        RefractionButton(
          variant: RefractionButtonVariant.outline,
          onPressed: widget.controller.rejectAll,
          child: const Text('Reject all'),
        ),
        RefractionButton(
          variant: RefractionButtonVariant.primary,
          onPressed: widget.controller.acceptAll,
          child: const Text('Accept all'),
        ),
      ],
    );
  }

  Widget _buildResponsivePrompt(BuildContext context, CookieConsentState state, RefractionTheme theme) {
    final policy = widget.policyUrl != null || widget.onPolicyTap != null
        ? GestureDetector(
            onTap: widget.onPolicyTap,
            child: Text(
              widget.policyLabel ?? '',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: theme.colors.mutedForeground,
                decoration: TextDecoration.underline,
              ),
            ),
          )
        : null;

    return LayoutBuilder(builder: (context, constraints) {
      if (constraints.maxWidth > 600) {
        // Desktop Row layout
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _buildIcon(theme),
              const SizedBox(width: 16),
              Expanded(child: _buildText(theme, policy)),
              const SizedBox(width: 16),
              _buildPromptButtons(theme, isMobile: false),
            ],
          ),
        );
      } else {
        // Mobile Column layout
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildIcon(theme),
                  const SizedBox(width: 16),
                  Expanded(child: _buildText(theme, policy)),
                ],
              ),
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerRight,
                child: _buildPromptButtons(theme, isMobile: true),
              ),
            ],
          ),
        );
      }
    });
  }

  Widget _buildSettingsView(BuildContext context, CookieConsentState state, RefractionTheme theme) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              _buildIcon(theme),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Cookie preferences',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: theme.colors.foreground,
                      ),
                    ),
                    Text(
                      'Toggle the categories you want to allow.',
                      style: TextStyle(
                        fontSize: 12,
                        color: theme.colors.mutedForeground,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...state.categories.map((cat) {
            final isChecked = state.preferences[cat.id] ?? false;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(color: theme.colors.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            cat.label,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: theme.colors.foreground,
                            ),
                          ),
                          if (cat.description != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              cat.description!,
                              style: TextStyle(
                                fontSize: 12,
                                color: theme.colors.mutedForeground,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    cat.required
                        ? Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: theme.colors.muted,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              'Always on',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: theme.colors.mutedForeground,
                              ),
                            ),
                          )
                        : RefractionSwitch(
                            value: isChecked,
                            onChanged: (val) => widget.controller.setPreference(cat.id, val),
                          ),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 16),
          LayoutBuilder(
            builder: (context, constraints) {
              final buttons = [
                RefractionButton(
                  variant: RefractionButtonVariant.ghost,
                  onPressed: () => setState(() => _settingsOpen = false),
                  child: const Text('← Back'),
                ),
                const Spacer(),
                RefractionButton(
                  variant: RefractionButtonVariant.outline,
                  onPressed: widget.controller.acceptAll,
                  child: const Text('Accept all'),
                ),
                const SizedBox(width: 8),
                RefractionButton(
                  variant: RefractionButtonVariant.primary,
                  onPressed: () => widget.controller.savePreferences(state.preferences),
                  child: const Text('Save preferences'),
                ),
              ];
              if (constraints.maxWidth > 400) {
                return Row(children: buttons);
              } else {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: RefractionButton(
                            variant: RefractionButtonVariant.outline,
                            onPressed: widget.controller.acceptAll,
                            child: const Text('Accept all'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: RefractionButton(
                            variant: RefractionButtonVariant.primary,
                            onPressed: () => widget.controller.savePreferences(state.preferences),
                            child: const Text('Save preferences'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    RefractionButton(
                      variant: RefractionButtonVariant.ghost,
                      onPressed: () => setState(() => _settingsOpen = false),
                      child: const Text('← Back'),
                    ),
                  ],
                );
              }
            },
          ),
        ],
      ),
    );
  }
}
