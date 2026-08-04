# Enterprise Generic Data Table Foundation (Step 10.1)

A robust, generic, and fully accessible tabular rendering engine built on top of Material UI's Table and semantic HTML5 elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`).

## Features

- **Generic Typings**: Strongly-typed data rows and cell templates using TypeScript generics (`TData`).
- **Semantic markup**: Custom component parts map to HTML elements with complete ARIA attributes.
- **Visual styling variants**: Supports alternate striping, hover feedback, bordered columns, and compact spacing.
- **Status overlays**: Standardized loading progression bars and empty list notifications.

## Usage Example

```typescript
import { DataTable, IDataTableColumn } from '@/shared/components/table';

interface IUser {
  id: string;
  name: string;
  email: string;
}

const columns: IDataTableColumn<IUser>[] = [
  { id: 'id', header: 'ID', field: 'id', width: 80 },
  { id: 'name', header: 'Name', field: 'name' },
  { id: 'email', header: 'Email Address', field: 'email', render: (val) => <a href={`mailto:${val}`}>{val}</a> },
];

const UserTable = () => {
  const users: IUser[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' }
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      rowKey={(u) => u.id}
      hover
      striped
    />
  );
};
```

## Accessibility (a11y)

- **Semantic HTML**: Renders `th` with `scope="col"` inside `thead` and `td` inside `tbody` for structured assistive navigation.
- **Loading State**: Operates with `aria-busy` when fetching dataset.
- **Linear Progress**: Renders linear spinner with associated `aria-label` description.
