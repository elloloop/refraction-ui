import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';

/// Orientation of the wizard step rail.
enum RefractionWizardOrientation {
  /// Steps are stacked vertically on the left.
  vertical,

  /// Steps are laid out horizontally across the top.
  horizontal,
}

/// The status of a step relative to the current active index.
enum RefractionWizardStepStatus {
  /// The step is already completed.
  complete,

  /// The step is currently active.
  current,

  /// The step is upcoming.
  upcoming,
}

/// A step configuration in the wizard flow.
class RefractionWizardStep {
  /// Unique identifier for the step.
  final String id;

  /// Label shown in the step rail.
  final String label;

  /// When true, the step is optional and a Skip button is shown.
  final bool optional;

  /// Creates a [RefractionWizardStep].
  const RefractionWizardStep({
    required this.id,
    required this.label,
    this.optional = false,
  });
}

/// A step state holding status and index.
class RefractionWizardStepState {
  final RefractionWizardStep step;
  final RefractionWizardStepStatus status;
  final int index;

  const RefractionWizardStepState({
    required this.step,
    required this.status,
    required this.index,
  });
}

/// A multi-step flow orchestration component.
///
/// Mirrors the React/Astro `Wizard` component. Supports controlled (`step`)
/// and uncontrolled (`defaultStep`) progress, custom labels, and vertical or
/// horizontal layout orientations.
///
/// ```dart
/// RefractionWizard(
///   steps: const [
///     RefractionWizardStep(id: '1', label: 'Step 1'),
///     RefractionWizardStep(id: '2', label: 'Step 2', optional: true),
///     RefractionWizardStep(id: '3', label: 'Step 3'),
///   ],
///   builder: (context, index) {
///     return Text('Active step: $index');
///   },
///   onComplete: () => print('Done!'),
/// )
/// ```
class RefractionWizard extends StatefulWidget {
  /// Step configurations.
  final List<RefractionWizardStep> steps;

  /// Controlled active step index (0-based).
  final int? step;

  /// Initial step index for uncontrolled usage. Defaults to 0.
  final int defaultStep;

  /// Called when the current step changes (Next/Back/Skip).
  final ValueChanged<int>? onStepChange;

  /// Called when the user completes the final step.
  final VoidCallback? onComplete;

  /// Orientation of the step rail. Defaults to [RefractionWizardOrientation.vertical].
  final RefractionWizardOrientation orientation;

  /// Content for the active step, built dynamically.
  final Widget Function(BuildContext context, int currentIndex)? builder;

  /// Static child widget to show alongside the rail, if [builder] is not provided.
  final Widget? child;

  /// Text or widget for the Next button. Defaults to const Text('Next').
  final Widget nextLabel;

  /// Text or widget for the Back button. Defaults to const Text('Back').
  final Widget backLabel;

  /// Text or widget for the final step's action button. Defaults to const Text('Complete').
  final Widget completeLabel;

  /// Text or widget for the Skip button. Defaults to const Text('Skip').
  final Widget skipLabel;

  /// Creates a [RefractionWizard].
  const RefractionWizard({
    super.key,
    required this.steps,
    this.step,
    this.defaultStep = 0,
    this.onStepChange,
    this.onComplete,
    this.orientation = RefractionWizardOrientation.vertical,
    this.builder,
    this.child,
    this.nextLabel = const Text('Next'),
    this.backLabel = const Text('Back'),
    this.completeLabel = const Text('Complete'),
    this.skipLabel = const Text('Skip'),
  });

  @override
  State<RefractionWizard> createState() => _RefractionWizardState();
}

class _RefractionWizardState extends State<RefractionWizard> {
  int? _internalStep;

  bool get _isControlled => widget.step != null;
  int get _currentIndex => _isControlled ? widget.step! : (_internalStep ?? widget.defaultStep);

  @override
  void initState() {
    super.initState();
    if (!_isControlled) {
      _internalStep = widget.defaultStep;
    }
  }

  void _goToStep(int targetIndex) {
    final clamped = targetIndex.clamp(0, widget.steps.length - 1);
    if (!_isControlled) {
      setState(() {
        _internalStep = clamped;
      });
    }
    widget.onStepChange?.call(clamped);
  }

  void _advance() {
    if (_currentIndex >= widget.steps.length - 1) {
      widget.onComplete?.call();
      return;
    }
    _goToStep(_currentIndex + 1);
  }

  void _back() {
    if (_currentIndex <= 0) return;
    _goToStep(_currentIndex - 1);
  }

