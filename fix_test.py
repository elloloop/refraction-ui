import re

with open('packages/flutter/test/table_of_contents_test.dart', 'r') as f:
    content = f.read()

content = content.replace('find.ancestor(of: activeFinder, matching: find.byType(AnimatedDefaultTextStyle))', 'find.ancestor(of: activeFinder, matching: find.byType(AnimatedDefaultTextStyle)).first')
content = content.replace('find.ancestor(of: otherFinder, matching: find.byType(AnimatedDefaultTextStyle))', 'find.ancestor(of: otherFinder, matching: find.byType(AnimatedDefaultTextStyle)).first')
content = content.replace('find.ancestor(of: textFinder, matching: find.byType(AnimatedDefaultTextStyle))', 'find.ancestor(of: textFinder, matching: find.byType(AnimatedDefaultTextStyle)).first')

with open('packages/flutter/test/table_of_contents_test.dart', 'w') as f:
    f.write(content)
