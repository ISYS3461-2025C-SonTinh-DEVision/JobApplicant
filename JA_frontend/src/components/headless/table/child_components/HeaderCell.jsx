/**
 * Table HeaderCell Component
 * 
 * Table header cell with sorting support.
 * Uses context to access sorting state.
 */
import React from 'react';
import { useTableContext } from '../context/TableContext';

export default function HeaderCell({
    children,
    className,
    sortKey,
    sortable = true,
    as: Component = 'th',
    ...props
}) {
    const { getHeaderProps, getSortIcon } = useTableContext();

    const sortProps = sortKey && sortable ? getHeaderProps(sortKey) : {};
    const sortDirection = sortKey ? getSortIcon(sortKey) : 'none';

    return (
        <Component
            className={className}
            data-sortable={sortable || undefined}
            data-sort-direction={sortDirection !== 'none' ? sortDirection : undefined}
            {...sortProps}
            {...props}
        >
            {typeof children === 'function'
                ? children({ sortDirection, isSorted: sortDirection !== 'none' })
                : children
            }
        </Component>
    );
}
