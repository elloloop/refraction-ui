import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Playground', type: RefractionMascot)
Widget mascotPlaygroundUseCase(BuildContext context) {
  return const _MascotPlayground();
}

@widgetbook.UseCase(name: 'Moods Showcase', type: RefractionMascot)
Widget mascotMoodsUseCase(BuildContext context) {
  return const Center(
    child: SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Padding(
        padding: EdgeInsets.all(24.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                RefractionMascot(
                  size: 150.0,
                  mood: MascotMood.happy,
                ),
                SizedBox(height: 8.0),
                Text('Happy (Default)'),
              ],
            ),
            SizedBox(width: 32.0),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                RefractionMascot(
                  size: 150.0,
                  mood: MascotMood.wave,
                ),
                SizedBox(height: 8.0),
                Text('Wave'),
              ],
            ),
            SizedBox(width: 32.0),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                RefractionMascot(
                  size: 150.0,
                  mood: MascotMood.think,
                ),
                SizedBox(height: 8.0),
                Text('Think'),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}

class _MascotPlayground extends StatefulWidget {
  const _MascotPlayground();

  @override
  State<_MascotPlayground> createState() => _MascotPlaygroundState();
}

class _MascotPlaygroundState extends State<_MascotPlayground> {
  MascotMood _mood = MascotMood.happy;
  double _size = 200.0;
  bool _animate = true;
  bool _animateBobbing = true;
  bool _animateBlinking = true;
  bool _animateSprout = true;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return Center(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: colors.muted.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(color: colors.border),
                ),
                padding: const EdgeInsets.all(32.0),
                child: RefractionMascot(
                  size: _size,
                  mood: _mood,
                  animate: _animate,
                  animateBobbing: _animateBobbing,
                  animateBlinking: _animateBlinking,
                  animateSprout: _animateSprout,
                ),
              ),
              const SizedBox(height: 24.0),
              // Controls container
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: SizedBox(
                    width: 320.0,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Mood',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: colors.foreground,
                          ),
                        ),
                        Row(
                          children: MascotMood.values.map((m) {
                            return Expanded(
                              child: RadioListTile<MascotMood>(
                                contentPadding: EdgeInsets.zero,
                                title: Text(
                                  m.name,
                                  style: const TextStyle(fontSize: 12.0),
                                ),
                                value: m,
                                groupValue: _mood,
                                onChanged: (val) {
                                  if (val != null) {
                                    setState(() {
                                      _mood = val;
                                    });
                                  }
                                },
                              ),
                            );
                          }).toList(),
                        ),
                        const Divider(),
                        Text(
                          'Size: ${_size.toInt()}px',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: colors.foreground,
                          ),
                        ),
                        Slider(
                          min: 80.0,
                          max: 300.0,
                          value: _size,
                          onChanged: (val) {
                            setState(() {
                              _size = val;
                            });
                          },
                        ),
                        const Divider(),
                        Text(
                          'Animations',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: colors.foreground,
                          ),
                        ),
                        SwitchListTile(
                          dense: true,
                          title: const Text('Animate (Master)'),
                          value: _animate,
                          onChanged: (val) {
                            setState(() {
                              _animate = val;
                            });
                          },
                        ),
                        SwitchListTile(
                          dense: true,
                          title: const Text('Animate Bobbing'),
                          value: _animateBobbing,
                          onChanged: _animate
                              ? (val) {
                                  setState(() {
                                    _animateBobbing = val;
                                  });
                                }
                              : null,
                        ),
                        SwitchListTile(
                          dense: true,
                          title: const Text('Animate Blinking'),
                          value: _animateBlinking,
                          onChanged: _animate
                              ? (val) {
                                  setState(() {
                                    _animateBlinking = val;
                                  });
                                }
                              : null,
                        ),
                        SwitchListTile(
                          dense: true,
                          title: const Text('Animate Sprout'),
                          value: _animateSprout,
                          onChanged: _animate
                              ? (val) {
                                  setState(() {
                                    _animateSprout = val;
                                  });
                                }
                              : null,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
