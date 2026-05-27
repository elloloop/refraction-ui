import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

class DataTableColumn<T> {
  final String id;
  final String header;
  final String Function(T row) accessor;
  final bool sortable;
  final bool filterable;

  const DataTableColumn({
    required this.id,
    required this.header,
    required this.accessor,
    this.sortable = false,
    this.filterable = false,
  });
}

enum SortDirection { asc, desc }

class RefractionDataTable<T> extends StatefulWidget {
  final List<DataTableColumn<T>> columns;
  final List<T> data;
  final String? sortBy;
  final SortDirection sortDir;
  final void Function(String columnId, SortDirection direction)? onSort;
  final Map<String, String>? filters;
  final void Function(String columnId, String value)? onFilter;
  final String emptyMessage;

  const RefractionDataTable({
    super.key,
    required this.columns,
    required this.data,
    this.sortBy,
    this.sortDir = SortDirection.asc,
    this.onSort,
    this.filters,
    this.onFilter,
    this.emptyMessage = 'No data available',
  });

  @override
  State<RefractionDataTable<T>> createState() => _RefractionDataTableState<T>();
}

class _RefractionDataTableState<T> extends State<RefractionDataTable<T>> {
  String? _sortBy;
  SortDirection _sortDir = SortDirection.asc;
  Map<String, String> _filters = {};
  late Map<String, TextEditingController> _filterControllers;
  int? _hoveredRowIndex;

  @override
  void initState() {
    super.initState();
    _sortBy = widget.sortBy;
    _sortDir = widget.sortDir;
    if (widget.filters != null) {
      _filters = Map.from(widget.filters!);
    }
    _filterControllers = {};
    for (var col in widget.columns) {
      if (col.filterable) {
        _filterControllers[col.id] =
            TextEditingController(text: _filters[col.id] ?? '');
      }
    }
  }

  @override
  void didUpdateWidget(RefractionDataTable<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.sortBy != oldWidget.sortBy) {
      _sortBy = widget.sortBy;
    }
    if (widget.sortDir != oldWidget.sortDir) {
      _sortDir = widget.sortDir;
    }
    if (widget.filters != oldWidget.filters) {
      _filters = Map.from(widget.filters ?? {});
      for (var col in widget.columns) {
        if (col.filterable) {
          if (_filterControllers[col.id]?.text != _filters[col.id]) {
            _filterControllers[col.id]?.text = _filters[col.id] ?? '';
          }
        }
      }
    }

    final newFilterableIds =
        widget.columns.where((c) => c.filterable).map((c) => c.id).toSet();
    final oldFilterableIds =
        oldWidget.columns.where((c) => c.filterable).map((c) => c.id).toSet();

