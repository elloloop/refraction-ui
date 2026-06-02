import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class CalloutPage extends StatelessWidget {
  const CalloutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Callout')),
      body: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          const Text(
            'Standard Callout',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          RefractionCallout(
            title: 'Did you know?',
            description:
                'You can use Callouts to draw attention to important information.',
          ),
          const SizedBox(height: 24),

          const Text(
            'Success Callout',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          RefractionCallout(
            variant: RefractionCalloutVariant.success,
            title: 'Action Completed',
            description: 'Your changes have been saved successfully.',
          ),
          const SizedBox(height: 24),

          const Text(
            'Warning Callout',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          RefractionCallout(
            variant: RefractionCalloutVariant.warning,
            title: 'Approaching Limit',
            description: 'You have used 90% of your available storage quota.',
          ),
          const SizedBox(height: 24),

          const Text('Error Callout', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          RefractionCallout(
            variant: RefractionCalloutVariant.error,
            title: 'Payment Failed',
            description:
                'We were unable to process your transaction. Please check your billing details.',
          ),
          const SizedBox(height: 24),

          const Text('Info Callout', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          RefractionCallout(
            variant: RefractionCalloutVariant.info,
            title: 'New Update Available',
            description:
                'Version 2.0 brings a host of new features and performance improvements.',
          ),
          const SizedBox(height: 24),

          const Text(
            'Callout without Title',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          RefractionCallout(
            variant: RefractionCalloutVariant.standard,
            description:
                'This is a simple callout that only has a description.',
          ),
          const SizedBox(height: 24),

          const Text(
            'Callout with Custom Icon',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          RefractionCallout(
            variant: RefractionCalloutVariant.info,
            icon: const Icon(Icons.rocket_launch),
            title: 'Blast off!',
            description: 'You can customize the icon to match your content.',
          ),
        ],
      ),
    );
  }
}
