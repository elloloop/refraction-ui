void main() {
  List<dynamic> generate(int current, int total, int sibling) {
    final List<dynamic> items = [];
    final boundaryCount = 1;
    final totalPageNumbersVisible = boundaryCount * 2 + 3 + sibling * 2; 
    
    if (total <= totalPageNumbersVisible) {
      for (int i = 1; i <= total; i++) items.add(i);
      return items;
    }
    
    final startPage = current - sibling;
    final endPage = current + sibling;
    
    final showLeftEllipsis = startPage > boundaryCount + 2; 
    final showRightEllipsis = endPage < total - boundaryCount - 1; 
    
    if (!showLeftEllipsis && showRightEllipsis) {
      final leftItemCount = boundaryCount + 2 + 2 * sibling; 
      for (int i = 1; i <= leftItemCount; i++) items.add(i);
      items.add('ellipsis');
      for (int i = total - boundaryCount + 1; i <= total; i++) items.add(i);
    } else if (showLeftEllipsis && !showRightEllipsis) {
      for (int i = 1; i <= boundaryCount; i++) items.add(i);
      items.add('ellipsis');
      final rightItemCount = boundaryCount + 2 + 2 * sibling;
      for (int i = total - rightItemCount + 1; i <= total; i++) items.add(i);
    } else if (showLeftEllipsis && showRightEllipsis) {
      for (int i = 1; i <= boundaryCount; i++) items.add(i);
      items.add('ellipsis');
      for (int i = startPage; i <= endPage; i++) items.add(i);
      items.add('ellipsis');
      for (int i = total - boundaryCount + 1; i <= total; i++) items.add(i);
    }
    return items;
  }
  
  for (int total = 9; total <= 11; total++) {
      print("Total $total:");
      for (int i = 1; i <= total; i++) {
          print("  $i: ${generate(i, total, 2)}");
      }
  }
}
