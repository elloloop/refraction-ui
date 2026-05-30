import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionPayment)
Widget defaultPayment(BuildContext context) {
  return const RefractionPayment(
    items: [
      RefractionPaymentItem(
        id: '1',
        name: 'Premium Subscription',
        price: 19.99,
      ),
      RefractionPaymentItem(id: '2', name: 'Setup Fee', price: 5.00),
    ],
    taxAmount: 2.0,
    shippingAmount: 0.0,
    paymentMethods: [
      RefractionPaymentMethod(id: 'card', title: 'Credit Card'),
      RefractionPaymentMethod(id: 'paypal', title: 'PayPal'),
    ],
  );
}

@widgetbook.UseCase(name: 'Processing', type: RefractionPayment)
Widget processingPayment(BuildContext context) {
  return const RefractionPayment(
    items: [
      RefractionPaymentItem(
        id: '1',
        name: 'Premium Subscription',
        price: 19.99,
      ),
    ],
    isProcessing: true,
  );
}

@widgetbook.UseCase(name: 'With Error', type: RefractionPayment)
Widget errorPayment(BuildContext context) {
  return const RefractionPayment(
    items: [
      RefractionPaymentItem(
        id: '1',
        name: 'Premium Subscription',
        price: 19.99,
      ),
    ],
    errorText: 'Payment failed. Please try again.',
  );
}
