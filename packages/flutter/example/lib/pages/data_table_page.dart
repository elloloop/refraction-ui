import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class DataTablePage extends StatefulWidget {
  const DataTablePage({super.key});

  @override
  State<DataTablePage> createState() => _DataTablePageState();
}

class _DataTablePageState extends State<DataTablePage> {
  final List<Map<String, String>> _data = [
    {'id': 'm5gr84i9', 'amount': '\$316.00', 'status': 'Success', 'email': 'ken99@yahoo.com'},
    {'id': '3u1reuv4', 'amount': '\$242.00', 'status': 'Success', 'email': 'Abe45@gmail.com'},
    {'id': 'derv1ws0', 'amount': '\$837.00', 'status': 'Processing', 'email': 'Monserrat44@gmail.com'},
    {'id': '5kma53ae', 'amount': '\$874.00', 'status': 'Success', 'email': 'Silas22@gmail.com'},
    {'id': 'bhqecj4p', 'amount': '\$721.00', 'status': 'Failed', 'email': 'carmella@hotmail.com'},
  ];

  late List<DataTableColumn<Map<String, String>>> _columns;

  @override
  void initState() {
    super.initState();
    _columns = [
      DataTableColumn(
        id: 'status',
        header: 'Status',
        accessor: (row) => row['status']!,
        sortable: true,
        filterable: true,
      ),
      DataTableColumn(
        id: 'email',
        header: 'Email',
        accessor: (row) => row['email']!,
        sortable: true,
        filterable: true,
      ),
      DataTableColumn(
        id: 'amount',
        header: 'Amount',
        accessor: (row) => row['amount']!,
        sortable: true,
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Table'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Basic Data Table',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                side: BorderSide(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: RefractionDataTable<Map<String, String>>(
                  columns: _columns,
                  data: _data,
                ),
              ),
            ),
            const SizedBox(height: 48),
            const Text(
              'Empty State Data Table',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                side: BorderSide(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: RefractionDataTable<Map<String, String>>(
                  columns: _columns,
                  data: const [],
                  emptyMessage: 'No results found.',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
