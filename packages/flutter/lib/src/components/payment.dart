import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';

/// Represents a single item in the payment summary.
class RefractionPaymentItem {
  final String id;
  final String name;
  final String? description;
  final double price;
  final int quantity;

  const RefractionPaymentItem({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.quantity = 1,
  });

  double get total => price * quantity;
}

/// Represents a payment method option.
class RefractionPaymentMethod {
  final String id;
  final String title;
  final String? description;
  final Widget? icon;

  const RefractionPaymentMethod({
    required this.id,
    required this.title,
    this.description,
    this.icon,
  });
}

/// A comprehensive payment wrapper component that renders a stylized
/// payment summary, breakdown, and payment method selector.
class RefractionPayment extends StatefulWidget {
  final List<RefractionPaymentItem> items;
  final double taxAmount;
  final double shippingAmount;
  final String currency;
  final String currencySymbol;

  final List<RefractionPaymentMethod> paymentMethods;
  final String? initialPaymentMethodId;
  final ValueChanged<String>? onPaymentMethodChanged;

  final VoidCallback? onSubmit;
  final String submitButtonText;
  final bool isProcessing;
  final String? errorText;

  const RefractionPayment({
    super.key,
    required this.items,
    this.taxAmount = 0.0,
    this.shippingAmount = 0.0,
    this.currency = 'USD',
    this.currencySymbol = '\$',
    this.paymentMethods = const [],
    this.initialPaymentMethodId,
    this.onPaymentMethodChanged,
    this.onSubmit,
    this.submitButtonText = 'Pay',
    this.isProcessing = false,
    this.errorText,
  });

  @override
  State<RefractionPayment> createState() => _RefractionPaymentState();
}

class _RefractionPaymentState extends State<RefractionPayment> {
  String? _selectedMethodId;

  @override
  void initState() {
    super.initState();
    _selectedMethodId = widget.initialPaymentMethodId;
    if (_selectedMethodId == null && widget.paymentMethods.isNotEmpty) {
      _selectedMethodId = widget.paymentMethods.first.id;
    }
  }

  @override
  void didUpdateWidget(RefractionPayment oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.paymentMethods != oldWidget.paymentMethods) {
      if (!widget.paymentMethods.any((m) => m.id == _selectedMethodId)) {
        setState(() {
          _selectedMethodId = widget.paymentMethods.isNotEmpty
              ? widget.paymentMethods.first.id
              : null;
        });
      }
    }
  }

  void _handleMethodChanged(String id) {
    if (id != _selectedMethodId) {
      setState(() {
        _selectedMethodId = id;
      });
      widget.onPaymentMethodChanged?.call(id);
    }
  }

  double get _subtotal => widget.items.fold(0, (sum, item) => sum + item.total);
  double get _total => _subtotal + widget.taxAmount + widget.shippingAmount;

  String _formatCurrency(double amount) {
    return '${widget.currencySymbol}${amount.toStringAsFixed(2)}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.items.isNotEmpty) ...[
          Text(
            'Order Summary',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: colors.foreground,
            ),
          ),
          const SizedBox(height: 16),
          ...widget.items.map((item) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.name,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: colors.foreground,
                          ),
                        ),
                        if (item.description != null)
                          Text(
                            item.description!,
                            style: TextStyle(
                              fontSize: 12,
                              color: colors.mutedForeground,
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Text(
                    _formatCurrency(item.total),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: colors.foreground,
                    ),
                  ),
                ],
              ),
            );
          }),
          Divider(color: colors.border),
          const SizedBox(height: 12),
          _buildSummaryRow(
            'Subtotal',
            _subtotal,
            colors.mutedForeground,
            colors.foreground,
          ),
          const SizedBox(height: 8),
          if (widget.taxAmount > 0) ...[
            _buildSummaryRow(
              'Tax',
              widget.taxAmount,
              colors.mutedForeground,
              colors.foreground,
            ),
            const SizedBox(height: 8),
          ],
          if (widget.shippingAmount > 0) ...[
            _buildSummaryRow(
              'Shipping',
              widget.shippingAmount,
              colors.mutedForeground,
              colors.foreground,
            ),
            const SizedBox(height: 8),
          ],
          Divider(color: colors.border),
          const SizedBox(height: 12),
          _buildSummaryRow(
            'Total',
            _total,
            colors.foreground,
            colors.foreground,
            isTotal: true,
          ),
          const SizedBox(height: 24),
        ],

        if (widget.paymentMethods.isNotEmpty) ...[
          Text(
            'Payment Method',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: colors.foreground,
            ),
          ),
          const SizedBox(height: 16),
          Column(
            children: widget.paymentMethods.map((method) {
              final isSelected = method.id == _selectedMethodId;
              return GestureDetector(
                onTap: () => _handleMethodChanged(method.id),
                behavior: HitTestBehavior.opaque,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8.0),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? colors.primary.withValues(alpha: 0.05)
                        : colors.background,
                    border: Border.all(
                      color: isSelected ? colors.primary : colors.border,
                      width: isSelected ? 2.0 : 1.0,
                    ),
                    borderRadius: BorderRadius.circular(theme.borderRadius),
                  ),
                  child: Row(
                    children: [
                      if (method.icon != null) ...[
                        method.icon!,
                        const SizedBox(width: 12),
                      ],
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              method.title,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: colors.foreground,
                              ),
                            ),
                            if (method.description != null)
                              Text(
                                method.description!,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: colors.mutedForeground,
                                ),
                              ),
                          ],
                        ),
                      ),
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected
                                ? colors.primary
                                : colors.mutedForeground,
                            width: isSelected ? 6.0 : 1.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
        ],

        if (widget.errorText != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: colors.destructive.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(theme.borderRadius),
              border: Border.all(
                color: colors.destructive.withValues(alpha: 0.5),
              ),
            ),
            child: Row(
              children: [
                Icon(Icons.error_outline, color: colors.destructive, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.errorText!,
                    style: TextStyle(color: colors.destructive, fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],

        RefractionButton(
          onPressed: widget.isProcessing ? null : widget.onSubmit,
          isLoading: widget.isProcessing,
          child: Text(
            '${widget.submitButtonText} - ${_formatCurrency(_total)}',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryRow(
    String label,
    double amount,
    Color labelColor,
    Color valueColor, {
    bool isTotal = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 16 : 14,
            fontWeight: isTotal ? FontWeight.w600 : FontWeight.normal,
            color: labelColor,
          ),
        ),
        Text(
          _formatCurrency(amount),
          style: TextStyle(
            fontSize: isTotal ? 16 : 14,
            fontWeight: isTotal ? FontWeight.w600 : FontWeight.normal,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}
