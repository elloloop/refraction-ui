import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionFileUpload renders drop zone properly', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(const RefractionFileUpload(files: [])),
    );

    expect(find.text('Drop files here or click to upload'), findsOneWidget);
    expect(find.text('Any file type is supported'), findsOneWidget);
    expect(find.byIcon(Icons.upload_file), findsOneWidget);
  });

  testWidgets('RefractionFileUpload renders single file entry', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionFileUpload(
          files: [
            RefractionFileEntry(
              id: '1',
              name: 'document.pdf',
              size: 1024,
              type: 'application/pdf',
            ),
          ],
        ),
      ),
    );

    expect(find.text('document.pdf'), findsOneWidget);
    expect(find.text('1.0 KB'), findsOneWidget);
    expect(find.byIcon(Icons.insert_drive_file), findsOneWidget);
  });

  testWidgets('RefractionFileUpload handles errors', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionFileUpload(
          files: [
            RefractionFileEntry(
              id: '1',
              name: 'video.mp4',
              size: 2048000,
              type: 'video/mp4',
              status: RefractionFileStatus.error,
              error: 'File too large',
            ),
          ],
        ),
      ),
    );

    expect(find.text('video.mp4'), findsOneWidget);
    expect(find.text('File too large'), findsOneWidget);
    expect(find.byIcon(Icons.error), findsOneWidget);
  });

  testWidgets('RefractionFileUpload executes onTapDropZone', (
    WidgetTester tester,
  ) async {
    bool tapped = false;

    await tester.pumpWidget(
      buildTestApp(
        RefractionFileUpload(
          files: const [],
          onTapDropZone: () {
            tapped = true;
          },
        ),
      ),
    );

    await tester.tap(find.text('Drop files here or click to upload'));
    await tester.pumpAndSettle();

    expect(tapped, isTrue);
  });

  testWidgets('RefractionFileUpload executes onRemoveFile', (
    WidgetTester tester,
  ) async {
    String? removedId;

    await tester.pumpWidget(
      buildTestApp(
        RefractionFileUpload(
          files: const [
            RefractionFileEntry(
              id: 'xyz-123',
              name: 'image.png',
              size: 512,
              type: 'image/png',
            ),
          ],
          onRemoveFile: (id) {
            removedId = id;
          },
        ),
      ),
    );

    await tester.tap(find.byIcon(Icons.close));
    await tester.pumpAndSettle();

    expect(removedId, 'xyz-123');
  });

  testWidgets('RefractionFileUpload is disabled properly', (
    WidgetTester tester,
  ) async {
    bool tapped = false;

    await tester.pumpWidget(
      buildTestApp(
        RefractionFileUpload(
          files: const [],
          disabled: true,
          onTapDropZone: () {
            tapped = true;
          },
        ),
      ),
    );

    await tester.tap(find.text('Drop files here or click to upload'));
    await tester.pumpAndSettle();

    expect(tapped, isFalse);
  });

  testWidgets('RefractionFileUpload shows progress correctly', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionFileUpload(
          files: [
            RefractionFileEntry(
              id: '1',
              name: 'uploading.pdf',
              size: 1024,
              type: 'application/pdf',
              status: RefractionFileStatus.uploading,
              progress: 0.5,
            ),
          ],
        ),
      ),
    );

    expect(find.text('uploading.pdf'), findsOneWidget);
    // The fraction is 0.5, we check if FractionallySizedBox is found
    expect(find.byType(FractionallySizedBox), findsOneWidget);
  });
}
