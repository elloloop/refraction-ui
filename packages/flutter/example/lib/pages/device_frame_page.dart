import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class DeviceFramePage extends StatelessWidget {
  const DeviceFramePage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Device Frame",
      description: "A visual frame representing a device screen.",
      child: Center(
        child: Wrap(
          spacing: 32,
          runSpacing: 32,
          alignment: WrapAlignment.center,
          children: [
            RefractionDeviceFrame(
              device: RefractionDeviceType.iphone,
              orientation: RefractionDeviceOrientation.portrait,
              child: Center(child: Text("iPhone Portrait")),
            ),
            RefractionDeviceFrame(
              device: RefractionDeviceType.ipad,
              orientation: RefractionDeviceOrientation.landscape,
              child: Center(child: Text("iPad Landscape")),
            ),
          ],
        ),
      ),
    );
  }
}
