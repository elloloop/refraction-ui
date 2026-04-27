# refraction_ui

[![pub package](https://img.shields.io/pub/v/refraction_ui.svg)](https://pub.dev/packages/refraction_ui)
[![pub points](https://img.shields.io/pub/points/refraction_ui)](https://pub.dev/packages/refraction_ui/score)
[![pub likes](https://img.shields.io/pub/likes/refraction_ui)](https://pub.dev/packages/refraction_ui)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/elloloop/refraction-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/elloloop/refraction-ui/actions/workflows/ci.yml)

A **headless, fully accessible, token-driven Flutter UI library**. The Flutter chapter of [Refraction UI](https://github.com/elloloop/refraction-ui) — the same primitives you use on web (React / Angular / Astro) and on mobile, sharing a single design-token model so an app can match its brand exactly across every surface.

> **Try it live**: https://elloloop.github.io/refraction-ui/flutter/
>
> The link above runs the Flutter example app compiled to Flutter Web — every component below is interactive, with light/dark theming and a developer tools panel for poking at tokens.

```yaml
dependencies:
  refraction_ui: ^0.1.0
```

---

## Why refraction_ui

- **Headless first.** Every widget exposes the right hooks for behavior + accessibility, but visual style is driven entirely by `RefractionThemeData`. Re-skin the entire library in one place — no per-widget overrides, no global `Theme` patching.
- **One token model, every framework.** The same color/radius/typography scale powers `@refraction-ui/react`, `@refraction-ui/angular-*`, `@refraction-ui/astro-*`, and this Flutter package. Mobile and web stay in lockstep without duplicated theme definitions.
- **Accessible by default.** Components ship with proper `Semantics`, focus traversal, and keyboard handling. Buttons announce their pressed/disabled state, inputs are labeled, dialogs trap focus, etc.
- **Pure Flutter.** No platform channels, no native plugins, no FFI. Just widgets — works everywhere Flutter does (iOS, Android, web, macOS, Windows, Linux).
- **Zero deps beyond Flutter.** The package's only runtime dependency is the Flutter SDK.

---

## Live demo

Every component, in both light and dark themes, with code excerpts and developer tools to inspect tokens:

**→ https://elloloop.github.io/refraction-ui/flutter/**

The live demo is built from the [`example/`](https://github.com/elloloop/refraction-ui/tree/main/packages/flutter/example) folder in the source repo and is rebuilt and redeployed on every push to `main`.

---

## Components

All ~40 components below are token-driven and read from `RefractionTheme.of(context)`.

### Layout & navigation
| Widget | Purpose |
|---|---|
| `RefractionSidebar` | Persistent side navigation with collapsible groups |
| `RefractionTabs` | Top-bar / segmented tab controller |
| `RefractionAccordion` | Disclosure list with optional `allowMultiple` |
| `RefractionBreadcrumbs` | Trail navigation with overflow handling |
| `RefractionBottomNav` | Mobile bottom navigation |
| `RefractionNavbar` | App-bar with leading/trailing slots |

### Inputs & forms
| Widget | Purpose |
|---|---|
| `RefractionInput` | Text input with label, helper, error states |
| `RefractionSelect` | Single-value dropdown |
| `RefractionCheckbox` | Tri-state checkbox (true / false / null) |
| `RefractionRadioGroup` | Grouped radio buttons with keyboard nav |
| `RefractionSwitch` | Animated on/off toggle |
| `RefractionOtpInput` | One-time code with auto-advance + paste support |
| `RefractionRichChatInput` | Multi-line input with action slots (send, attach, mic) |

### Buttons & menus
| Widget | Purpose |
|---|---|
| `RefractionButton` | Variants: primary, secondary, destructive, outline, ghost, link. Sizes: sm / default / lg / icon |
| `RefractionCommandMenu` | Searchable command palette (cmd-K style) |
| `RefractionDropdown` | Context menu / overflow menu |

### Feedback
| Widget | Purpose |
|---|---|
| `RefractionAlert` | Inline banner (info, success, warning, destructive) |
| `RefractionToast` | Transient notification with auto-dismiss |
| `RefractionTooltip` | Hover/focus tooltip |
| `RefractionSkeleton` | Pulsing placeholder for loading states |
| `RefractionProgress` | Determinate / indeterminate progress bar |
| `RefractionSlider` | Single-thumb range input |

### Identity
| Widget | Purpose |
|---|---|
| `RefractionAvatar` | Image with fallback initials |
| `RefractionBadge` | Compact label (primary, secondary, destructive, outline) |

### Theming
| Widget / class | Purpose |
|---|---|
| `RefractionTheme` | InheritedWidget exposing tokens to descendants |
| `RefractionThemeData` | The bag of tokens (colors, radii, text style, spacing) |
| `RefractionColors` | Semantic color palette (primary, destructive, accent, …) |

---

## Quick start

```dart
import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() => runApp(const App());

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My App',
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: const HomePage(),
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: RefractionButton(
          variant: RefractionButtonVariant.primary,
          onPressed: () => debugPrint('clicked'),
          child: const Text('Get started'),
        ),
      ),
    );
  }
}
```

That's the whole setup. Wrap once in `RefractionTheme`, use widgets anywhere below.

---

## Theming

Theming is the heart of `refraction_ui`. There is **one place** to configure how everything looks: the `RefractionThemeData` you pass to `RefractionTheme`. No widget accepts ad-hoc style props that override theme tokens — if you want a change, you change a token, and every widget that uses it updates.

### Use a built-in theme

```dart
RefractionTheme(
  data: RefractionThemeData.light(),  // or .dark()
  child: child,
)
```

### Override individual tokens

```dart
RefractionTheme(
  data: RefractionThemeData.light().copyWith(
    colors: const RefractionColors.light().copyWith(
      primary: const Color(0xFF6366F1),         // brand indigo
      primaryForeground: Colors.white,
    ),
    borderRadius: 12.0,
    textStyle: GoogleFonts.inter(),
  ),
  child: child,
)
```

### Switch theme at runtime

```dart
class _AppState extends State<App> {
  Brightness _brightness = Brightness.light;

  @override
  Widget build(BuildContext context) {
    final data = _brightness == Brightness.light
        ? RefractionThemeData.light()
        : RefractionThemeData.dark();

    return RefractionTheme(
      data: data,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        child: HomePage(
          onToggleTheme: () => setState(() {
            _brightness = _brightness == Brightness.light
                ? Brightness.dark
                : Brightness.light;
          }),
        ),
      ),
    );
  }
}
```

### Mirror your web brand exactly

Because the React/Angular/Astro packages and this Flutter package consume the **same token names** (`primary`, `primaryForeground`, `destructive`, `border`, `radius-md`, …), you can keep mobile and web visually identical by exporting one source of truth (e.g. a JSON file) and feeding it into both:

```dart
// Web team's tokens.json -> these RefractionColors values
RefractionColors.light().copyWith(
  primary: Color(0xFF<from-tokens.json>),
  // …
)
```

---

## Recipes

### Form with validation

```dart
class SignUpForm extends StatefulWidget {
  const SignUpForm({super.key});
  @override
  State<SignUpForm> createState() => _SignUpFormState();
}

class _SignUpFormState extends State<SignUpForm> {
  final _email = TextEditingController();
  String? _error;

  void _submit() {
    setState(() {
      _error = _email.text.contains('@') ? null : 'Enter a valid email';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        RefractionInput(
          controller: _email,
          placeholder: 'name@example.com',
          errorText: _error,
        ),
        const SizedBox(height: 12),
        RefractionButton(
          variant: RefractionButtonVariant.primary,
          onPressed: _submit,
          child: const Text('Sign up'),
        ),
      ],
    );
  }
}
```

### Loading state with Skeleton

```dart
FutureBuilder<List<Item>>(
  future: api.fetchItems(),
  builder: (context, snapshot) {
    if (!snapshot.hasData) {
      return Column(
        children: List.generate(5, (_) => const Padding(
          padding: EdgeInsets.symmetric(vertical: 6),
          child: RefractionSkeleton(height: 56, width: double.infinity),
        )),
      );
    }
    return ItemList(items: snapshot.data!);
  },
)
```

### Toast notifications

```dart
RefractionButton(
  onPressed: () => RefractionToast.of(context).show(
    title: 'Saved',
    description: 'Your changes are live.',
    variant: RefractionToastVariant.success,
  ),
  child: const Text('Save'),
)
```

### Command palette (cmd-K)

```dart
RefractionCommandMenu(
  items: [
    CommandItem(label: 'New file',     icon: Icons.add,    onSelect: _newFile),
    CommandItem(label: 'Open project', icon: Icons.folder, onSelect: _open),
    CommandItem(label: 'Settings',     icon: Icons.tune,   onSelect: _settings),
  ],
)
```

More recipes — including a complete family-calendar app and a pregnancy tracker built entirely with `refraction_ui` widgets — live under [`example/lib/apps/`](https://github.com/elloloop/refraction-ui/tree/main/packages/flutter/example/lib/apps).

---

## Compatibility

| Requirement | Version |
|---|---|
| Dart SDK | `^3.10.1` |
| Flutter | `>= 1.17.0` (tested against current stable) |
| Platforms | iOS, Android, Web, macOS, Windows, Linux |

Null-safety is on. No platform channels — runs everywhere Flutter runs.

---

## Sister packages (one design system, every framework)

| Package | Framework | npm / pub |
|---|---|---|
| **`refraction_ui`** (this) | **Flutter** | [pub.dev/packages/refraction_ui](https://pub.dev/packages/refraction_ui) |
| `@refraction-ui/react` | React | [npm](https://npmjs.com/package/@refraction-ui/react) |
| `@refraction-ui/angular-*` | Angular | npm (per-component) |
| `@refraction-ui/astro-*` | Astro | npm (per-component) |

Mix freely — the design tokens are shared, so a Next.js admin and a Flutter mobile app speak the same visual language.

---

## Project links

- **Live demo**: https://elloloop.github.io/refraction-ui/flutter/
- **Source repository**: https://github.com/elloloop/refraction-ui (this Flutter package lives at `packages/flutter/`)
- **Documentation site**: https://elloloop.github.io/refraction-ui
- **Issues / feature requests**: https://github.com/elloloop/refraction-ui/issues
- **Changelog**: see `CHANGELOG.md`

---

## Contributing

PRs welcome. Run the package's tests with:

```sh
cd packages/flutter
flutter test
dart analyze
```

The repo's full CI (lint + unit tests + visual regression) runs on every PR via `.github/workflows/ci.yml` and `.github/workflows/test-matrix.yml`.

---

## License

MIT © [elloloop](https://github.com/elloloop). See [`LICENSE`](LICENSE).
