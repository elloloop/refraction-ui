import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class MyPrototypeApp extends StatelessWidget {
  const MyPrototypeApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    // Edit this file to prototype your new responsive UI!
    // This is hot-reloaded automatically.
    
    return Scaffold(
      backgroundColor: colors.background,
      appBar: RefractionNavbar(
        logo: Icon(Icons.rocket_launch, color: colors.primary),
        links: const [
          NavLink(label: "Home", href: "/"),
          NavLink(label: "Analytics", href: "/analytics"),
        ],
        currentPath: "/",
        onNavigate: (_) {},
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "My Canvas",
                style: theme.textStyle.copyWith(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "Use this screen to build your app using Refraction tokens.",
                style: theme.textStyle.copyWith(
                  color: colors.mutedForeground,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 32),
              RefractionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const RefractionCardHeader(
                      child: RefractionCardTitle("Getting Started"),
                    ),
                    RefractionCardContent(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "You have full access to:",
                            style: theme.textStyle.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 12),
                          const Row(
                            children: [
                              Icon(Icons.check_circle, size: 16, color: Colors.green),
                              SizedBox(width: 8),
                              Text("Colors (theme.colors.primary)"),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Row(
                            children: [
                              Icon(Icons.check_circle, size: 16, color: Colors.green),
                              SizedBox(width: 8),
                              Text("Typography (theme.textStyle)"),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Row(
                            children: [
                              Icon(Icons.check_circle, size: 16, color: Colors.green),
                              SizedBox(width: 8),
                              Text("Shadows & Gradients"),
                            ],
                          ),
                        ],
                      ),
                    ),
                    RefractionCardFooter(
                      mainAxisAlignment: MainAxisAlignment.end,
                      child: RefractionButton(
                        onPressed: () {},
                        child: const Text("Deploy Now"),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
