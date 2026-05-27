import 'dart:math';
import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class WaveformPage extends StatefulWidget {
  const WaveformPage({super.key});

  @override
  State<WaveformPage> createState() => _WaveformPageState();
}

class _WaveformPageState extends State<WaveformPage> {
  bool _paused = false;
  double _intensity = 1.0;
  double _amplitude = 1.0;
  double _smoothing = 0.8;
  int _barCount = 48;
  WaveformVariant _variant = WaveformVariant.bars;
  bool _useCustomSamples = false;
  List<double>? _samples;

  @override
  void initState() {
    super.initState();
    _generateSamples();
  }

  void _generateSamples() {
    final random = Random();
    setState(() {
      _samples = List.generate(100, (index) => (random.nextDouble() * 2) - 1.0);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Waveform')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                border: Border.all(color: RefractionTheme.of(context).colors.border),
                borderRadius: BorderRadius.circular(12),
              ),
              child: RefractionWaveform(
                variant: _variant,
                intensity: _intensity,
                amplitude: _amplitude,
                smoothing: _smoothing,
                barCount: _barCount,
                paused: _paused,
                samples: _useCustomSamples ? _samples : null,
                height: 120,
              ),
            ),
            const SizedBox(height: 32),
            Text('Settings', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                SizedBox(
                  width: 200,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Variant'),
                      RefractionSelect<WaveformVariant>(
                        value: _variant,
                        onChanged: (v) => setState(() => _variant = v!),
                        items: WaveformVariant.values.map((v) => 
                          RefractionSelectItem(value: v, label: v.name)
                        ).toList(),
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: 200,
                  child: Row(
                    children: [
                      RefractionCheckbox(
                        checked: _paused,
                        onChanged: (v) => setState(() => _paused = v ?? false),
                      ),
                      const SizedBox(width: 8),
                      const Text('Paused'),
                    ],
                  ),
                ),
                SizedBox(
                  width: 200,
                  child: Row(
                    children: [
                      RefractionCheckbox(
                        checked: _useCustomSamples,
                        onChanged: (v) {
                          setState(() => _useCustomSamples = v ?? false);
                          if (_useCustomSamples) _generateSamples();
                        },
                      ),
                      const SizedBox(width: 8),
                      const Text('Custom Samples'),
                    ],
                  ),
                ),
              ],
            ),
            if (_useCustomSamples)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: RefractionButton(
                  onPressed: _generateSamples,
                  child: const Text('Regenerate Samples'),
                ),
              ),
            const SizedBox(height: 24),
            Text('Intensity: ${_intensity.toStringAsFixed(2)}'),
            RefractionProgressSlider(
              value: _intensity,
              onChanged: (v) => setState(() => _intensity = v),
            ),
            const SizedBox(height: 16),
            Text('Amplitude: ${_amplitude.toStringAsFixed(2)}'),
            RefractionProgressSlider(
              value: _amplitude,
              onChanged: (v) => setState(() => _amplitude = v),
            ),
            const SizedBox(height: 16),
            Text('Smoothing: ${_smoothing.toStringAsFixed(2)}'),
            RefractionProgressSlider(
              value: _smoothing,
              onChanged: (v) => setState(() => _smoothing = v),
            ),
            const SizedBox(height: 16),
            Text('Bar Count: $_barCount'),
            Slider(
              value: _barCount.toDouble(),
              min: 4,
              max: 128,
              divisions: 124,
              onChanged: (v) => setState(() => _barCount = v.round()),
            ),
          ],
        ),
      ),
    );
  }
}
