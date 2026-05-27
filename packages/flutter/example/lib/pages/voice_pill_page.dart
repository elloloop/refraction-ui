import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class VoicePillPage extends StatefulWidget {
  const VoicePillPage({super.key});

  @override
  State<VoicePillPage> createState() => _VoicePillPageState();
}

class _VoicePillPageState extends State<VoicePillPage> {
  bool _muted = false;
  double _intensity = 0.5;
  RefractionVoicePillPosition _position = RefractionVoicePillPosition.inline;

  void _toggleMute() {
    setState(() {
      _muted = !_muted;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Voice Pill')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Default Inline'),
            const SizedBox(height: 16),
            RefractionVoicePill(
              label: 'Listening...',
              intensity: _intensity,
              muted: _muted,
              onToggleMute: _toggleMute,
              position: RefractionVoicePillPosition.inline,
            ),
            const SizedBox(height: 32),
            const Text('With Sub Label'),
            const SizedBox(height: 16),
            RefractionVoicePill(
              label: 'Analyzing audio...',
              sub: 'High noise environment detected',
              intensity: _intensity,
              muted: _muted,
              onToggleMute: _toggleMute,
              position: RefractionVoicePillPosition.inline,
            ),
            const SizedBox(height: 32),
            const Text('User Speaker'),
            const SizedBox(height: 16),
            RefractionVoicePill(
              speaker: RefractionVoicePillSpeaker.user,
              label: 'User speaking',
              intensity: _intensity,
              muted: _muted,
              onToggleMute: _toggleMute,
              position: RefractionVoicePillPosition.inline,
            ),
            const SizedBox(height: 32),
            const Text('Custom Speaker'),
            const SizedBox(height: 16),
            RefractionVoicePill(
              speaker: RefractionVoicePillSpeaker.custom,
              customSpeakerLabel: 'Agent Smith',
              label: 'Processing query...',
              intensity: _intensity,
              muted: _muted,
              onToggleMute: _toggleMute,
              position: RefractionVoicePillPosition.inline,
            ),
            const SizedBox(height: 32),
            const Text('Controls'),
            const SizedBox(height: 16),
            Slider(
              value: _intensity,
              onChanged: (val) {
                setState(() {
                  _intensity = val;
                });
              },
            ),
            DropdownButton<RefractionVoicePillPosition>(
              value: _position,
              items: RefractionVoicePillPosition.values.map((p) {
                return DropdownMenuItem(value: p, child: Text(p.name));
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() {
                    _position = val;
                  });
                }
              },
            ),
          ],
        ),
      ),
      // Overlay pill
      floatingActionButton: _position != RefractionVoicePillPosition.inline
          ? RefractionVoicePill(
              speaker: RefractionVoicePillSpeaker.ai,
              label: 'Overlay Pill',
              intensity: _intensity,
              muted: _muted,
              onToggleMute: _toggleMute,
              position: _position,
            )
          : null,
    );
  }
}
