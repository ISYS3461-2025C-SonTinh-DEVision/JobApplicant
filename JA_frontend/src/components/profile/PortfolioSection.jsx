/**
 * Portfolio Section Component - Complete Redesign
 * 
 * Features:
 * - Preview gallery: 5 images, 2 videos max displayed
 * - Edit selection for featured items
 * - View All modal for complete gallery
 * - Proper grid layout (no overlapping)
 * - Upload dropzone separated from preview
 * - Headless UI hooks integration
 * 
 * Architecture: A.3.a (Ultimo) - Headless UI pattern
 * Requirement: 3.2.3 - Portfolio images/videos management
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
    Image,
    Video,
    X,
    Trash2,
    Loader2,
    Play,
    ZoomIn,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Film,
    ImageIcon,
    Check,
    CloudUpload,
    Edit3,
    Eye,
    Plus,
    Grid3X3,
    Settings2
} from 'lucide-react';
import { useHeadlessModal, useHeadlessTabs } from '../headless';

// Constants
const MAX_PREVIEW_IMAGES = 7;
const MAX_PREVIEW_VIDEOS = 2;
const MAX_TOTAL_IMAGES = 20;
const MAX_TOTAL_VIDEOS = 5;

// ============================================================
// PORTFOLIO THUMBNAIL - Compact preview item
// ============================================================
function PortfolioThumbnail({
    item,
    isVideo = false,
    onView,
    onDelete,
    onSelect,
    isSelected = false,
    selectionMode = false,
    variant = 'dark',
    size = 'md'
}) {
    const [loaded, setLoaded] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const sizeClasses = {
        sm: 'w-16 h-16 rounded-lg',
        md: 'w-20 h-20 sm:w-24 sm:h-24 rounded-xl',
        lg: 'w-28 h-28 sm:w-32 sm:h-32 rounded-2xl',
        responsive: 'aspect-square w-full rounded-xl', // For grid layouts
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (deleting) return;
        setDeleting(true);
        try {
            await onDelete?.(item);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div
            className={`
        relative overflow-hidden cursor-pointer
        transition-all duration-300 ease-out group
        ${sizeClasses[size]}
        ${loaded ? 'opacity-100' : 'opacity-0'}
        ${selectionMode && isSelected
                    ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-800 scale-105'
                    : 'hover:scale-105 hover:shadow-xl'
                }
        ${variant === 'dark' ? 'bg-dark-700' : 'bg-gray-200'}
      `}
            onClick={() => selectionMode ? onSelect?.(item) : onView?.(item)}
        >
            {/* Media */}
            {isVideo ? (
                <>
                    <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        onLoadedData={() => setLoaded(true)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                </>
            ) : (
                <img
                    src={item.url}
                    alt={item.title || 'Portfolio'}
                    className="w-full h-full object-cover"
                    onLoad={() => setLoaded(true)}
                />
            )}

            {/* Selection checkbox */}
            {selectionMode && (
                <div className={`
          absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center
          transition-all duration-200
          ${isSelected
                        ? 'bg-primary-500 text-white'
                        : 'bg-black/50 border border-white/50'
                    }
        `}>
                    {isSelected && <Check className="w-3 h-3" />}
                </div>
            )}

            {/* Hover overlay with actions */}
            {!selectionMode && (
                <div className={`
          absolute inset-0 bg-black/60 flex items-center justify-center gap-1
          transition-opacity duration-200
          ${loaded ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}
        `}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onView?.(item); }}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="p-1.5 rounded-lg bg-red-500/50 hover:bg-red-500/70 text-white transition-colors disabled:opacity-50"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            )}

            {/* Type badge */}
            {isVideo && (
                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-violet-500/80 text-white text-[10px] font-medium flex items-center gap-0.5">
                    <Film className="w-2.5 h-2.5" />
                </div>
            )}
        </div>
    );
}

