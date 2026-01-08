/**
 * Table Row Component
 * 
 * Table row with selection and expansion support.
 */
import React from 'react';
import { useTableContext } from '../context/TableContext';

export default function Row({
    children,
    className,
    id,
    onClick,
    as: Component = 'tr',
    ...props
}) {
    const { getRowProps, isSelected, isExpanded, selectRow } = useTableContext();

    const rowProps = id ? getRowProps(id) : {};
    const selected = id ? isSelected(id) : false;
    const expanded = id ? isExpanded(id) : false;

    const handleClick = (e) => {
        if (onClick) {
            onClick(e, { id, selected, expanded });
        }
    };

    return (
        <Component
            className={className}
            onClick={handleClick}
            data-selected={selected || undefined}
            data-expanded={expanded || undefined}
            {...rowProps}
            {...props}
        >
            {typeof children === 'function'
                ? children({ selected, expanded, selectRow: () => selectRow(id) })
                : children
            }
        </Component>
    );
}
