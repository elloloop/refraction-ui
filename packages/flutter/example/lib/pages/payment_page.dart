import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class PaymentPage extends StatefulWidget {
  const PaymentPage({super.key});

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  bool _isProcessing = false;

  void _handlePaymentSubmit() {
    setState(() {
      _isProcessing = true;
    });

    // Simulate network request
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Payment processed successfully!'),
            backgroundColor: RefractionTheme.of(context).colors.primary,
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Payment",
      description:
          "A comprehensive checkout component displaying order summaries, breakdown, and mock payment methods.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Default Checkout",
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: RefractionTheme.of(context).colors.foreground,
                ),
              ),
              const SizedBox(height: 16),
              Container(
                decoration: BoxDecoration(
                  color: RefractionTheme.of(context).colors.card,
                  borderRadius: BorderRadius.circular(
                    RefractionTheme.of(context).borderRadius,
                  ),
                  border: Border.all(
                    color: RefractionTheme.of(context).colors.border,
                  ),
                  boxShadow: RefractionTheme.of(context).shadowSm,
                ),
                padding: const EdgeInsets.all(24),
                child: RefractionPayment(
                  items: const [
                    RefractionPaymentItem(
                      id: 'pro_plan',
                      name: 'Pro Plan',
                      description: 'Billed monthly',
                      price: 29.00,
                    ),
                    RefractionPaymentItem(
                      id: 'setup_fee',
                      name: 'Setup Fee',
                      description: 'One-time charge',
                      price: 15.00,
                    ),
                  ],
                  taxAmount: 4.40,
                  currencySymbol: '\$',
                  paymentMethods: const [
                    RefractionPaymentMethod(
                      id: 'card_4242',
                      title: 'Visa ending in 4242',
                      description: 'Expires 12/28',
                      icon: Icon(Icons.credit_card),
                    ),
                    RefractionPaymentMethod(
                      id: 'paypal',
                      title: 'PayPal',
                      description: 'user@example.com',
                      icon: Icon(Icons.account_balance_wallet),
                    ),
                  ],
                  onSubmit: _handlePaymentSubmit,
                  isProcessing: _isProcessing,
                  submitButtonText: 'Subscribe',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