    for (var id in oldFilterableIds.difference(newFilterableIds)) {
      _filterControllers[id]?.dispose();
      _filterControllers.remove(id);
    }
    for (var id in newFilterableIds.difference(oldFilterableIds)) {
      _filterControllers[id] =
          TextEditingController(text: _filters[id] ?? '');
    }
  }

  @override
  void dispose() {
    for (var controller in _filterControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  void _handleSort(String columnId) {
    final col = widget.columns.firstWhere(
      (c) => c.id == columnId,
      orElse: () => widget.columns.first,
    );
    if (!col.sortable) return;

    SortDirection newDir = SortDirection.asc;
    if (_sortBy == columnId) {
      newDir = _sortDir == SortDirection.asc
          ? SortDirection.desc
          : SortDirection.asc;
    }

    setState(() {
      _sortBy = columnId;
      _sortDir = newDir;
    });

    widget.onSort?.call(columnId, newDir);
  }

  void _handleFilter(String columnId, String value) {
    setState(() {
      _filters[columnId] = value;
    });
    widget.onFilter?.call(columnId, value);
  }

  List<T> _getFilteredAndSortedData() {
    List<T> result = List.from(widget.data);

    for (final entry in _filters.entries) {
      final filterValue = entry.value;
      if (filterValue.isEmpty) continue;

      final col = widget.columns.firstWhere(
        (c) => c.id == entry.key,
        orElse: () => widget.columns.first,
      );
      if (col.id != entry.key) continue;

      final lowerFilter = filterValue.toLowerCase();
      result = result.where((row) {
        final cellValue = col.accessor(row);
        return cellValue.toLowerCase().contains(lowerFilter);
      }).toList();
    }

    if (_sortBy != null) {
      final col = widget.columns.firstWhere(
        (c) => c.id == _sortBy,
        orElse: () => widget.columns.first,
      );
      if (col.id == _sortBy) {
        result.sort((a, b) {
          final aVal = col.accessor(a).toLowerCase();
          final bVal = col.accessor(b).toLowerCase();
          final cmp = aVal.compareTo(bVal);
          return _sortDir == SortDirection.asc ? cmp : -cmp;
        });
      }
    }

    return result;
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final sortedData = _getFilteredAndSortedData();
    final hasFilterable = widget.columns.any((c) => c.filterable);

    return LayoutBuilder(
      builder: (context, constraints) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: ConstrainedBox(
                constraints: BoxConstraints(minWidth: constraints.maxWidth),
                child: Table(
                  defaultColumnWidth: const IntrinsicColumnWidth(),
                  border: TableBorder(
                    horizontalInside: BorderSide(color: theme.colors.border),
                    bottom: BorderSide(color: theme.colors.border),
                  ),
                  defaultVerticalAlignment: TableCellVerticalAlignment.middle,
                  children: [
                    TableRow(
                      children: widget.columns.map((col) {
                        return _buildHeaderCell(theme, col);
                      }).toList(),
                    ),
                    if (hasFilterable)
                      TableRow(
                        children: widget.columns.map((col) {
                          return _buildFilterCell(theme, col);
                        }).toList(),
                      ),
                    ...List.generate(sortedData.length, (index) {
                      final row = sortedData[index];
                      final isHovered = _hoveredRowIndex == index;
                      return TableRow(
                        decoration: BoxDecoration(
                          color: isHovered
                              ? theme.colors.muted.withOpacity(0.5)
                              : Colors.transparent,
                        ),
                        children: widget.columns.map((col) {
                          return MouseRegion(
                            onEnter: (_) =>
                                setState(() => _hoveredRowIndex = index),
                            onExit: (_) {
                              if (_hoveredRowIndex == index) {
                                setState(() => _hoveredRowIndex = null);
                              }
                            },
                            child: _buildDataCell(theme, col.accessor(row)),
                          );
                        }).toList(),
                      );
                    }),
                  ],
                ),
              ),
            ),
            if (sortedData.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: theme.colors.border),
                  ),
                ),
                child: Text(
                  widget.emptyMessage,
                  style: theme.textStyle.copyWith(
                    color: theme.colors.mutedForeground,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildHeaderCell(RefractionThemeData theme, DataTableColumn<T> col) {
    Widget content = Text(
      col.header,
      style: theme.textStyle.copyWith(
        fontWeight: FontWeight.w500,
        color: theme.colors.mutedForeground,
      ),
    );

    if (col.sortable) {
      content = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          content,
          if (_sortBy == col.id) ...[
            const SizedBox(width: 4),
            Icon(
              _sortDir == SortDirection.asc
                  ? Icons.arrow_upward
                  : Icons.arrow_downward,
              size: 14,
              color: theme.colors.foreground,
            ),
          ],
        ],
      );
    }

    Widget cell = Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      alignment: Alignment.centerLeft,
      child: content,
    );

    if (col.sortable) {
      cell = InkWell(
        onTap: () => _handleSort(col.id),
        child: cell,
      );
    }

    return cell;
  }

  Widget _buildFilterCell(RefractionThemeData theme, DataTableColumn<T> col) {
    if (!col.filterable) {
      return Container(
        height: 40,
        padding: const EdgeInsets.symmetric(horizontal: 8),
      );
    }

    return Container(
      height: 40,
      padding: const EdgeInsets.all(4),
      alignment: Alignment.centerLeft,
      child: TextField(
        controller: _filterControllers[col.id],
        decoration: InputDecoration(
          hintText: 'Filter...',
          hintStyle: theme.textStyle.copyWith(
            color: theme.colors.mutedForeground,
            fontSize: 12,
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 8,
            vertical: 4,
          ),
          isDense: true,
          border: OutlineInputBorder(
            borderSide: BorderSide(color: theme.colors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderSide: BorderSide(color: theme.colors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(color: theme.colors.primary),
          ),
        ),
        style: theme.textStyle.copyWith(fontSize: 12),
        onChanged: (value) => _handleFilter(col.id, value),
      ),
    );
  }

  Widget _buildDataCell(RefractionThemeData theme, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      alignment: Alignment.centerLeft,
      child: Text(
        text,
        style: theme.textStyle,
      ),
    );
  }
}
