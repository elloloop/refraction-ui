import os

print("Generating tests...")
tests = []

# Core rendering
tests.append("renders 0 steps returning SizedBox.shrink")
tests.append("renders 1 step with no connectors")
tests.append("renders 2 steps with 1 connector vertically")
tests.append("renders 3 steps with 2 connectors vertically")
tests.append("renders 2 steps horizontally")
tests.append("renders 3 steps horizontally")

# Content
for i in range(1, 6):
    tests.append(f"renders step title properly in step {i}")
    tests.append(f"renders step description properly in step {i}")

# Default indicators
for i in range(1, 6):
    tests.append(f"renders default indicator text {i} correctly")

# Custom indicators
for i in range(1, 4):
    tests.append(f"renders custom indicator widget for step {i}")

# Step States (0..3 currentStep)
for current in range(4):
    for idx in range(3):
        tests.append(f"evaluates correct visual color state for step {idx} when currentStep is {current}")

# Layouts
tests.append("builds IntrinsicHeight in vertical mode")
tests.append("does not build IntrinsicHeight in horizontal mode")
tests.append("stretches horizontal layout items using Expanded")

# Tapping & Interactions
for i in range(3):
    tests.append(f"emits onStepTap({i}) when step {i} is tapped")
    tests.append(f"emits onStepTap({i}) when step {i} indicator is tapped")
    tests.append(f"emits onStepTap({i}) when step {i} content is tapped")

tests.append("does not build InkWell/GestureDetector when onStepTap is null")

# Custom connectors
tests.append("builds custom connector widget using connectorBuilder")
tests.append("passes correct context and index to connectorBuilder")
tests.append("passes correct state to connectorBuilder")

print(f"Generated {len(tests)} test outlines")
