/**
 * Card Headless Component
 * 
 * A compound component pattern for headless cards.
 * Provides card interaction logic without styling.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * <Card item={jobData} onView={handleView} onAction={handleApply}>
 *   {({ isHovered, getCardProps, getViewButtonProps, getActionButtonProps }) => (
 *     <div {...getCardProps()}>
 *       <h3>{item.title}</h3>
 *       <button {...getViewButtonProps()}>View</button>
 *       <button {...getActionButtonProps()}>Apply</button>
 *     </div>
 *   )}
 * </Card>
 */
import React, { useMemo } from 'react';
import useCard from './hooks/useCard';

function Card({
    item,
    onView,
    onAction,
    onDelete,
    onSelect,
    selected = false,
    idKey = 'id',
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    const cardState = useCard({
        item,
        onView,
        onAction,
        onDelete,
        onSelect,
        selected,
        idKey,
    });

    // Memoize to prevent unnecessary re-renders
    const contextValue = useMemo(() => cardState, [
        cardState.isHovered,
        cardState.isExpanded,
        cardState.isLoading,
        cardState.selected,
        cardState.error,
    ]);

    const cardProps = cardState.getCardProps(props);

    return (
        <Component className={className} {...cardProps}>
            {typeof children === 'function' ? children(contextValue) : children}
        </Component>
    );
}

// Re-export hook for standalone usage
Card.useCard = useCard;

export default Card;
