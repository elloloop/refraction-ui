'use client'

import * as React from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@refraction-ui/react-table'
import { Badge } from '@refraction-ui/react-badge'
import { Button } from '@refraction-ui/react-button'

interface TableExamplesProps {
  section: 'basic' | 'compact'
}

const orders = [
  { id: '1001', customer: 'Ada Lovelace', status: 'Shipped', total: '$1,200.00' },
  { id: '1002', customer: 'Alan Turing', status: 'Pending', total: '$84.50' },
  { id: '1003', customer: 'Grace Hopper', status: 'Shipped', total: '$312.00' },
]

export function TableExamples({ section }: TableExamplesProps) {
  const compact = section === 'compact'
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Table density={compact ? 'compact' : 'default'} headTone={compact ? 'eyebrow' : 'default'}>
        <TableCaption>Recent orders</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="end">Total</TableHead>
            {!compact && <TableHead align="end"><span className="sr-only">Actions</span></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell numeric>#{o.id}</TableCell>
              <TableCell>{o.customer}</TableCell>
              <TableCell>
                <Badge variant={o.status === 'Shipped' ? 'default' : 'secondary'}>{o.status}</Badge>
              </TableCell>
              <TableCell align="end" numeric>{o.total}</TableCell>
              {!compact && (
                <TableCell align="end">
                  <Button size="sm" variant="ghost">View</Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
