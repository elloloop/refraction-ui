import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_colors.dart';

/// The visual state of a [RefractionStepItem].
enum RefractionStepState {
  /// The step has been passed.
  completed,

  /// The step is currently active.
  current,

  /// The step has not been reached yet.
  upcoming,
}

/// A single step in a [RefractionSteps] sequence.
class RefractionStepItem {
  /// The main title of the step.
  final Widget title;

  /// Optional secondary text describing the step.
  final Widget? description;

  /// Optional widget to replace the default numbered indicator (e.g. an icon).
  final Widget? indicator;

  /// Creates a [RefractionStepItem].
  const RefractionStepItem({
    required this.title,
    this.description,
    this.indicator,
  });
}

/// A component that guides users through a sequence of steps.
///
/// Mirrors the shadcn-ui `Steps` primitive shipped in the React
/// and Astro Refraction UI packages.
///
/// ```dart
/// RefractionSteps(
///   currentStep: 1,
///   onStepTap: (index) => print('Tapped step $index'),
///   steps: const [
///     RefractionStepItem(
///       title: Text('Account Details'),
///       description: Text('Setup your login'),
///     ),
///     RefractionStepItem(
///       title: Text('Payment'),
///       description: Text('Add a credit card'),
///     ),
///   ],
/// )
/// ```
class RefractionSteps extends StatelessWidget {
  /// The ordered sequence of steps.
  final List<RefractionStepItem> steps;

  /// The index of the currently active step. Steps before this index are
  /// considered [RefractionStepState.completed], and steps after are
  /// [RefractionStepState.upcoming].
  final int currentStep;

  /// Called when a step is tapped. If null, the steps are not interactive.
  final ValueChanged<int>? onStepTap;

  /// A builder for custom connectors between steps.
  ///
  /// The [state] provided is the state of the step immediately *preceding*
  /// the connector. So if the user is on step 1 (0-indexed), the connector
  /// between step 0 and 1 will have state [RefractionStepState.completed].
  final Widget Function(
    BuildContext context,
    int index,
    RefractionStepState state,
  )?
  connectorBuilder;

  /// Whether the steps are laid out vertically or horizontally.
  final Axis orientation;

  /// Creates a [RefractionSteps] component.
  const RefractionSteps({
    super.key,
    required this.steps,
    this.currentStep = 0,
    this.onStepTap,
    this.connectorBuilder,
    this.orientation = Axis.vertical,
  });

  RefractionStepState _getStepState(int index) {
    if (index < currentStep) return RefractionStepState.completed;
    if (index == currentStep) return RefractionStepState.current;
    return RefractionStepState.upcoming;
  }

  Color _getIndicatorBgColor(
    RefractionStepState state,
    RefractionColors colors,
  ) {
    switch (state) {
      case RefractionStepState.completed:
        return colors.primary;
      case RefractionStepState.current:
        return colors.background;
      case RefractionStepState.upcoming:
        return colors.background;
    }
  }

  Color _getIndicatorBorderColor(
    RefractionStepState state,
    RefractionColors colors,
  ) {
    switch (state) {
      case RefractionStepState.completed:
        return colors.primary;
      case RefractionStepState.current:
        return colors.primary;
      case RefractionStepState.upcoming:
        return colors.muted;
    }
  }

  Color _getIndicatorTextColor(
    RefractionStepState state,
    RefractionColors colors,
  ) {
    switch (state) {
      case RefractionStepState.completed:
        return colors.primaryForeground;
      case RefractionStepState.current:
        return colors.primary;
      case RefractionStepState.upcoming:
        return colors.mutedForeground;
    }
  }

  Color _getTitleColor(RefractionStepState state, RefractionColors colors) {
    switch (state) {
      case RefractionStepState.completed:
        return colors.foreground;
      case RefractionStepState.current:
        return colors.foreground;
      case RefractionStepState.upcoming:
        return colors.mutedForeground;
    }
  }

  Widget _buildDefaultConnector(
    BuildContext context,
    int index,
    RefractionStepState state,
  ) {
    final colors = RefractionTheme.of(context).colors;
    final color = state == RefractionStepState.completed
        ? colors.primary
        : colors.muted;

    if (orientation == Axis.horizontal) {
      return Container(height: 2, color: color);
    } else {
      return Container(width: 2, color: color);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (steps.isEmpty) return const SizedBox.shrink();

    return orientation == Axis.vertical
        ? _buildVertical(context)
        : _buildHorizontal(context);
  }

  Widget _buildVertical(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: List.generate(steps.length, (index) {
        return _buildVerticalStep(context, index);
      }),
    );
  }

  Widget _buildHorizontal(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(steps.length * 2 - 1, (i) {
        if (i.isOdd) {
          final index = i ~/ 2;
          final state = _getStepState(index);
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.only(
                top: 15.0,
                left: 12.0,
                right: 12.0,
              ),
              child: connectorBuilder != null
                  ? connectorBuilder!(context, index, state)
                  : _buildDefaultConnector(context, index, state),
            ),
          );
        } else {
          final index = i ~/ 2;
          return _buildStepContent(context, index, isExpanded: false);
        }
      }),
    );
  }

  Widget _buildVerticalStep(BuildContext context, int index) {
    final state = _getStepState(index);
    final isLast = index == steps.length - 1;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Column(
            children: [
              _buildIndicator(context, index, state),
              if (!isLast)
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4.0),
                    child: connectorBuilder != null
                        ? connectorBuilder!(context, index, state)
                        : _buildDefaultConnector(context, index, state),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0.0 : 24.0),
              child: _buildStepTextContent(context, index, state),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent(
    BuildContext context,
    int index, {
    bool isExpanded = true,
  }) {
    final state = _getStepState(index);

    Widget content = Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildIndicator(context, index, state),
        const SizedBox(width: 12),
        _buildStepTextContent(context, index, state),
      ],
    );

    if (isExpanded) {
      return Expanded(child: content);
    }
    return content;
  }

  Widget _buildIndicator(
    BuildContext context,
    int index,
    RefractionStepState state,
  ) {
    final colors = RefractionTheme.of(context).colors;
    final step = steps[index];

    Widget indicatorBox = Container(
      width: 32,
      height: 32,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: _getIndicatorBgColor(state, colors),
        border: Border.all(
          color: _getIndicatorBorderColor(state, colors),
          width: 2,
        ),
      ),
      child:
          step.indicator ??
          Text(
            '${index + 1}',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: _getIndicatorTextColor(state, colors),
            ),
          ),
    );

    if (onStepTap != null) {
      return MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: () => onStepTap!(index),
          behavior: HitTestBehavior.opaque,
          child: indicatorBox,
        ),
      );
    }

    return indicatorBox;
  }

  Widget _buildStepTextContent(
    BuildContext context,
    int index,
    RefractionStepState state,
  ) {
    final colors = RefractionTheme.of(context).colors;
    final step = steps[index];

    Widget content = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        DefaultTextStyle(
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: _getTitleColor(state, colors),
            height: 1.0,
            letterSpacing: -0.5,
          ),
          child: step.title,
        ),
        if (step.description != null) ...[
          const SizedBox(height: 4),
          DefaultTextStyle(
            style: TextStyle(fontSize: 14, color: colors.mutedForeground),
            child: step.description!,
          ),
        ],
      ],
    );

    if (onStepTap != null) {
      return MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: () => onStepTap!(index),
          behavior: HitTestBehavior.opaque,
          child: content,
        ),
      );
    }

    return content;
  }
}
