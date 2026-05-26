import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class CommandInputPage extends StatefulWidget {
  const CommandInputPage({super.key});

  @override
  State<CommandInputPage> createState() => _CommandInputPageState();
}

class _CommandInputPageState extends State<CommandInputPage> {
  final TextEditingController _controller = TextEditingController();

  final List<String> _users = ['alice', 'bob', 'charlie', 'david'];
  final List<String> _commands = ['help', 'settings', 'logout', 'profile'];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);

    return Scaffold(
      backgroundColor: theme.colors.background,
      appBar: AppBar(
        title: const Text('Command Input'),
        backgroundColor: theme.colors.background,
        foregroundColor: theme.colors.foreground,
        elevation: 0,
        iconTheme: IconThemeData(color: theme.colors.foreground),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Command Input',
              style: theme.data.textStyle.copyWith(
                fontSize: 24,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'A text input that triggers popovers for commands or mentions.',
              style: theme.data.textStyle.copyWith(
                color: theme.colors.mutedForeground,
              ),
            ),
            const SizedBox(height: 32),
            RefractionCommandInput(
              controller: _controller,
              placeholder: 'Type @ to mention someone or / for commands...',
              triggers: [
                CommandTrigger(char: '@', pattern: RegExp(r'^[a-zA-Z0-9]*$')),
                CommandTrigger(char: '/', pattern: RegExp(r'^[a-zA-Z]*$')),
              ],
              onCommandCommit: (trigger, search) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Committed: $trigger$search')),
                );
              },
              popoverBuilder: (context, trigger, search, close) {
                List<String> items = [];
                if (trigger == '@') {
                  items = _users
                      .where(
                        (u) => u.toLowerCase().contains(search.toLowerCase()),
                      )
                      .toList();
                } else if (trigger == '/') {
                  items = _commands
                      .where(
                        (c) => c.toLowerCase().contains(search.toLowerCase()),
                      )
                      .toList();
                }

                if (items.isEmpty) {
                  return const SizedBox.shrink();
                }

                return Container(
                  constraints: const BoxConstraints(maxHeight: 200),
                  decoration: BoxDecoration(
                    color: theme.colors.popover,
                    borderRadius: BorderRadius.circular(theme.borderRadius),
                    border: Border.all(color: theme.colors.border),
                    boxShadow: theme.data.heavyShadow,
                  ),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(4),
                    shrinkWrap: true,
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return InkWell(
                        onTap: () {
                          // Replace the search text with the selected item
                          final text = _controller.text;
                          final offset = _controller.selection.baseOffset;
                          final triggerIndex = text.lastIndexOf(
                            trigger,
                            offset - 1,
                          );
                          if (triggerIndex != -1) {
                            final newText = text.replaceRange(
                              triggerIndex,
                              offset,
                              '$trigger$item ',
                            );
                            _controller.value = TextEditingValue(
                              text: newText,
                              selection: TextSelection.collapsed(
                                offset:
                                    triggerIndex +
                                    trigger.length +
                                    item.length +
                                    1,
                              ),
                            );
                          }
                          close();
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          child: Text(
                            item,
                            style: theme.data.textStyle.copyWith(
                              color: theme.colors.popoverForeground,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