// ============================================================
// UPLOAD CARD - Dedicated upload area
// ============================================================
function UploadCard({
    onUpload,
    uploading = false,
    type = 'image',
    variant = 'dark',
    compact = false
}) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) onUpload(files[0]);
    }, [onUpload]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
            e.target.value = '';
        }
    };

    const acceptTypes = type === 'image'
        ? 'image/jpeg,image/png,image/webp,image/gif'
        : 'video/mp4,video/mov,video/avi,video/webm';

    const IconComponent = type === 'image' ? ImageIcon : Film;

    if (compact) {
        return (
            <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className={`
                    aspect-square w-full rounded-xl border-2 border-dashed
                    flex flex-col items-center justify-center gap-2
                    transition-all duration-300
                    ${isDragging
                        ? 'border-primary-400 bg-primary-500/10'
                        : variant === 'dark'
                            ? 'border-dark-600 bg-dark-800/50 hover:border-primary-500/50 hover:bg-dark-700'
                            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-gray-100'
                    }
                    ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={acceptTypes}
                    onChange={handleFileChange}
                    className="hidden"
                />
                {uploading ? (
                    <Loader2 className={`w-6 h-6 animate-spin ${variant === 'dark' ? 'text-primary-400' : 'text-primary-500'}`} />
                ) : (
                    <>
                        <Plus className={`w-6 h-6 ${variant === 'dark' ? 'text-dark-400' : 'text-gray-400'}`} />
                        <span className={`text-xs ${variant === 'dark' ? 'text-dark-500' : 'text-gray-500'}`}>
                            Add {type}
                        </span>
                    </>
                )}
            </button>
        );
    }

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        p-6 rounded-xl border-2 border-dashed
        flex flex-col items-center justify-center gap-3 cursor-pointer
        transition-all duration-300
        ${isDragging
                    ? 'border-primary-400 bg-primary-500/10 scale-[1.01]'
                    : variant === 'dark'
                        ? 'border-dark-600 bg-dark-800/30 hover:border-primary-500/50 hover:bg-dark-800/50'
                        : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-gray-100'
                }
        ${uploading ? 'opacity-50 pointer-events-none' : ''}
      `}
        >
            <input
                ref={inputRef}
                type="file"
                accept={acceptTypes}
                onChange={handleFileChange}
                className="hidden"
            />

            <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center
        ${variant === 'dark' ? 'bg-dark-700' : 'bg-gray-200'}
      `}>
                {uploading ? (
                    <CloudUpload className={`w-6 h-6 animate-bounce ${variant === 'dark' ? 'text-primary-400' : 'text-primary-500'}`} />
                ) : (
                    <IconComponent className={`w-6 h-6 ${variant === 'dark' ? 'text-dark-400' : 'text-gray-400'}`} />
                )}
            </div>

            <div className="text-center">
                <p className={`text-sm font-medium ${variant === 'dark' ? 'text-dark-300' : 'text-gray-600'}`}>
                    {uploading ? 'Uploading...' : `Click or drag ${type}`}
                </p>
                <p className={`text-xs mt-1 ${variant === 'dark' ? 'text-dark-500' : 'text-gray-400'}`}>
                    {type === 'image' ? 'JPG, PNG, WEBP, GIF • Max 5MB' : 'MP4, MOV, WEBM • Max 100MB'}
                </p>
            </div>
        </div>
    );
}

// ============================================================
// LIGHTBOX MODAL - Full screen viewer
// ============================================================
function LightboxModal({
    item,
    items = [],
    isOpen,
    onClose,
    variant = 'dark'
}) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (item && items.length > 0) {
            const idx = items.findIndex(i => i.id === item.id);
            if (idx !== -1) setCurrentIndex(idx);
        }
    }, [item, items]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(currentIndex - 1);
            if (e.key === 'ArrowRight' && currentIndex < items.length - 1) setCurrentIndex(currentIndex + 1);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose, currentIndex, items.length]);

    if (!isOpen || !item) return null;

    const current = items[currentIndex] || item;
    const isVideo = current.resourceType === 'video';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10">
                <X className="w-6 h-6" />
            </button>

            {items.length > 1 && (
                <>
                    <button
                        onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                        disabled={currentIndex === 0}
                        className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 z-10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => currentIndex < items.length - 1 && setCurrentIndex(currentIndex + 1)}
                        disabled={currentIndex === items.length - 1}
                        className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 z-10"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            <div className="max-w-5xl max-h-[90vh] w-full px-4">
                {items.length > 1 && (
                    <p className="text-white/50 text-sm text-center mb-2">{currentIndex + 1} / {items.length}</p>
                )}
                <div className="rounded-xl overflow-hidden">
                    {isVideo ? (
                        <video key={current.id} src={current.url} controls autoPlay className="w-full max-h-[80vh]" />
                    ) : (
                        <img key={current.id} src={current.url} alt={current.title || ''} className="w-full max-h-[80vh] object-contain" />
                    )}
                </div>
                {current.title && <p className="text-white text-center mt-3 text-lg">{current.title}</p>}
            </div>
        </div>
    );
}

// ============================================================
// VIEW ALL MODAL - Gallery modal
// ============================================================
function ViewAllModal({
    isOpen,
    onClose,
    items = [],
    type = 'images',
    onView,
    onDelete,
    onUpload,
    uploading = false,
    variant = 'dark'
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className={`
        relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl
        ${variant === 'dark' ? 'bg-dark-800' : 'bg-white'}
      `}>
                {/* Header */}
                <div className={`
          flex items-center justify-between p-4 border-b
          ${variant === 'dark' ? 'border-dark-700' : 'border-gray-200'}
        `}>
                    <div className="flex items-center gap-3">
                        {type === 'images' ? <ImageIcon className="w-5 h-5 text-primary-400" /> : <Film className="w-5 h-5 text-violet-400" />}
                        <h2 className={`text-lg font-semibold ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            All {type === 'images' ? 'Images' : 'Videos'} ({items.length})
                        </h2>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-lg ${variant === 'dark' ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}>
                        <X className={`w-5 h-5 ${variant === 'dark' ? 'text-dark-400' : 'text-gray-500'}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(85vh-130px)]">
                    {items.length === 0 ? (
                        <div className="py-12 text-center">
                            <UploadCard
                                onUpload={onUpload}
                                uploading={uploading}
                                type={type === 'images' ? 'image' : 'video'}
                                variant={variant}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {items.map((item) => (
                                <PortfolioThumbnail
                                    key={item.id}
                                    item={item}
                                    isVideo={type === 'videos'}
                                    onView={onView}
                                    onDelete={onDelete}
                                    variant={variant}
                                    size="lg"
                                />
                            ))}
                            <UploadCard
                                onUpload={onUpload}
                                uploading={uploading}
                                type={type === 'images' ? 'image' : 'video'}
                                variant={variant}
                                compact
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`
          flex items-center justify-between p-4 border-t
          ${variant === 'dark' ? 'border-dark-700' : 'border-gray-200'}
        `}>
                    <p className={`text-sm ${variant === 'dark' ? 'text-dark-400' : 'text-gray-500'}`}>
                        {items.length} / {type === 'images' ? MAX_TOTAL_IMAGES : MAX_TOTAL_VIDEOS} {type}
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// MAIN PORTFOLIO SECTION COMPONENT
// ============================================================
export default function PortfolioSection({
    portfolio = { images: [], videos: [] },
    loading = false,
    uploadingImage = false,
    uploadingVideo = false,
    onUploadImage,
    onUploadVideo,
    onDeleteImage,
    onDeleteVideo,
    variant = 'dark',
    className = '',
}) {
    // State
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    // Headless hooks
    const { activeTab, setActiveTab, getTabProps, getTabListProps, isActive } = useHeadlessTabs({
        tabs: ['images', 'videos'],
        defaultTab: 'images',
    });

    const lightboxModal = useHeadlessModal();
    const viewAllModal = useHeadlessModal();

    // Data
    const images = useMemo(() => portfolio.images || [], [portfolio.images]);
    const videos = useMemo(() => portfolio.videos || [], [portfolio.videos]);

    // Preview items (limited)
    const previewImages = useMemo(() => images.slice(0, MAX_PREVIEW_IMAGES), [images]);
    const previewVideos = useMemo(() => videos.slice(0, MAX_PREVIEW_VIDEOS), [videos]);

    const currentItems = activeTab === 'videos' ? videos : images;
    const previewItems = activeTab === 'videos' ? previewVideos : previewImages;
    const maxPreview = activeTab === 'videos' ? MAX_PREVIEW_VIDEOS : MAX_PREVIEW_IMAGES;

    // Auto-clear messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Handlers
    const handleView = (item) => {
        setSelectedItem(item);
        lightboxModal.open();
    };

    const handleDelete = async (item) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            if (item.resourceType === 'video') {
                await onDeleteVideo?.(item.id);
            } else {
                await onDeleteImage?.(item.id);
            }
            setSuccessMessage('Deleted successfully');
        } catch (err) {
            setError(err.message || 'Failed to delete');
        }
    };

    const handleUpload = async (file, type) => {
        setError(null);
        const maxSize = type === 'video' ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`File too large. Max ${type === 'video' ? '100MB' : '5MB'}`);
            return;
        }
        try {
            if (type === 'video') {
                await onUploadVideo?.(file);
            } else {
                await onUploadImage?.(file);
            }
            setSuccessMessage(`${type === 'video' ? 'Video' : 'Image'} uploaded!`);
        } catch (err) {
            setError(err.message || 'Upload failed');
        }
    };

    // Theme
    const cardBg = variant === 'dark' ? 'bg-dark-800/50' : 'bg-gray-50';
    const textPrimary = variant === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondary = variant === 'dark' ? 'text-dark-400' : 'text-gray-500';

    return (
        <div className={className}>
            {/* Messages */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}
            {successMessage && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Tabs - fully responsive with desktop breakpoint at 1215px */}
            <div className="flex items-center justify-between gap-2 mb-4 min-w-0" {...getTabListProps()}>
                <div className={`
                    inline-flex p-1 rounded-xl min-w-0 overflow-hidden
                    ${variant === 'dark' ? 'bg-dark-700/50' : 'bg-gray-100'}
                `}>
                    {['images', 'videos'].map((tab, idx) => {
                        const count = tab === 'images' ? images.length : videos.length;
                        const Icon = tab === 'images' ? ImageIcon : Video;
                        return (
                            <button
                                key={tab}
                                {...getTabProps(tab, idx)}
                                className={`
                                    flex items-center gap-1 desktop:gap-2 px-2 py-1.5 desktop:px-4 desktop:py-2 
                                    rounded-lg text-xs desktop:text-sm font-medium transition-all min-w-0
                                    ${isActive(tab)
                                        ? 'bg-primary-500 text-white shadow-lg'
                                        : variant === 'dark'
                                            ? 'text-dark-400 hover:text-white'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="capitalize truncate hidden desktop:inline">{tab}</span>
                                <span className={`
                                    px-1 desktop:px-1.5 py-0.5 rounded text-[10px] desktop:text-xs font-bold flex-shrink-0
                                    ${isActive(tab) ? 'bg-white/20' : variant === 'dark' ? 'bg-dark-600' : 'bg-gray-200'}
                                `}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* View All - always visible if there are items */}
                {currentItems.length > 0 && (
                    <button
                        onClick={() => viewAllModal.open()}
                        className="flex items-center gap-1 desktop:gap-1.5 text-xs desktop:text-sm text-primary-400 hover:text-primary-300 transition-colors flex-shrink-0"
                    >
                        <Grid3X3 className="w-4 h-4" />
                        <span className="hidden desktop:inline">View All</span>
                    </button>
                )}
            </div>

            {/* Preview Gallery */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`aspect-square rounded-xl animate-pulse ${variant === 'dark' ? 'bg-dark-700' : 'bg-gray-200'}`} />
                    ))}
                </div>
            ) : previewItems.length === 0 ? (
                <UploadCard
                    onUpload={(file) => handleUpload(file, activeTab === 'videos' ? 'video' : 'image')}
                    uploading={activeTab === 'videos' ? uploadingVideo : uploadingImage}
                    type={activeTab === 'videos' ? 'video' : 'image'}
                    variant={variant}
                />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previewItems.map((item) => (
                        <PortfolioThumbnail
                            key={item.id}
                            item={item}
                            isVideo={activeTab === 'videos'}
                            onView={handleView}
                            onDelete={handleDelete}
                            variant={variant}
                            size="responsive"
                        />
                    ))}

                    {/* More indicator - comes BEFORE upload button */}
                    {currentItems.length > maxPreview && (
                        <button
                            onClick={() => viewAllModal.open()}
                            className={`
                                aspect-square rounded-xl
                                flex flex-col items-center justify-center
                                transition-all duration-300 hover:scale-105
                                ${variant === 'dark' ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'}
                            `}
                        >
                            <span className={`text-xl font-bold ${variant === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                                +{currentItems.length - maxPreview}
                            </span>
                            <span className={`text-xs ${textSecondary}`}>more</span>
                        </button>
                    )}

                    {/* Add button - always last */}
                    <UploadCard
                        onUpload={(file) => handleUpload(file, activeTab === 'videos' ? 'video' : 'image')}
                        uploading={activeTab === 'videos' ? uploadingVideo : uploadingImage}
                        type={activeTab === 'videos' ? 'video' : 'image'}
                        variant={variant}
                        compact
                    />
                </div>
            )}

            {/* Counter */}
            <p className={`mt-3 text-xs ${textSecondary}`}>
                {activeTab === 'images'
                    ? `${images.length}/${MAX_TOTAL_IMAGES} images`
                    : `${videos.length}/${MAX_TOTAL_VIDEOS} videos`
                }
            </p>

            {/* Lightbox Modal */}
            <LightboxModal
                item={selectedItem}
                items={currentItems}
                isOpen={lightboxModal.isOpen}
                onClose={() => {
                    lightboxModal.close();
                    setSelectedItem(null);
                }}
                variant={variant}
            />

            {/* View All Modal */}
            <ViewAllModal
                isOpen={viewAllModal.isOpen}
                onClose={viewAllModal.close}
                items={currentItems}
                type={activeTab}
                onView={handleView}
                onDelete={handleDelete}
                onUpload={(file) => handleUpload(file, activeTab === 'videos' ? 'video' : 'image')}
                uploading={activeTab === 'videos' ? uploadingVideo : uploadingImage}
                variant={variant}
            />
        </div>
    );
}

// Export sub-components
export { PortfolioThumbnail, UploadCard, LightboxModal, ViewAllModal };
