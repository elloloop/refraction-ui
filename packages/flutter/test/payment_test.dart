import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildPayment({
    List<RefractionPaymentItem>? items,
    List<RefractionPaymentMethod>? paymentMethods,
    double taxAmount = 0.0,
    double shippingAmount = 0.0,
    String? initialPaymentMethodId,
    ValueChanged<String>? onPaymentMethodChanged,
    VoidCallback? onSubmit,
    String submitButtonText = 'Pay',
    bool isProcessing = false,
    String? errorText,
    String currency = 'USD',
    String currencySymbol = '\$',
  }) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.fintechDark(),
        child: Scaffold(
          body: SingleChildScrollView(
            child: RefractionPayment(
              items: items ?? [],
              paymentMethods: paymentMethods ?? [],
              taxAmount: taxAmount,
              shippingAmount: shippingAmount,
              initialPaymentMethodId: initialPaymentMethodId,
              onPaymentMethodChanged: onPaymentMethodChanged,
              onSubmit: onSubmit,
              submitButtonText: submitButtonText,
              isProcessing: isProcessing,
              errorText: errorText,
              currency: currency,
              currencySymbol: currencySymbol,
            ),
          ),
        ),
      ),
    );
  }

  group('RefractionPayment - Layout and Rendering', () {
    testWidgets('renders Order Summary when items are provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Item 1', price: 10.0),
          ],
        ),
      );

      expect(find.text('Order Summary'), findsOneWidget);
      expect(find.text('Item 1'), findsOneWidget);
    });

    testWidgets('does not render Order Summary when items are empty', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(buildPayment(items: []));

      expect(find.text('Order Summary'), findsNothing);
    });

    testWidgets('renders Subtotal correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Item 1', price: 10.0),
            const RefractionPaymentItem(id: '2', name: 'Item 2', price: 20.0),
          ],
        ),
      );

      expect(find.text('Subtotal'), findsOneWidget);
      expect(find.text('\$30.00'), findsWidgets);
    });

    testWidgets('renders multiple quantities correctly', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(
              id: '1',
              name: 'Item 1',
              price: 10.0,
              quantity: 3,
            ),
          ],
        ),
      );

      expect(find.text('\$30.00'), findsWidgets);
    });

    testWidgets('renders description if provided', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(
              id: '1',
              name: 'Item 1',
              description: 'Test desc',
              price: 10.0,
            ),
          ],
        ),
      );

      expect(find.text('Test desc'), findsOneWidget);
    });

    testWidgets('calculates Subtotal with floating points accurately', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Item 1', price: 10.50),
            const RefractionPaymentItem(id: '2', name: 'Item 2', price: 20.25),
          ],
        ),
      );

      expect(find.text('\$30.75'), findsWidgets);
    });

    testWidgets('renders Tax if greater than 0', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Item 1', price: 10.0),
          ],
          taxAmount: 2.0,
        ),
      );

      expect(find.text('Tax'), findsOneWidget);
      expect(find.text('\$2.00'), findsWidgets);
    });

    testWidgets('does not render Tax if 0', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Item 1', price: 10.0),
          ],
          taxAmount: 0.0,
        ),
      );

      expect(find.text('Tax'), findsNothing);
    });

    testWidgets('renders Shipping if greater than 0', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Item 1', price: 10.0),
          ],
          shippingAmount: 5.0,
        ),
      );

      expect(find.text('Shipping'), findsOneWidget);
      expect(find.text('\$5.00'), findsOneWidget);
    });

    testWidgets('does not render Shipping if 0', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Item 1', price: 10.0),
          ],
          shippingAmount: 0.0,
        ),
      );

      expect(find.text('Shipping'), findsNothing);
    });

    testWidgets('calculates Total correctly with tax and shipping', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Item 1', price: 10.0),
          ],
          taxAmount: 2.50,
          shippingAmount: 5.0,
        ),
      );

      expect(find.text('Total'), findsOneWidget);
      // button total also matches, so it might be 2 instances of $17.50
      expect(find.text('\$17.50'), findsWidgets);
    });

    testWidgets('formats currency according to currency symbol provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Item 1', price: 10.0),
          ],
          currencySymbol: '€',
        ),
      );

      expect(find.text('€10.00'), findsWidgets);
    });

    testWidgets('renders Payment Method section when methods are provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          paymentMethods: [
            const RefractionPaymentMethod(id: 'card', title: 'Credit Card'),
          ],
        ),
      );

      expect(find.text('Payment Method'), findsOneWidget);
      expect(find.text('Credit Card'), findsOneWidget);
    });

    testWidgets(
      'does not render Payment Method section when methods are empty',
      (WidgetTester tester) async {
        await tester.pumpWidget(buildPayment(paymentMethods: []));

        expect(find.text('Payment Method'), findsNothing);
      },
    );

    testWidgets('renders multiple payment methods', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          paymentMethods: [
            const RefractionPaymentMethod(id: 'card', title: 'Credit Card'),
            const RefractionPaymentMethod(id: 'paypal', title: 'PayPal'),
          ],
        ),
      );

      expect(find.text('Credit Card'), findsOneWidget);
      expect(find.text('PayPal'), findsOneWidget);
    });

    testWidgets('renders payment method description if provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          paymentMethods: [
            const RefractionPaymentMethod(
              id: 'card',
              title: 'Credit Card',
              description: 'Ends in 4242',
            ),
          ],
        ),
      );

      expect(find.text('Ends in 4242'), findsOneWidget);
    });

    testWidgets('renders payment method icon if provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          paymentMethods: [
            const RefractionPaymentMethod(
              id: 'card',
              title: 'Credit Card',
              icon: Icon(Icons.credit_card),
            ),
          ],
        ),
      );

      expect(find.byIcon(Icons.credit_card), findsOneWidget);
    });
  });

  group('RefractionPayment - State and Interactivity', () {
    testWidgets('selects first payment method by default if none provided', (
      WidgetTester tester,
    ) async {
      String? selectedMethod;
      await tester.pumpWidget(
        buildPayment(
          paymentMethods: [
            const RefractionPaymentMethod(id: 'card', title: 'Credit Card'),
            const RefractionPaymentMethod(id: 'paypal', title: 'PayPal'),
          ],
          onPaymentMethodChanged: (id) => selectedMethod = id,
        ),
      );

      // Initial state is internally set to 'card', but onChanged is not called on init
      expect(selectedMethod, isNull);

      // We can verify visually by checking container decoration, but gesture detector is easier:
      await tester.tap(find.text('PayPal'));
      await tester.pump();

      expect(selectedMethod, 'paypal');
    });

    testWidgets('respects initialPaymentMethodId', (WidgetTester tester) async {
      String? selectedMethod;
      await tester.pumpWidget(
        buildPayment(
          paymentMethods: [
            const RefractionPaymentMethod(id: 'card', title: 'Credit Card'),
            const RefractionPaymentMethod(id: 'paypal', title: 'PayPal'),
          ],
          initialPaymentMethodId: 'paypal',
          onPaymentMethodChanged: (id) => selectedMethod = id,
        ),
      );

      await tester.tap(find.text('Credit Card'));
      await tester.pump();

      expect(selectedMethod, 'card');
    });

    testWidgets(
      'does not fire onPaymentMethodChanged if same method is tapped',
      (WidgetTester tester) async {
        int callCount = 0;
        await tester.pumpWidget(
          buildPayment(
            paymentMethods: [
              const RefractionPaymentMethod(id: 'card', title: 'Credit Card'),
              const RefractionPaymentMethod(id: 'paypal', title: 'PayPal'),
            ],
            initialPaymentMethodId: 'card',
            onPaymentMethodChanged: (id) => callCount++,
          ),
        );

        await tester.tap(find.text('Credit Card'));
        await tester.pump();

        expect(callCount, 0);
      },
    );

    testWidgets('calls onSubmit when submit button is pressed', (
      WidgetTester tester,
    ) async {
      bool submitted = false;
      await tester.pumpWidget(buildPayment(onSubmit: () => submitted = true));

      await tester.tap(find.byType(RefractionButton));
      await tester.pump();

      expect(submitted, isTrue);
    });

    testWidgets('disables submit button when isProcessing is true', (
      WidgetTester tester,
    ) async {
      bool submitted = false;
      await tester.pumpWidget(
        buildPayment(onSubmit: () => submitted = true, isProcessing: true),
      );

      await tester.tap(find.byType(RefractionButton));
      await tester.pump();

      expect(submitted, isFalse);
    });

    testWidgets('renders CircularProgressIndicator when isProcessing is true', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(buildPayment(isProcessing: true));

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('does not render error text if null', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(buildPayment(errorText: null));

      expect(find.byIcon(Icons.error_outline), findsNothing);
    });

    testWidgets('renders error text if provided', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildPayment(errorText: 'Payment failed. Please try again.'),
      );

      expect(find.text('Payment failed. Please try again.'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline), findsOneWidget);
    });
  });

  group('RefractionPayment - Extensive Edge Cases', () {
    testWidgets('handles 50 items smoothly', (WidgetTester tester) async {
      final items = List.generate(
        50,
        (i) => RefractionPaymentItem(id: '$i', name: 'Item $i', price: 1.0),
      );

      await tester.pumpWidget(buildPayment(items: items));

      expect(find.text('Item 0'), findsOneWidget);
      // Items might be off screen depending on the list, but it's a Column, so it will overflow if not scrollable.
      // We don't have SingleChildScrollView in buildPayment, so it might overflow, but we can just check if widget is built.
    });

    testWidgets('handles negative quantities or prices (refunds)', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Purchase', price: 50.0),
            const RefractionPaymentItem(
              id: '2',
              name: 'Discount',
              price: -10.0,
            ),
          ],
        ),
      );

      expect(find.text('\$-10.00'), findsOneWidget);
      expect(find.text('Total'), findsOneWidget);
      expect(find.text('\$40.00'), findsWidgets); // Total + button
    });

    testWidgets('handles zero prices correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(
              id: '1',
              name: 'Free Trial',
              price: 0.0,
            ),
          ],
        ),
      );

      expect(find.text('\$0.00'), findsWidgets);
    });

    testWidgets('calculates tax accurately with negative subtotals', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildPayment(
          items: [
            const RefractionPaymentItem(id: '1', name: 'Refund', price: -50.0),
          ],
          taxAmount: -5.0,
        ),
      );

      // -50 subtotal + -5 tax = -55
      expect(find.text('\$-55.00'), findsWidgets);
    });

    testWidgets(
      'updates selected payment method gracefully when paymentMethods change',
      (WidgetTester tester) async {
        String? selectedMethod;

        final methods1 = [
          const RefractionPaymentMethod(id: 'method1', title: 'Method 1'),
          const RefractionPaymentMethod(id: 'method2', title: 'Method 2'),
        ];
        final methods2 = [
          const RefractionPaymentMethod(id: 'method3', title: 'Method 3'),
          const RefractionPaymentMethod(id: 'method4', title: 'Method 4'),
        ];

        final GlobalKey stateKey = GlobalKey();

        Widget buildTestPayment(List<RefractionPaymentMethod> methods) {
          return MaterialApp(
            home: Scaffold(
              body: RefractionTheme(
                data: RefractionThemeData.fintechDark(),
                child: SingleChildScrollView(
                  child: RefractionPayment(
                    key: stateKey,
                    items: const [],
                    paymentMethods: methods,
                    onPaymentMethodChanged: (id) => selectedMethod = id,
                  ),
                ),
              ),
            ),
          );
        }

        await tester.pumpWidget(buildTestPayment(methods1));

        await tester.tap(find.text('Method 2'));
        await tester.pump();
        expect(selectedMethod, 'method2');

        // Now update the methods list so 'method2' is no longer present
        await tester.pumpWidget(buildTestPayment(methods2));

        // Tap Method 4 so we change it from the defaulted Method 3
        await tester.tap(find.text('Method 4'));
        await tester.pump();

        expect(selectedMethod, 'method4');
      },
    );

    for (int i = 1; i <= 20; i++) {
      testWidgets('Parametrized item test: $i item(s)', (
        WidgetTester tester,
      ) async {
        final items = List.generate(
          i,
          (index) => RefractionPaymentItem(
            id: 'id_$index',
            name: 'Item $index',
            price: 10.0,
          ),
        );

        await tester.pumpWidget(buildPayment(items: items));
        expect(find.text('\$${(i * 10).toStringAsFixed(2)}'), findsWidgets);
      });
    }

    testWidgets('Custom submit button text', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildPayment(
          submitButtonText: 'Confirm Purchase',
          items: [
            const RefractionPaymentItem(id: '1', name: 'Test', price: 10.0),
          ],
        ),
      );

      expect(find.text('Confirm Purchase - \$10.00'), findsOneWidget);
    });

    testWidgets('currency symbol combinations', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildPayment(
          currencySymbol: '£',
          items: [
            const RefractionPaymentItem(id: '1', name: 'Test', price: 50.0),
          ],
          taxAmount: 5.0,
        ),
      );

      expect(find.text('£50.00'), findsWidgets);
      expect(find.text('£5.00'), findsOneWidget);
      expect(find.text('£55.00'), findsWidgets); // Total
    });
  });
}
