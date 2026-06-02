import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class StatusIndicatorPage extends StatelessWidget {
  const StatusIndicatorPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const RefractionNavbar(logo: Text('Status Indicator')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Status Indicator',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              'A widget used to show system statuses like "Operational", "Degraded", "Outage", "Maintenance".',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
            const SizedBox(height: 32),

            // Basic Statuses
            const Text(
              'Basic Statuses',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 24,
              runSpacing: 24,
              children: [
                const RefractionStatusIndicator(
                  type: RefractionStatusType.success,
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.error,
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.warning,
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.info,
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.pending,
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.neutral,
                ),
              ],
            ),
            const SizedBox(height: 48),

            // Custom Labels
            const Text(
              'Custom Labels',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 24,
              runSpacing: 24,
              children: [
                const RefractionStatusIndicator(
                  type: RefractionStatusType.success,
                  label: 'System Operational',
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.warning,
                  label: 'Degraded Performance',
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.error,
                  label: 'Major Outage',
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.info,
                  label: 'Under Maintenance',
                ),
              ],
            ),
            const SizedBox(height: 48),

            // Pulse Animation Control
            const Text(
              'Pulse Animation',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 24,
              runSpacing: 24,
              children: [
                const RefractionStatusIndicator(
                  type: RefractionStatusType.success,
                  pulse: true,
                  label: 'Deploying...',
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.pending,
                  pulse: false,
                  label: 'Pending (No Pulse)',
                ),
              ],
            ),
            const SizedBox(height: 48),

            // Label Visibility
            const Text(
              'Icon Only (No Label)',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 24,
              runSpacing: 24,
              children: [
                const RefractionStatusIndicator(
                  type: RefractionStatusType.success,
                  showLabel: false,
                  label: 'Success hidden label',
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.error,
                  showLabel: false,
                  label: 'Error hidden label',
                ),
                const RefractionStatusIndicator(
                  type: RefractionStatusType.pending,
                  showLabel: false,
                  label: 'Pending hidden label',
                ),
              ],
            ),
            const SizedBox(height: 48),

            // Custom Composable Child
            const Text(
              'Custom Composable Child',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            RefractionStatusIndicator(
              type: RefractionStatusType.error,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.warning_amber_rounded,
                    size: 16,
                    color: Colors.grey,
                  ),
                  const SizedBox(width: 4),
                  const Text('Database Connection Failed'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
