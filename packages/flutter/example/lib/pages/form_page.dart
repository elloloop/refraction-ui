import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class FormPage extends StatefulWidget {
  const FormPage({super.key});

  @override
  State<FormPage> createState() => _FormPageState();
}

class _FormPageState extends State<FormPage> {
  Future<void> _submitSuccess() async {
    await Future.delayed(const Duration(seconds: 1));
  }

  Future<void> _submitError() async {
    await Future.delayed(const Duration(seconds: 1));
    throw Exception('Invalid username or password.');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Form Component')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'RefractionForm',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              'A form wrapper that manages submission state, validation, and error display.',
            ),
            const SizedBox(height: 32),

            const Text(
              'Successful Submission',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: RefractionForm(
                  onSubmit: _submitSuccess,
                  onSuccess: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Form submitted successfully!'),
                      ),
                    );
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Username'),
                      const SizedBox(height: 8),
                      TextFormField(
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          hintText: 'Enter username',
                        ),
                        validator: (value) =>
                            value == null || value.isEmpty ? 'Required' : null,
                      ),
                      const SizedBox(height: 16),
                      Builder(
                        builder: (context) {
                          final isLoading = RefractionForm.isLoading(context);
                          return ElevatedButton(
                            onPressed: isLoading
                                ? null
                                : () => RefractionForm.of(context)?.submit(),
                            child: isLoading
                                ? const CircularProgressIndicator()
                                : const Text('Submit'),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 32),

            const Text(
              'Submission with Error',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: RefractionForm(
                  onSubmit: _submitError,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Email'),
                      const SizedBox(height: 8),
                      TextFormField(
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          hintText: 'Enter email',
                        ),
                        validator: (value) =>
                            value == null || value.isEmpty ? 'Required' : null,
                      ),
                      const SizedBox(height: 16),
                      Builder(
                        builder: (context) {
                          final isLoading = RefractionForm.isLoading(context);
                          return ElevatedButton(
                            onPressed: isLoading
                                ? null
                                : () => RefractionForm.of(context)?.submit(),
                            child: isLoading
                                ? const CircularProgressIndicator()
                                : const Text('Submit'),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
