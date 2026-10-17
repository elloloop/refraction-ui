part of 'date_picker.dart';

Widget _datePickerTimeInput(
  BuildContext context,
  TextEditingController controller,
  ValueChanged<String> onChanged,
  RefractionTheme theme,
  RefractionColors colors,
) {
  const horizontalPadding = 8.0;
  const cursorWidth = 2.0;
  final material = Theme.of(context);
  final inputStyle = material.useMaterial3
      ? material.textTheme.bodyLarge!
      : material.textTheme.titleMedium!;
  // Measure the same merged style TextField actually renders, including
  // inherited letter spacing; measuring only the provided style clips digits.
  final style = inputStyle.merge(theme.data.textStyle.copyWith(fontSize: 14));
  final digits = TextPainter(
    text: TextSpan(text: '00', style: style),
    textDirection: Directionality.of(context),
    textScaler: MediaQuery.textScalerOf(context),
  )..layout();
  final border = OutlineInputBorder(
    borderSide: BorderSide(color: colors.input),
    borderRadius: BorderRadius.circular(theme.borderRadius),
  );
  // Material 3 reserves each outline gap even without a floating label.
  // Include that real decoration inset, padding, stroke and caret in the width.
  final gaps = material.useMaterial3 ? border.gapPadding * 2 : 0;
  final width =
      (digits.width +
              horizontalPadding * 2 +
              border.dimensions.horizontal +
              gaps +
              cursorWidth)
          .clamp(48.0, double.infinity);
  digits.dispose();
  return SizedBox(
    width: width,
    child: TextField(
      cursorWidth: cursorWidth,
      controller: controller,
      keyboardType: TextInputType.number,
      textAlign: TextAlign.center,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      onChanged: onChanged,
      style: style,
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.symmetric(
          vertical: 4,
          horizontal: horizontalPadding,
        ),
        isDense: true,
        filled: true,
        fillColor: colors.background,
        enabledBorder: border,
        focusedBorder: border.copyWith(
          borderSide: BorderSide(color: colors.ring, width: 2),
        ),
      ),
    ),
  );
}
