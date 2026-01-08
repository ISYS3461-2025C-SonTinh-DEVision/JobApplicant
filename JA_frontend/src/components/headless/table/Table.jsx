/**
 * Table Headless Component
 * 
 * A compound component pattern for headless tables.
 * Provides sorting, selection, and expansion without styling.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * <Table data={items} defaultSortKey="name" selectable>
 *   <Table.Header>
 *     <tr>
 *       <Table.HeaderCell sortKey="name">Name</Table.HeaderCell>
 *       <Table.HeaderCell sortKey="date">Date</Table.HeaderCell>
 *     </tr>
 *   </Table.Header>
 *   <Table.Body>
 *     {({ sortedData }) => sortedData.map(item => (
 *       <Table.Row key={item.id} id={item.id}>
 *         <Table.Cell>{item.name}</Table.Cell>
 *         <Table.Cell>{item.date}</Table.Cell>
 *       </Table.Row>
 *     ))}
 *   </Table.Body>
 * </Table>
 */
import React, { useMemo } from 'react';
import { TableProvider } from './context/TableContext';
import useTable from './hooks/useTable';
import Header from './child_components/Header';
import HeaderCell from './child_components/HeaderCell';
import Body from './child_components/Body';
import Row from './child_components/Row';
import Cell from './child_components/Cell';

function Table({
    data = [],
    defaultSortKey = null,
    defaultDirection = "asc",
    selectable = false,
    expandable = false,
    idField = 'id',
    children,
    className,
    as: Component = 'table',
    ...props
}) {
    // Use the headless hook for all table logic
    const tableState = useTable({
        data,
        defaultSortKey,
        defaultDirection,
        selectable,
        expandable,
        idField,
    });

    // Memoize context value
    const contextValue = useMemo(() => tableState, [
        tableState.sortKey,
        tableState.direction,
        tableState.sortedData,
        tableState.selectedRows,
        tableState.expandedRows,
    ]);

    return (
        <TableProvider value={contextValue}>
            <Component className={className} {...props}>
                {typeof children === 'function' ? children(tableState) : children}
            </Component>
        </TableProvider>
    );
}

// Attach child components for compound component pattern
Table.Header = Header;
Table.HeaderCell = HeaderCell;
Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;

export default Table;