  List<RefractionWizardStepState> _getStepStates() {
    final current = _currentIndex;
    return List.generate(widget.steps.length, (index) {
      final step = widget.steps[index];
      RefractionWizardStepStatus status;
      if (index < current) {
        status = RefractionWizardStepStatus.complete;
      } else if (index == current) {
        status = RefractionWizardStepStatus.current;
      } else {
        status = RefractionWizardStepStatus.upcoming;
      }
      return RefractionWizardStepState(step: step, status: status, index: index);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final stepStates = _getStepStates();
    final isVertical = widget.orientation == RefractionWizardOrientation.vertical;

    final isLastStep = _currentIndex == widget.steps.length - 1;
    final isOptional = widget.steps.isNotEmpty && widget.steps[_currentIndex].optional;

    Widget rail;
    if (isVertical) {
      rail = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < stepStates.length; i++) ...[
            _WizardStepItem(
              state: stepStates[i],
              orientation: widget.orientation,
            ),
            if (i < stepStates.length - 1)
              Padding(
                padding: const EdgeInsets.only(left: 15.0),
                child: Container(
                  width: 2.0,
                  height: 24.0,
                  color: stepStates[i].status == RefractionWizardStepStatus.complete
                      ? colors.primary
                      : colors.border,
                ),
              ),
          ],
        ],
      );
    } else {
      rail = Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var i = 0; i < stepStates.length; i++) ...[
            _WizardStepItem(
              state: stepStates[i],
              orientation: widget.orientation,
            ),
            if (i < stepStates.length - 1)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 15.0, left: 8.0, right: 8.0),
                  child: Container(
                    height: 2.0,
                    color: stepStates[i].status == RefractionWizardStepStatus.complete
                        ? colors.primary
                        : colors.border,
                  ),
                ),
              ),
          ],
        ],
      );
    }

    final Widget activeContent = widget.builder != null
        ? widget.builder!(context, _currentIndex)
        : (widget.child ?? const SizedBox.shrink());

    final Widget footer = Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        RefractionButton(
          onPressed: _currentIndex > 0 ? _back : null,
          variant: RefractionButtonVariant.outline,
          child: widget.backLabel,
        ),
        if (isOptional) ...[
          const SizedBox(width: 12.0),
          RefractionButton(
            onPressed: _advance,
            variant: RefractionButtonVariant.outline,
            child: widget.skipLabel,
          ),
        ],
        const SizedBox(width: 12.0),
        RefractionButton(
          onPressed: _advance,
          variant: RefractionButtonVariant.primary,
          child: isLastStep ? widget.completeLabel : widget.nextLabel,
        ),
      ],
    );

    if (isVertical) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          rail,
          const SizedBox(width: 32.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                activeContent,
                const SizedBox(height: 24.0),
                footer,
              ],
            ),
          ),
        ],
      );
    } else {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          rail,
          const SizedBox(height: 32.0),
          activeContent,
          const SizedBox(height: 24.0),
          footer,
        ],
      );
    }
  }
}

class _WizardStepItem extends StatelessWidget {
  final RefractionWizardStepState state;
  final RefractionWizardOrientation orientation;

  const _WizardStepItem({
    required this.state,
    required this.orientation,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final isVertical = orientation == RefractionWizardOrientation.vertical;

    Color badgeBg;
    Color badgeBorder;
    Color badgeText;
    Color labelColor;

    switch (state.status) {
      case RefractionWizardStepStatus.complete:
        badgeBg = colors.primary;
        badgeBorder = colors.primary;
        badgeText = colors.primaryForeground;
        labelColor = colors.foreground;
        break;
      case RefractionWizardStepStatus.current:
        badgeBg = colors.background;
        badgeBorder = colors.primary;
        badgeText = colors.primary;
        labelColor = colors.foreground;
        break;
      case RefractionWizardStepStatus.upcoming:
        badgeBg = colors.background;
        badgeBorder = colors.border;
        badgeText = colors.mutedForeground;
        labelColor = colors.mutedForeground;
        break;
    }

    final Widget badge = Container(
      width: 32.0,
      height: 32.0,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: badgeBg,
        border: Border.all(color: badgeBorder, width: 2.0),
      ),
      alignment: Alignment.center,
      child: state.status == RefractionWizardStepStatus.complete
          ? Icon(
              Icons.check,
              size: 16.0,
              color: badgeText,
            )
          : Text(
              (state.index + 1).toString(),
              style: theme.data.textStyle.copyWith(
                fontSize: 12.0,
                fontWeight: FontWeight.w600,
                color: badgeText,
              ),
            ),
    );

    final Widget labels = Column(
      crossAxisAlignment: isVertical ? CrossAxisAlignment.start : CrossAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          state.step.label,
          style: theme.data.textStyle.copyWith(
            fontSize: 14.0,
            fontWeight: FontWeight.w500,
            color: labelColor,
          ),
          textAlign: isVertical ? TextAlign.left : TextAlign.center,
        ),
        if (state.step.optional)
          Text(
            '(Optional)',
            style: theme.data.textStyle.copyWith(
              fontSize: 12.0,
              color: colors.mutedForeground,
            ),
            textAlign: isVertical ? TextAlign.left : TextAlign.center,
          ),
      ],
    );

    if (isVertical) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          badge,
          const SizedBox(width: 12.0),
          labels,
        ],
      );
    } else {
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          badge,
          const SizedBox(height: 8.0),
          labels,
        ],
      );
    }
  }
}
