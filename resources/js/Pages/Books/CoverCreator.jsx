import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { HexColorPicker } from "react-colorful";
import { AlignLeft, AlignCenter, AlignRight, Layers, ArrowUp, ArrowDown, Type, Palette } from "lucide-react";

export default function CoverCreator({ book }) {
    // Save states
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(!book.cover_data); // Show guidelines on first visit
    const [activeTab, setActiveTab] = useState('background');
    const [canvasScale, setCanvasScale] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [bgImage, setBgImage] = useState(null); // State for front cover background
    const [backBgImage, setBackBgImage] = useState(null); // State for back cover background
    const [spineBgImage, setSpineBgImage] = useState(null); // State for spine background
    const [bgTarget, setBgTarget] = useState('front'); // 'front', 'back', or 'spine' - which cover to apply bg to
    const [showColorPicker, setShowColorPicker] = useState(false); // Popover state

    const [textSubTab, setTextSubTab] = useState('style'); // 'add' or 'style'
    const [isSearching, setIsSearching] = useState(false);
    const [totalHits, setTotalHits] = useState(0); // Total results from API
    const [searchPage, setSearchPage] = useState(1); // Current page for pagination
    const [lastSearchQuery, setLastSearchQuery] = useState(''); // Track last search for loading more
    const [searchSource, setSearchSource] = useState('stock'); // 'stock' or 'ai'

    // Advanced State for Canvas Elements (Unified 0-100% System)
    // 0-48% = Back Cover | 48-52% = Spine | 52-100% = Front Cover
    const [coverElements, setCoverElements] = useState({
        // Front Cover Elements
        title: { id: 'title', x: 75, y: 15, text: book.title, fontSize: 48, color: '#ffffff', fontFamily: 'font-serif', textAlign: 'center', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 0, lineHeight: 1.2, isDragging: false },
        subtitle: { id: 'subtitle', x: 75, y: 25, text: book.subtitle || 'Subtitle', fontSize: 20, color: '#d1d5db', fontFamily: 'font-light', textAlign: 'center', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 2, lineHeight: 1.4, isDragging: false },
        author: { id: 'author', x: 75, y: 50, text: book.author_name, fontSize: 16, color: '#ffffff', fontFamily: 'font-sans', textAlign: 'center', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 1, lineHeight: 1.4, isDragging: false },

        // Back Cover Elements
        backTitle: { id: 'backTitle', x: 25, y: 15, text: 'AUTHOR BIO', fontSize: 14, color: '#ffffff', fontFamily: 'font-sans', textAlign: 'center', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 1, lineHeight: 1.4, isDragging: false },
        backBody: { id: 'backBody', x: 25, y: 30, text: "Just like the book's description, the author biography is also an essential marketing tool for the book. Let your readers know about your background.", fontSize: 10, color: '#e5e7eb', fontFamily: 'font-sans', textAlign: 'left', width: 30, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 0, lineHeight: 1.6, isDragging: false },

        // Spine Elements (x ~50%)
        spineTitle: { id: 'spineTitle', x: 49.5, y: 40, text: book.title, fontSize: 12, color: '#000000', fontFamily: 'font-serif', textAlign: 'center', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 1, lineHeight: 1.2, rotation: -90, isDragging: false },
        spineAuthor: { id: 'spineAuthor', x: 49.5, y: 70, text: book.author_name, fontSize: 10, color: '#666666', fontFamily: 'font-sans', textAlign: 'center', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 1, lineHeight: 1.2, rotation: -90, isDragging: false }
    });

    // Shape Elements State
    const [shapeElements, setShapeElements] = useState({});

    const [selectedId, setSelectedId] = useState(null);
    const [selectedShapeId, setSelectedShapeId] = useState(null);
    const [editingId, setEditingId] = useState(null); // For inline text editing
    const dragOffset = useRef({ x: 0, y: 0 });
    const inlineEditRef = useRef(null);
    const autoSaveTimerRef = useRef(null);
    const uploadInputRef = useRef(null);
    const resizeState = useRef({ active: false, id: null, handle: null, startFontSize: 0, startX: 0, startY: 0 });
    const rotateState = useRef({ active: false, id: null, startAngle: 0, startRotation: 0, centerX: 0, centerY: 0 });

    // Ref for capturing the cover image
    const captureRef = useRef(null);

    // Load saved cover data on mount
    useEffect(() => {
        if (book.cover_data) {
            if (book.cover_data.textElements) {
                setCoverElements(book.cover_data.textElements);
            }
            if (book.cover_data.shapeElements) {
                setShapeElements(book.cover_data.shapeElements);
            }
            if (book.cover_data.bgImage) {
                setBgImage(book.cover_data.bgImage);
            }
            if (book.cover_data.backBgImage) {
                setBackBgImage(book.cover_data.backBgImage);
            }
            if (book.cover_data.spineBgImage) {
                setSpineBgImage(book.cover_data.spineBgImage);
            }
        }
    }, []);

    // Auto-save function
    // Auto-save function with Image Capture
    // Auto-save function with Image Capture
    const saveCoverData = useCallback(async () => {
        setSaveStatus('saving');
        try {
            // 1. Capture the Hidden Front Cover View
            if (!captureRef.current) return false;

            const canvas = await html2canvas(captureRef.current, {
                useCORS: true,
                scale: 1.5, // Good balance of quality and file size
                backgroundColor: '#ffffff'
            });

            // Promisify toBlob to ensure we wait for it
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

            const formData = new FormData();
            // Send JSON data as string (backend handles decoding)
            formData.append('cover_data', JSON.stringify({
                textElements: coverElements,
                shapeElements: shapeElements,
                bgImage: bgImage,
                backBgImage: backBgImage,
                spineBgImage: spineBgImage
            }));

            // Send Image File
            if (blob) {
                formData.append('cover_image', blob, 'cover_front.png');
            }

            // Send Request
            const response = await axios.post(route('books.save-cover', book.id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setSaveStatus('saved');
                setLastSavedAt(new Date());
                return true;
            }
            return false;
        } catch (error) {
            console.error('Save failed:', error);
            setSaveStatus('error');
            return false;
        }
    }, [coverElements, shapeElements, bgImage, backBgImage, spineBgImage, book.id]);

    // Auto-save when elements change (debounced)
    useEffect(() => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
            saveCoverData();
        }, 3000); // Auto-save 3 seconds after last change

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [coverElements, shapeElements, bgImage, backBgImage, spineBgImage]);



    const handleRotateStart = (e, id) => {
        e.stopPropagation();
        e.preventDefault();

        const el = coverElements[id];
        const container = e.currentTarget.closest('.relative.overflow-hidden'); // Find canvas container
        const rect = container.getBoundingClientRect();

        // Calculate element center in pixels
        const centerX = rect.left + (el.x / 100) * rect.width;
        const centerY = rect.top + (el.y / 100) * rect.height;

        // Calculate initial angle
        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

        rotateState.current = {
            active: true,
            id,
            startAngle,
            startRotation: el.rotation || 0,
            centerX,
            centerY
        };
        setSelectedId(id);
    };

    const handleTextResizeStart = (e, id, handle) => {
        e.stopPropagation();
        e.preventDefault();
        resizeState.current = {
            active: true,
            id,
            handle,
            startFontSize: coverElements[id].fontSize,
            startX: e.clientX,
            startY: e.clientY
        };
        setSelectedId(id);
    };

    const handleDragStart = (e, id) => {
        e.stopPropagation();
        const el = coverElements[id];
        // Calculate offset (click position vs element position) needed if we were using pixels,
        // but for % based simple drag, we just set dragging true.
        // For smoother drag, we'll store the mouse starting point.
        dragOffset.current = { x: e.clientX, y: e.clientY };

        setCoverElements(prev => ({
            ...prev,
            [id]: { ...prev[id], isDragging: true }
        }));
        setSelectedId(id);
    };

    const handleCanvasMouseMove = (e) => {
        // Handle Rotation
        if (rotateState.current.active) {
            const { id, startAngle, startRotation, centerX, centerY } = rotateState.current;

            // Calculate new angle
            const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

            // Calculate rotation change (in degrees)
            const angleDelta = (currentAngle - startAngle) * (180 / Math.PI);

            // Snap to 45 degree increments if specific key pressed (optional, skipping for now)
            let newRotation = startRotation + angleDelta;

            setCoverElements(prev => ({
                ...prev,
                [id]: { ...prev[id], rotation: newRotation }
            }));
            return;
        }

        // Handle Resizing
        if (resizeState.current.active) {
            const { id, handle, startFontSize, startY } = resizeState.current;
            // Simple resizing logic: drag down/right increases size
            const deltaY = e.clientY - startY;

            // Adjust sensitivity
            let sizeChange = deltaY * 0.5;

            // Invert logic for top handles to make dragging "out" increase size
            if (handle.startsWith('n')) {
                sizeChange = -sizeChange;
            }

            const newSize = Math.max(10, startFontSize + sizeChange);

            setCoverElements(prev => ({
                ...prev,
                [id]: { ...prev[id], fontSize: newSize }
            }));
            return;
        }

        // Find dragged element
        const activeId = Object.keys(coverElements).find(key => coverElements[key].isDragging);
        if (!activeId) return;

        const container = e.currentTarget.getBoundingClientRect();
        // Calculate movement delta in %
        const deltaX = ((e.clientX - dragOffset.current.x) / container.width) * 100;
        const deltaY = ((e.clientY - dragOffset.current.y) / container.height) * 100;

        setCoverElements(prev => ({
            ...prev,
            [activeId]: {
                ...prev[activeId],
                x: prev[activeId].x + deltaX,
                y: prev[activeId].y + deltaY
            }
        }));

        // Reset drag origin for next frame
        dragOffset.current = { x: e.clientX, y: e.clientY };
    };

    // Layer Management (Reorder Keys)
    const moveLayer = (direction) => {
        if (!selectedId) return;
        const keys = Object.keys(coverElements);
        const currentIndex = keys.indexOf(selectedId);
        if (currentIndex === -1) return;

        const newKeys = [...keys];
        if (direction === 'up' && currentIndex < keys.length - 1) {
            [newKeys[currentIndex], newKeys[currentIndex + 1]] = [newKeys[currentIndex + 1], newKeys[currentIndex]];
        } else if (direction === 'down' && currentIndex > 0) {
            [newKeys[currentIndex], newKeys[currentIndex - 1]] = [newKeys[currentIndex - 1], newKeys[currentIndex]];
        } else { return; }

        const newElements = {};
        newKeys.forEach(k => newElements[k] = coverElements[k]);
        setCoverElements(newElements);
    };

    // History Management for Undo/Redo
    const [history, setHistory] = useState([
        {
            elements: {
                title: { id: 'title', x: 50, y: 15, text: book.title, fontSize: 48, color: '#ffffff', fontFamily: 'font-serif', textAlign: 'center', isDragging: false },
                subtitle: { id: 'subtitle', x: 50, y: 25, text: book.subtitle || 'Subtitle', fontSize: 20, color: '#d1d5db', fontFamily: 'font-light', textAlign: 'center', isDragging: false },
                author: { id: 'author', x: 50, y: 50, text: book.author_name, fontSize: 16, color: '#ffffff', fontFamily: 'font-sans', textAlign: 'center', isDragging: false },
                spineTitle: { id: 'spineTitle', x: 49.5, y: 40, text: book.title, fontSize: 12, color: '#000000', fontFamily: 'font-serif', textAlign: 'center', rotation: -90, isDragging: false },
                spineAuthor: { id: 'spineAuthor', x: 49.5, y: 70, text: book.author_name, fontSize: 10, color: '#666666', fontFamily: 'font-sans', textAlign: 'center', rotation: -90, isDragging: false }
            },
            shapes: {},
            background: null
        }
    ]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const saveHistory = (newElements, newBg, newShapes) => {
        const nextState = {
            elements: JSON.parse(JSON.stringify(newElements || coverElements)),
            shapes: JSON.parse(JSON.stringify(newShapes || shapeElements)),
            background: newBg !== undefined ? newBg : bgImage
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(nextState);

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            const prevState = history[prevIndex];
            setCoverElements(prevState.elements);
            setShapeElements(prevState.shapes || {});
            setBgImage(prevState.background);
            setHistoryIndex(prevIndex);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            const nextState = history[nextIndex];
            setCoverElements(nextState.elements);
            setShapeElements(nextState.shapes || {});
            setBgImage(nextState.background);
            setHistoryIndex(nextIndex);
        }
    };

    const handleDragEnd = () => {
        // Handle Resize End
        if (resizeState.current.active) {
            resizeState.current.active = false;
            saveHistory(null, undefined);
            return;
        }

        // Handle Rotate End
        if (rotateState.current.active) {
            rotateState.current.active = false;
            saveHistory(null, undefined);
            return;
        }

        // Stop all dragging
        let hasChanges = false;
        setCoverElements(prev => {
            const next = { ...prev };
            // Check if anything was dragging to avoid useless history pushes
            const wasDragging = Object.values(next).some(el => el.isDragging);
            if (wasDragging) {
                hasChanges = true;
                Object.keys(next).forEach(k => next[k].isDragging = false);
            }
            return next;
        });

        // We need to wait for state update or use the 'hasChanges' flag with current state? 
        // Logic: setCoverElements is async. We can't read 'coverElements' immediately. 
        // Better approach: Calculate the new state here and pass it to both setCoverElements and saveHistory.

        if (selectedId) {
            // To ensure we save the *final* position after drag, we simply save current frame
            // But simpler: just trigger saveHistory with current coverElements (which are updated during drag move).
            // However, drag move updates state constantly. unique 'save' should happen on MouseUp.
            // We can pass the *current* coverElements assuming the drag move updated them.
            setTimeout(() => saveHistory(null, undefined), 50);
        }
    };

    const updateElementStyle = (key, value) => {
        if (!selectedId) return;
        setCoverElements(prev => {
            const newState = {
                ...prev,
                [selectedId]: { ...prev[selectedId], [key]: value }
            };
            saveHistory(newState, undefined);
            return newState;
        });
    };

    // Add new text element to canvas
    const addTextElement = (type) => {
        const id = `custom_${Date.now()}`;
        const presets = {
            heading: { text: 'New Heading', fontSize: 36, fontWeight: 'bold', color: '#ffffff', y: 50 },
            subheading: { text: 'New Subheading', fontSize: 20, fontWeight: 'normal', color: '#d1d5db', y: 60 },
            body: { text: 'Add your body text here...', fontSize: 12, fontWeight: 'normal', color: '#e5e7eb', y: 70, width: 40 }
        };
        const preset = presets[type];

        const newElement = {
            id,
            x: 75, // Default to front cover center
            y: preset.y,
            text: preset.text,
            fontSize: preset.fontSize,
            color: preset.color,
            fontFamily: 'font-sans',
            textAlign: 'center',
            fontWeight: preset.fontWeight,
            fontStyle: 'normal',
            textDecoration: 'none',
            letterSpacing: 0,
            lineHeight: 1.4,
            width: preset.width || null,
            isDragging: false
        };

        setCoverElements(prev => {
            const newState = { ...prev, [id]: newElement };
            saveHistory(newState, undefined);
            return newState;
        });

        // Auto-select the new element and switch to style tab
        setSelectedId(id);
        setTextSubTab('style');
    };

    // Add new shape element to canvas
    const addShape = (shapeType) => {
        const id = `shape_${Date.now()}`;
        const shapePresets = {
            rectangle: { type: 'rectangle', width: 15, height: 10, borderRadius: 0 },
            square: { type: 'square', width: 10, height: 10, borderRadius: 0 },
            circle: { type: 'circle', width: 10, height: 10, borderRadius: 50 },
            roundedRect: { type: 'roundedRect', width: 15, height: 10, borderRadius: 10 },
            triangle: { type: 'triangle', width: 10, height: 10, borderRadius: 0 },
            diamond: { type: 'diamond', width: 10, height: 10, borderRadius: 0 },
            star: { type: 'star', width: 10, height: 10, borderRadius: 0 },
            heart: { type: 'heart', width: 10, height: 10, borderRadius: 0 },
            hexagon: { type: 'hexagon', width: 10, height: 10, borderRadius: 0 },
            line: { type: 'line', width: 20, height: 0.5, borderRadius: 0 },
            lineVertical: { type: 'lineVertical', width: 0.5, height: 15, borderRadius: 0 },
            arrow: { type: 'arrow', width: 15, height: 2, borderRadius: 0 }
        };
        const preset = shapePresets[shapeType] || shapePresets.rectangle;

        const newShape = {
            id,
            ...preset,
            x: 75, // Default to front cover center
            y: 50,
            color: '#3b82f6', // Blue default
            borderColor: 'transparent',
            borderWidth: 0,
            opacity: 1,
            rotation: 0,
            isDragging: false
        };

        setShapeElements(prev => ({
            ...prev,
            [id]: newShape
        }));

        setSelectedShapeId(id);
        setSelectedId(null); // Deselect text
    };

    // Update shape style
    const updateShapeStyle = (key, value) => {
        if (!selectedShapeId) return;
        setShapeElements(prev => ({
            ...prev,
            [selectedShapeId]: { ...prev[selectedShapeId], [key]: value }
        }));
    };

    // Delete shape
    const deleteShape = (id, skipConfirm = false) => {
        if (!id) return;
        if (!skipConfirm && !confirm('Are you sure you want to delete this shape?')) return;

        setShapeElements(prev => {
            const newState = { ...prev };
            delete newState[id];
            saveHistory(undefined, undefined, newState);
            return newState;
        });
        setSelectedShapeId(null);
    };

    // Handle shape drag
    const handleShapeDragStart = (e, id) => {
        e.stopPropagation();
        dragOffset.current = { x: e.clientX, y: e.clientY };
        setShapeElements(prev => ({
            ...prev,
            [id]: { ...prev[id], isDragging: true }
        }));
        setSelectedShapeId(id);
        setSelectedId(null); // Deselect text
    };

    const handleShapeDragMove = (e) => {
        const activeId = Object.keys(shapeElements).find(key => shapeElements[key].isDragging);
        if (!activeId) return;

        const container = e.currentTarget.getBoundingClientRect();
        const deltaX = ((e.clientX - dragOffset.current.x) / container.width) * 100;
        const deltaY = ((e.clientY - dragOffset.current.y) / container.height) * 100;

        setShapeElements(prev => ({
            ...prev,
            [activeId]: {
                ...prev[activeId],
                x: prev[activeId].x + deltaX,
                y: prev[activeId].y + deltaY
            }
        }));
        dragOffset.current = { x: e.clientX, y: e.clientY };
    };

    const handleShapeDragEnd = () => {
        setShapeElements(prev => {
            const next = { ...prev };
            const wasDragging = Object.values(next).some(s => s.isDragging);
            if (wasDragging) {
                Object.keys(next).forEach(k => next[k].isDragging = false);
                setTimeout(() => saveHistory(undefined, undefined, next), 50);
            }
            return next;
        });
    };

    // Delete a text element from canvas
    const deleteElement = (id, skipConfirm = false) => {
        if (!id) return;

        // Confirm deletion (skip for keyboard shortcut)
        if (!skipConfirm && !confirm(`Are you sure you want to delete this element?`)) return;

        setCoverElements(prev => {
            const newState = { ...prev };
            delete newState[id];
            saveHistory(newState, undefined);
            return newState;
        });
        setSelectedId(null);
    };



    // Image Search - Using LoremFlickr for keyword-based images (reliable and free)

    // Image Search - Using Pexels API (High Quality Free Stock Photos)
    // Image Search - Using Backend Proxy (Resolves CORS & Secures Key)
    const handleSearch = async (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            setIsSearching(true);
            setSearchResults([]);
            setTotalHits(0);
            setSearchPage(1);
            setLastSearchQuery(searchQuery.trim());

            try {
                // Call our own backend proxy instead of Pexels directly
                const response = await axios.get('/api/stock-images/search', {
                    params: {
                        query: searchQuery.trim(),
                        per_page: 20,
                        page: 1
                    }
                });

                if (response.data && response.data.photos) {
                    const results = response.data.photos.map(photo => ({
                        id: `pexels_${photo.id}`,
                        url: photo.src.large2x,
                        thumb: photo.src.medium,
                        photographer: photo.photographer,
                        alt: photo.alt
                    }));

                    setSearchResults(results);
                    setTotalHits(response.data.total_results || 1000);
                }
            } catch (error) {
                console.error("Search Error:", error);

                let msg = "Failed to fetch images.";
                if (error.response) {
                    msg += ` (Server Error ${error.response.status})`;
                } else {
                    msg += ` (${error.message})`;
                }
                alert(msg);
            } finally {
                setIsSearching(false);
            }
        }
    };

    // Load More Images
    // Load More Images
    const loadMoreImages = async () => {
        const nextPage = searchPage + 1;

        try {
            const response = await axios.get('/api/stock-images/search', {
                params: {
                    query: lastSearchQuery,
                    per_page: 20,
                    page: nextPage,
                    orientation: 'portrait'
                }
            });

            if (response.data && response.data.photos) {
                const moreResults = response.data.photos.map(photo => ({
                    id: `pexels_${photo.id}`,
                    url: photo.src.large2x,
                    thumb: photo.src.medium,
                    photographer: photo.photographer,
                    alt: photo.alt
                }));

                setSearchResults(prev => [...prev, ...moreResults]);
                setSearchPage(nextPage);
            }
        } catch (error) {
            console.error("Load More Error:", error);
        }
    };

    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate Dimensions
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                if (bgTarget !== 'spine' && (img.width !== 755 || img.height !== 1144)) {
                    alert(`Error: Background image must be exactly 755 x 1144 pixels.\nYour image: ${img.width} x ${img.height} pixels.`);
                    e.target.value = ''; // Reset input
                    return;
                }

                // Proceed if valid
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const newUrl = ev.target.result;
                    if (bgTarget === 'front') {
                        setBgImage(newUrl);
                    } else if (bgTarget === 'back') {
                        setBackBgImage(newUrl);
                    } else {
                        setSpineBgImage(newUrl);
                    }
                    saveHistory(undefined, newUrl);
                    alert("Image uploaded successfully! It has been applied to the cover.");
                };
                reader.readAsDataURL(file);
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                alert("Invalid image file.");
            };

            img.src = objectUrl;
        }
    };

    const applyBackground = (url) => {
        if (bgTarget === 'front') {
            setBgImage(url);
        } else if (bgTarget === 'back') {
            setBackBgImage(url);
        } else {
            setSpineBgImage(url);
        }
        saveHistory(undefined, url);
    };

    // Helper to compute background styles for different types
    const getBackgroundStyle = (bgValue, defaultBg = null) => {
        if (!bgValue) {
            return defaultBg ? { backgroundImage: `url('${defaultBg}')` } : { backgroundColor: '#1a1a1a' };
        }

        // Solid color
        if (bgValue.startsWith('#')) {
            return { backgroundColor: bgValue };
        }

        // Gradient
        if (bgValue.startsWith('gradient-')) {
            const gradients = {
                'gradient-grad1': 'linear-gradient(135deg, #f97316, #dc2626, #a4485c)',
                'gradient-grad2': 'linear-gradient(135deg, #0ea5e9, #3b82f6, #6366f1)',
                'gradient-grad3': 'linear-gradient(135deg, #22c55e, #16a34a, #0f766e)',
                'gradient-grad4': 'linear-gradient(135deg, #1e293b, #334155, #475569)',
                'gradient-grad5': 'linear-gradient(135deg, #06b6d4, #ad5b67, #ec4899)',
                'gradient-grad6': 'linear-gradient(135deg, #fbbf24, #f97316, #dc2626)'
            };
            return { background: gradients[bgValue] || gradients['gradient-grad1'] };
        }

        // Pattern
        if (bgValue.startsWith('pattern-')) {
            const patterns = {
                'pattern-stripes': { url: 'https://www.transparenttextures.com/patterns/diagonal-striped-brick.png', color: '#8c3541' },
                'pattern-dots': { url: 'https://www.transparenttextures.com/patterns/egg-shell.png', color: '#10b981' },
                'pattern-chevron': { url: 'https://www.transparenttextures.com/patterns/diagmonds.png', color: '#1f2937' },
                'pattern-grid': { url: 'https://www.transparenttextures.com/patterns/cubes.png', color: '#dc2626' },
                'pattern-paper': { url: 'https://www.transparenttextures.com/patterns/old-wall.png', color: '#fefce8' },
                'pattern-fabric': { url: 'https://www.transparenttextures.com/patterns/fabric-of-squares.png', color: '#f97316' },
                'pattern-wood': { url: 'https://www.transparenttextures.com/patterns/wood-pattern.png', color: '#78350f' },
                'pattern-carbon': { url: 'https://www.transparenttextures.com/patterns/carbon-fibre-v2.png', color: '#18181b' }
            };
            const p = patterns[bgValue] || patterns['pattern-stripes'];
            return {
                backgroundColor: p.color,
                backgroundImage: `url(${p.url})`,
                backgroundRepeat: 'repeat'
            };
        }

        // Regular image URL
        return { backgroundImage: `url(${bgValue})` };
    };

    const tabs = [
        { id: 'background', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Background' },
        { id: 'text', icon: 'M4 6h16M4 12h16M4 18h7', label: 'Text' },
        { id: 'shapes', icon: 'M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V7a1 1 0 00-1.447-.894l-4-2a1 1 0 00-1.106 0l-4 2A1 1 0 005 7v8a1 1 0 001.447.894l4 2z', label: 'Shapes' },
        { id: 'uploads', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12', label: 'Uploads' },
        { id: 'layers', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', label: 'Layers' }
    ];

    // Duplicate element
    const duplicateElement = (id) => {
        const element = coverElements[id];
        if (element) {
            const newId = `${id}_copy_${Date.now()}`;
            setCoverElements(prev => {
                const newState = {
                    ...prev,
                    [newId]: { ...element, id: newId, x: element.x + 5, y: element.y + 5 }
                };
                saveHistory(newState, undefined);
                return newState;
            });
            setSelectedId(newId);
        }
    };

    // Duplicate shape
    const duplicateShape = (id) => {
        const shape = shapeElements[id];
        if (shape) {
            const newId = `shape_copy_${Date.now()}`;
            setShapeElements(prev => {
                const newState = {
                    ...prev,
                    [newId]: { ...shape, id: newId, x: shape.x + 5, y: shape.y + 5 }
                };
                saveHistory(undefined, undefined, newState);
                return newState;
            });
            setSelectedShapeId(newId);
        }
    };

    // Master Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return;

            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;

            // 1. ESCAPE
            if (e.key === 'Escape') {
                if (showPreview) setShowPreview(false);
                else if (showGuidelines) setShowGuidelines(false);
                else {
                    setSelectedId(null);
                    setSelectedShapeId(null);
                    setEditingId(null);
                }
                return;
            }

            // 2. UNDO / REDO
            if (isCtrl && (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'y')) {
                e.preventDefault();
                if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && isShift)) {
                    handleRedo();
                } else {
                    handleUndo();
                }
                return;
            }

            // 3. DUPLICATE (Ctrl+D)
            if (isCtrl && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                if (selectedId) duplicateElement(selectedId);
                if (selectedShapeId) duplicateShape(selectedShapeId);
                return;
            }

            // 4. DELETE
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                if (selectedId) deleteElement(selectedId, true);
                if (selectedShapeId) deleteShape(selectedShapeId, true);
                return;
            }

            // 5. NUDGE (Arrows)
            if (selectedId || selectedShapeId) {
                const step = isShift ? 1 : 0.1;
                const isShape = !!selectedShapeId;
                const activeId = isShape ? selectedShapeId : selectedId;

                let dx = 0, dy = 0;
                if (e.key === 'ArrowUp') dy = -step;
                if (e.key === 'ArrowDown') dy = step;
                if (e.key === 'ArrowLeft') dx = -step;
                if (e.key === 'ArrowRight') dx = step;

                if (dx !== 0 || dy !== 0) {
                    e.preventDefault();
                    if (isShape) {
                        setShapeElements(prev => ({
                            ...prev,
                            [activeId]: { ...prev[activeId], x: prev[activeId].x + dx, y: prev[activeId].y + dy }
                        }));
                    } else {
                        setCoverElements(prev => ({
                            ...prev,
                            [activeId]: { ...prev[activeId], x: prev[activeId].x + dx, y: prev[activeId].y + dy }
                        }));
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showPreview, showGuidelines, selectedId, selectedShapeId, coverElements, shapeElements, historyIndex]);


    return (
        <div className="flex h-screen bg-[#f4f4f5] overflow-hidden font-sans selection:bg-indigo-500/30">
            <Head title={`Cover Creator - ${book.title}`} />

            {/* LEFT SIDEBAR - TOOLBAR */}
            {/* LEFT SIDEBAR - TOOLBAR */}
            <div className="w-20 bg-paper flex flex-col items-center py-6 gap-6 z-20 shadow-2xl border-r border-linen">
                {/* Back Button */}
                <Link href={route('books.design', book.id)} className="group relative w-12 h-12 flex items-center justify-center text-umber hover:text-ink transition-all duration-300 bg-paper hover:bg-vellum rounded-2xl mb-2">
                    <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </Link>

                <div className="w-10 h-px bg-vellum rounded-full mb-2"></div>

                {/* Tools */}
                <div className="flex flex-col gap-4 w-full px-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group relative ${activeTab === tab.id
                                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-ink shadow-lg shadow-indigo-500/25 ring-1 ring-linen'
                                : 'text-umber hover:text-ink hover:bg-paper'
                                }`}
                        >
                            <svg className={`w-6 h-6 mb-1.5 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === tab.id ? "2" : "1.5"} d={tab.icon}></path></svg>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{tab.label}</span>

                            {/* Active Indicator Dot */}
                            {activeTab === tab.id && (
                                <div className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 blur-[2px] rounded-full opacity-0 group-hover:opacity-50 transition-opacity"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* SECONDARY SIDEBAR - CONTENT PANEL */}
            <div className="w-80 bg-white shadow-2xl z-10 flex flex-col transition-all duration-300 relative">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 capitalize">{activeTab}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {activeTab === 'background' && (
                        <div className="grid grid-cols-2 gap-3">
                            {/* Target Selector - Front or Back Cover */}
                            <div className="col-span-2 mb-4">
                                <label className="text-xs font-bold text-umber uppercase tracking-widest block mb-2">Apply To</label>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setBgTarget('front')}
                                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${bgTarget === 'front' ? 'bg-white shadow text-indigo-600' : 'text-umber hover:text-gray-700'}`}
                                    >
                                        Front Cover
                                    </button>
                                    <button
                                        onClick={() => setBgTarget('spine')}
                                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${bgTarget === 'spine' ? 'bg-white shadow text-indigo-600' : 'text-umber hover:text-gray-700'}`}
                                    >
                                        Spine
                                    </button>
                                    <button
                                        onClick={() => setBgTarget('back')}
                                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${bgTarget === 'back' ? 'bg-white shadow text-indigo-600' : 'text-umber hover:text-gray-700'}`}
                                    >
                                        Back Cover
                                    </button>
                                </div>
                                <p className="text-xs text-umber mt-2">Currently editing: <span className="font-semibold text-indigo-600">{bgTarget === 'front' ? 'Front Cover' : bgTarget === 'spine' ? 'Spine' : 'Back Cover'}</span></p>
                            </div>

                            <div className="col-span-2 mb-4">
                                <label className="text-xs font-bold text-umber uppercase tracking-widest block mb-2">Search Free Photos (Pexels)</label>
                                {/* AI Toggle Removed - Now Purely Pexels Stock Search */}
                            </div>

                            <div className="col-span-2 relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search high-quality photos (e.g. 'dark forest', 'romance')..."
                                    className="w-full text-sm border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                />
                                <svg className="w-4 h-4 text-umber absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>

                            {/* Featured Backgrounds (Visible when not searching) */}
                            {!searchQuery && (
                                <div className="col-span-2 mb-6">
                                    <div className="font-bold text-xs text-umber uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        Featured Collection
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=300&q=80', // Gradient
                                            'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=300&q=80', // Texture
                                            'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80', // Abstract
                                            'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=300&q=80', // Dark
                                            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80', // Beach/Calm
                                            'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=300&q=80'  // Sky/Clouds
                                        ].map((url, i) => (
                                            <div
                                                key={i}
                                                onClick={() => applyBackground(url)}
                                                className="h-24 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all relative group shadow-sm bg-gray-100"
                                            >
                                                <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Featured" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Loading State */}
                            {isSearching && (
                                <div className="col-span-2 py-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                    <p className="text-xs text-umber">Searching specifically for "{searchQuery}"...</p>
                                </div>
                            )}

                            {/* API Search Results */}
                            {searchResults.length > 0 && (
                                <div className="col-span-2 mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="text-sm text-umber">
                                            <span className="font-semibold text-indigo-600">{searchResults.length}</span> of <span className="font-semibold">{totalHits.toLocaleString()}</span> Free images
                                        </div>
                                        <button onClick={() => { setSearchResults([]); setTotalHits(0); }} className="text-xs text-umber hover:text-red-500">Clear</button>
                                    </div>
                                    <p className="text-xs text-umber mb-3">Click any image to apply it as your book cover background</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {searchResults.map((img) => (
                                            <div
                                                key={img.id}
                                                onClick={() => applyBackground(img.url)}
                                                className={`h-32 bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer transition-all group ${bgImage === img.url ? 'ring-4 ring-green-500' : 'hover:ring-2 hover:ring-indigo-500'}`}
                                            >
                                                <img src={img.thumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" loading="lazy" />
                                                {/* Applied indicator */}
                                                {bgImage === img.url && (
                                                    <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                                                        <div className="bg-green-500 text-white rounded-full p-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Load More Button */}
                                    {searchResults.length < totalHits && (
                                        <button
                                            onClick={loadMoreImages}
                                            className="w-full mt-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-lg transition flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                            Load More Images
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Solid Color Backgrounds */}
                            <div className="col-span-2 mb-2 font-bold text-xs text-umber uppercase tracking-widest">Solid Colors</div>
                            <p className="col-span-2 text-xs text-umber mb-2">Click to apply as background</p>
                            {[
                                // Row 1 - Vibrant
                                '#ef4444', '#f97316', '#f59e0b', '#84cc16',
                                '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
                                // Row 2 - More colors
                                '#ad5b67', '#b85a4c', '#f43f5e', '#ec4899',
                                // Row 3 - Neutrals & Darks
                                '#000000', '#374151', '#9ca3af', '#ffffff',
                                '#1e293b', '#334155', '#78350f', '#7c2d12'
                            ].map(color => {
                                const isSelected = (bgTarget === 'front' && bgImage === color) || (bgTarget === 'back' && backBgImage === color);
                                return (
                                    <div
                                        key={color}
                                        onClick={() => applyBackground(color)}
                                        className={`h-10 rounded-lg shadow-sm cursor-pointer transition-all ${isSelected ? 'ring-4 ring-green-500 scale-105' : 'hover:scale-105 hover:ring-2 hover:ring-indigo-400'} ${color === '#ffffff' ? 'border border-gray-300' : ''}`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {isSelected && (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className={`w-5 h-5 ${color === '#ffffff' || color === '#f59e0b' || color === '#84cc16' ? 'text-gray-800' : 'text-ink'} drop-shadow-lg`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Textures Section */}
                            <div className="col-span-2 mt-6 mb-2 font-bold text-xs text-umber uppercase tracking-widest">Textures</div>
                            <p className="col-span-2 text-xs text-umber mb-2">High-quality photo backgrounds</p>
                            {[
                                // Nature & Scenery
                                { seed: 'palmtree', label: 'Palm Tree' },
                                { seed: 'sunset-ocean', label: 'Sunset' },
                                { seed: 'citynight', label: 'City Night' },
                                { seed: 'camera-person', label: 'Photographer' },
                                { seed: 'building-lights', label: 'Buildings' },
                                { seed: 'lighthouse', label: 'Lighthouse' },
                                { seed: 'forest-dark', label: 'Dark Forest' },
                                { seed: 'mountain-peak', label: 'Mountain' },
                                { seed: 'ocean-waves', label: 'Ocean' },
                                { seed: 'stars-galaxy', label: 'Galaxy' },
                                { seed: 'flower-garden', label: 'Flowers' },
                                { seed: 'abstract-art', label: 'Abstract' },
                                // Expanding with more textures/themes
                                { seed: 'old-library', label: 'Library' },
                                { seed: 'open-book', label: 'Book' },
                                { seed: 'fantasy-castle', label: 'Castle' },
                                { seed: 'foggy-morning', label: 'Foggy' },
                                { seed: 'autumn-leaves', label: 'Autumn' },
                                { seed: 'snowy-mountain', label: 'Winter' },
                                { seed: 'vintage-paper', label: 'Vintage' },
                                { seed: 'dark-nebula', label: 'Nebula' },
                                { seed: 'fire-flames', label: 'Fire' },
                                { seed: 'water-ripples', label: 'Water' },
                                { seed: 'wooden-desk', label: 'Wood' },
                                { seed: 'coffee-cup', label: 'Coffee' },
                                { seed: 'urban-street', label: 'Urban' },
                                { seed: 'desert-dunes', label: 'Desert' },
                                { seed: 'cyberpunk-city', label: 'Cyberpunk' },
                                { seed: 'horror-house', label: 'Horror' },
                                { seed: 'romance-couple', label: 'Romance' },
                                { seed: 'minimal-geometry', label: 'Geometry' }
                            ].map((tex, i) => {
                                const url = `https://picsum.photos/seed/${tex.seed}/800/1200`;
                                const thumb = `https://picsum.photos/seed/${tex.seed}/200/300`;
                                const isSelected = (bgTarget === 'front' && bgImage === url) || (bgTarget === 'back' && backBgImage === url);
                                return (
                                    <div
                                        key={tex.seed}
                                        onClick={() => applyBackground(url)}
                                        className={`h-28 bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer transition-all group ${isSelected ? 'ring-4 ring-green-500' : 'hover:ring-2 hover:ring-indigo-500'}`}
                                    >
                                        <img src={thumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={tex.label} loading="lazy" />
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                                                <div className="bg-green-500 text-white rounded-full p-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Patterns Section */}
                            <div className="col-span-2 mt-6 mb-2 font-bold text-xs text-umber uppercase tracking-widest">Patterns</div>
                            <p className="col-span-2 text-xs text-umber mb-2">Seamless repeating patterns</p>
                            {[
                                // Using SVG pattern URLs for seamless patterns
                                { id: 'stripes', name: 'Diagonal Stripes', url: 'https://www.transparenttextures.com/patterns/diagonal-striped-brick.png', color: '#8c3541' },
                                { id: 'dots', name: 'Polka Dots', url: 'https://www.transparenttextures.com/patterns/egg-shell.png', color: '#10b981' },
                                { id: 'chevron', name: 'Chevron', url: 'https://www.transparenttextures.com/patterns/diagmonds.png', color: '#1f2937' },
                                { id: 'grid', name: 'Grid', url: 'https://www.transparenttextures.com/patterns/cubes.png', color: '#dc2626' },
                                { id: 'paper', name: 'Paper Texture', url: 'https://www.transparenttextures.com/patterns/old-wall.png', color: '#fefce8' },
                                { id: 'fabric', name: 'Fabric', url: 'https://www.transparenttextures.com/patterns/fabric-of-squares.png', color: '#f97316' },
                                { id: 'wood', name: 'Wood Grain', url: 'https://www.transparenttextures.com/patterns/wood-pattern.png', color: '#78350f' },
                                { id: 'carbon', name: 'Carbon Fiber', url: 'https://www.transparenttextures.com/patterns/carbon-fibre-v2.png', color: '#18181b' }
                            ].map((pattern) => {
                                const patternId = `pattern-${pattern.id}`;
                                const isSelected = (bgTarget === 'front' && bgImage === patternId) || (bgTarget === 'back' && backBgImage === patternId);
                                return (
                                    <div
                                        key={pattern.id}
                                        onClick={() => applyBackground(patternId)}
                                        className={`h-20 rounded-lg overflow-hidden relative cursor-pointer transition-all ${isSelected ? 'ring-4 ring-green-500 scale-105' : 'hover:scale-105 hover:ring-2 hover:ring-indigo-400'}`}
                                        style={{
                                            backgroundColor: pattern.color,
                                            backgroundImage: `url(${pattern.url})`,
                                            backgroundRepeat: 'repeat'
                                        }}
                                    >
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-ink drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                        )}
                                        <div className="absolute bottom-1 left-1 bg-paper text-ink text-[9px] px-1.5 py-0.5 rounded">{pattern.name}</div>
                                    </div>
                                );
                            })}

                            {/* Gradients Section */}
                            <div className="col-span-2 mt-6 mb-2 font-bold text-xs text-umber uppercase tracking-widest">Gradients</div>
                            {[
                                { id: 'grad1', name: 'Sunset', gradient: 'linear-gradient(135deg, #f97316, #dc2626, #a4485c)' },
                                { id: 'grad2', name: 'Ocean', gradient: 'linear-gradient(135deg, #0ea5e9, #3b82f6, #6366f1)' },
                                { id: 'grad3', name: 'Forest', gradient: 'linear-gradient(135deg, #22c55e, #16a34a, #0f766e)' },
                                { id: 'grad4', name: 'Night', gradient: 'linear-gradient(135deg, #1e293b, #334155, #475569)' },
                                { id: 'grad5', name: 'Aurora', gradient: 'linear-gradient(135deg, #06b6d4, #ad5b67, #ec4899)' },
                                { id: 'grad6', name: 'Fire', gradient: 'linear-gradient(135deg, #fbbf24, #f97316, #dc2626)' }
                            ].map((grad) => {
                                const gradId = `gradient-${grad.id}`;
                                const isSelected = (bgTarget === 'front' && bgImage === gradId) || (bgTarget === 'back' && backBgImage === gradId);
                                return (
                                    <div
                                        key={grad.id}
                                        onClick={() => applyBackground(gradId)}
                                        className={`h-14 rounded-lg overflow-hidden relative cursor-pointer transition-all ${isSelected ? 'ring-4 ring-green-500 scale-105' : 'hover:scale-105 hover:ring-2 hover:ring-indigo-400'}`}
                                        style={{ background: grad.gradient }}
                                    >
                                        {isSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-ink drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'text' && (
                        <div className="space-y-6">
                            {/* Text Sub-Tabs (Visual Reference to Canva) */}
                            <div className="flex border-b border-gray-200 mb-4">
                                <button
                                    className={`flex-1 py-2 text-sm font-medium ${textSubTab === 'style' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-umber hover:text-gray-700'}`}
                                    onClick={() => setTextSubTab('style')}
                                >
                                    Text Style
                                </button>
                                <button
                                    className={`flex-1 py-2 text-sm font-medium ${textSubTab === 'add' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-umber hover:text-gray-700'}`}
                                    onClick={() => setTextSubTab('add')}
                                >
                                    Add Text
                                </button>
                            </div>

                            {/* EDITING MODE */}
                            {selectedId && textSubTab === 'style' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="pb-4 border-b border-gray-200 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-800 mb-1">Editing: <span className="text-indigo-600 capitalize">{selectedId.replace('back', 'Back ').replace(/([A-Z])/g, ' $1').trim()}</span></h3>
                                            <p className="text-xs text-umber">Drag on canvas to move</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => deleteElement(selectedId)}
                                                className="p-1.5 text-red-700 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                title="Delete Element"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                            <button onClick={() => setSelectedId(null)} className="text-xs text-umber hover:text-umber underline">Done</button>
                                        </div>
                                    </div>

                                    {/* ... Existing Tools ... */}
                                    <div>
                                        <label className="text-xs font-bold text-umber uppercase tracking-widest block mb-2">Content</label>
                                        <textarea
                                            rows="2"
                                            value={coverElements[selectedId].text}
                                            onChange={(e) => updateElementStyle('text', e.target.value)}
                                            className="w-full text-sm border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-umber uppercase tracking-widest block mb-2">Size (px)</label>
                                            <input
                                                type="number"
                                                value={coverElements[selectedId].fontSize}
                                                onChange={(e) => updateElementStyle('fontSize', parseInt(e.target.value))}
                                                className="w-full text-sm border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="text-xs font-bold text-umber uppercase tracking-widest block mb-2">Color</label>
                                            <button
                                                onClick={() => setShowColorPicker(!showColorPicker)}
                                                className="flex items-center gap-2 w-full border border-gray-200 rounded-md p-1.5 hover:bg-gray-50 transition"
                                            >
                                                <div
                                                    className="w-6 h-6 rounded border border-gray-200"
                                                    style={{ backgroundColor: coverElements[selectedId].color }}
                                                ></div>
                                                <span className="text-xs text-umber font-mono uppercase truncate">{coverElements[selectedId].color}</span>
                                            </button>

                                            {/* Color Picker Popover */}
                                            {showColorPicker && (
                                                <div className="absolute top-full right-0 mt-2 z-50 p-3 bg-white rounded-xl shadow-xl border border-gray-100 animate-fadeIn">
                                                    <div
                                                        className="fixed inset-0 z-[-1]"
                                                        onClick={() => setShowColorPicker(false)}
                                                    ></div>
                                                    <HexColorPicker
                                                        color={coverElements[selectedId].color}
                                                        onChange={(newColor) => updateElementStyle('color', newColor)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ALIGNMENT & LAYERS TOOLBAR */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-umber uppercase tracking-widest block mb-2">Alignment</label>
                                            <div className="flex bg-gray-100 rounded-md p-1 gap-1">
                                                {['left', 'center', 'right'].map(align => (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElementStyle('textAlign', align)}
                                                        className={`flex-1 p-1.5 rounded flex justify-center items-center transition ${coverElements[selectedId].textAlign === align ? 'bg-white shadow text-indigo-600' : 'text-umber hover:text-umber hover:bg-gray-200'}`}
                                                        title={`Align ${align}`}
                                                    >
                                                        {align === 'left' && <AlignLeft size={16} />}
                                                        {align === 'center' && <AlignCenter size={16} />}
                                                        {align === 'right' && <AlignRight size={16} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-umber uppercase tracking-widest block mb-2">Layer Order</label>
                                            <div className="flex bg-gray-100 rounded-md p-1 gap-1">
                                                <button
                                                    onClick={() => moveLayer('down')}
                                                    className="flex-1 p-1.5 rounded flex justify-center items-center text-umber hover:text-gray-800 hover:bg-white hover:shadow transition"
                                                    title="Send Backward"
                                                >
                                                    <ArrowDown size={14} /> <span className="text-[10px] ml-1">Back</span>
                                                </button>
                                                <button
                                                    onClick={() => moveLayer('up')}
                                                    className="flex-1 p-1.5 rounded flex justify-center items-center text-umber hover:text-gray-800 hover:bg-white hover:shadow transition"
                                                    title="Bring Forward"
                                                >
                                                    <ArrowUp size={14} /> <span className="text-[10px] ml-1">Front</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-umber uppercase tracking-widest block mb-2">Font Family</label>
                                        <select
                                            value={coverElements[selectedId].fontFamily}
                                            onChange={(e) => updateElementStyle('fontFamily', e.target.value)}
                                            className="w-full text-sm border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="font-serif">Serif (Classic)</option>
                                            <option value="font-sans">Sans (Modern)</option>
                                            <option value="font-mono">Mono (Code)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-umber uppercase tracking-widest block mb-2">Font Style</label>
                                        <div className="flex bg-gray-100 rounded-md p-1 gap-1">
                                            <button
                                                onClick={() => updateElementStyle('fontWeight', coverElements[selectedId].fontWeight === 'bold' ? 'normal' : 'bold')}
                                                className={`flex-1 py-1.5 rounded text-xs font-bold transition ${coverElements[selectedId].fontWeight === 'bold' ? 'bg-white shadow text-indigo-600' : 'text-umber hover:bg-gray-200'}`}
                                            >B</button>
                                            <button
                                                onClick={() => updateElementStyle('fontStyle', coverElements[selectedId].fontStyle === 'italic' ? 'normal' : 'italic')}
                                                className={`flex-1 py-1.5 rounded text-xs italic font-serif transition ${coverElements[selectedId].fontStyle === 'italic' ? 'bg-white shadow text-indigo-600' : 'text-umber hover:bg-gray-200'}`}
                                            >I</button>
                                            <button
                                                onClick={() => updateElementStyle('textDecoration', coverElements[selectedId].textDecoration === 'underline' ? 'none' : 'underline')}
                                                className={`flex-1 py-1.5 rounded text-xs underline transition ${coverElements[selectedId].textDecoration === 'underline' ? 'bg-white shadow text-indigo-600' : 'text-umber hover:bg-gray-200'}`}
                                            >U</button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-umber uppercase tracking-widest block mb-2">Alignment</label>
                                        <div className="flex bg-gray-100 rounded-md p-1 gap-1">
                                            {['left', 'center', 'right', 'justify'].map(align => (
                                                <button
                                                    key={align}
                                                    onClick={() => updateElementStyle('textAlign', align)}
                                                    className={`flex-1 py-1.5 rounded transition ${coverElements[selectedId].textAlign === align ? 'bg-white shadow text-indigo-600' : 'text-umber hover:bg-gray-200'}`}
                                                >
                                                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {align === 'left' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h16" />}
                                                        {align === 'center' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 12h10M4 18h16" />}
                                                        {align === 'right' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M4 18h16" />}
                                                        {align === 'justify' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <label className="text-xs font-bold text-umber uppercase tracking-widest">Line Height</label>
                                                <span className="text-xs text-indigo-600">{coverElements[selectedId].lineHeight || 1.4}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.8"
                                                max="3"
                                                step="0.1"
                                                value={coverElements[selectedId].lineHeight || 1.4}
                                                onChange={(e) => updateElementStyle('lineHeight', parseFloat(e.target.value))}
                                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <label className="text-xs font-bold text-umber uppercase tracking-widest">Letter Spacing</label>
                                                <span className="text-xs text-indigo-600">{coverElements[selectedId].letterSpacing || 0}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-2"
                                                max="10"
                                                step="0.5"
                                                value={coverElements[selectedId].letterSpacing || 0}
                                                onChange={(e) => updateElementStyle('letterSpacing', parseFloat(e.target.value))}
                                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LAYER LIST MODE (No selection or Add Text tab) */}
                            {(!selectedId || textSubTab === 'add') && (
                                <div className="space-y-4">
                                    {textSubTab === 'add' ? (
                                        <div className="text-center py-8">
                                            <button
                                                onClick={() => addTextElement('heading')}
                                                className="bg-indigo-600 text-white w-full py-3 rounded-md font-bold shadow-md hover:bg-indigo-700 transition"
                                            >
                                                Add Heading
                                            </button>
                                            <button
                                                onClick={() => addTextElement('subheading')}
                                                className="bg-gray-100 text-gray-700 w-full py-2 rounded-md font-medium mt-3 hover:bg-gray-200 transition"
                                            >
                                                Add Subheading
                                            </button>
                                            <button
                                                onClick={() => addTextElement('body')}
                                                className="bg-gray-100 text-gray-700 w-full py-2 rounded-md font-medium mt-3 hover:bg-gray-200 transition text-sm"
                                            >
                                                Add Body Text
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-xs font-bold text-umber uppercase tracking-widest">Layers</h3>
                                            <div className="space-y-2">
                                                {Object.entries(coverElements).map(([key, el]) => (
                                                    <div
                                                        key={key}
                                                        onClick={() => setSelectedId(key)}
                                                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-white border border-gray-100 hover:border-indigo-300 rounded cursor-pointer transition group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-umber group-hover:text-indigo-500">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16"></path></svg>
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 capitalize">
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] text-umber bg-gray-200 px-1.5 py-0.5 rounded">
                                                            {key.includes('back') ? 'Back' : 'Front'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'uploads' && (
                        <div className="flex flex-col items-center justify-center h-full pb-10">
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-white hover:border-taupe hover:shadow-md transition-all cursor-pointer group"
                            >
                                <svg className="w-12 h-12 text-umber group-hover:text-indigo-500 mb-3 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <span className="text-sm font-bold text-umber group-hover:text-indigo-600">Click to Upload Media</span>
                                <span className="text-xs text-umber mt-1">JPG, PNG, SVG (Max 10MB)</span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    )}
                    {activeTab === 'shapes' && (
                        <div className="space-y-6">
                            {/* Shape being edited */}
                            {selectedShapeId && shapeElements[selectedShapeId] && (
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-indigo-700">Editing Shape</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => deleteShape(selectedShapeId)}
                                                className="p-1.5 text-red-700 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                            <button onClick={() => setSelectedShapeId(null)} className="text-xs text-indigo-500 hover:text-indigo-700">Done</button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-umber uppercase block mb-2">Fill Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={shapeElements[selectedShapeId].color}
                                                onChange={(e) => updateShapeStyle('color', e.target.value)}
                                                className="w-10 h-10 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={shapeElements[selectedShapeId].color}
                                                onChange={(e) => updateShapeStyle('color', e.target.value)}
                                                className="flex-1 text-sm border-gray-200 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-umber uppercase block mb-2">Width (%)</label>
                                            <input
                                                type="number"
                                                value={shapeElements[selectedShapeId].width}
                                                onChange={(e) => updateShapeStyle('width', parseFloat(e.target.value))}
                                                className="w-full text-sm border-gray-200 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-umber uppercase block mb-2">Height (%)</label>
                                            <input
                                                type="number"
                                                value={shapeElements[selectedShapeId].height}
                                                onChange={(e) => updateShapeStyle('height', parseFloat(e.target.value))}
                                                className="w-full text-sm border-gray-200 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-umber uppercase block mb-2">Opacity</label>
                                        <input
                                            type="range"
                                            min="0" max="1" step="0.1"
                                            value={shapeElements[selectedShapeId].opacity}
                                            onChange={(e) => updateShapeStyle('opacity', parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-umber uppercase block mb-2">Border</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={shapeElements[selectedShapeId].borderColor === 'transparent' ? '#000000' : shapeElements[selectedShapeId].borderColor}
                                                onChange={(e) => updateShapeStyle('borderColor', e.target.value)}
                                                className="w-10 h-10 rounded cursor-pointer"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Width"
                                                value={shapeElements[selectedShapeId].borderWidth}
                                                onChange={(e) => updateShapeStyle('borderWidth', parseInt(e.target.value))}
                                                className="w-20 text-sm border-gray-200 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Basic Shapes */}
                            <div>
                                <h3 className="text-xs font-bold text-umber uppercase tracking-widest mb-3">Basic Shapes</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { type: 'rectangle', icon: <div className="w-8 h-5 bg-gray-700 rounded-sm"></div>, label: 'Rectangle' },
                                        { type: 'square', icon: <div className="w-6 h-6 bg-gray-700 rounded-sm"></div>, label: 'Square' },
                                        { type: 'circle', icon: <div className="w-6 h-6 bg-gray-700 rounded-full"></div>, label: 'Circle' },
                                        { type: 'roundedRect', icon: <div className="w-8 h-5 bg-gray-700 rounded-lg"></div>, label: 'Rounded' },
                                    ].map(shape => (
                                        <button
                                            key={shape.type}
                                            onClick={() => addShape(shape.type)}
                                            className="h-16 flex flex-col items-center justify-center bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg cursor-pointer transition group"
                                            title={shape.label}
                                        >
                                            <div className="group-hover:scale-110 transition-transform">{shape.icon}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Special Shapes */}
                            <div>
                                <h3 className="text-xs font-bold text-umber uppercase tracking-widest mb-3">Special Shapes</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { type: 'triangle', icon: <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-gray-700"></div>, label: 'Triangle' },
                                        { type: 'diamond', icon: <div className="w-5 h-5 bg-gray-700 rotate-45"></div>, label: 'Diamond' },
                                        { type: 'star', icon: <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>, label: 'Star' },
                                        { type: 'heart', icon: <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>, label: 'Heart' },
                                        { type: 'hexagon', icon: <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" /></svg>, label: 'Hexagon' },
                                    ].map(shape => (
                                        <button
                                            key={shape.type}
                                            onClick={() => addShape(shape.type)}
                                            className="h-16 flex flex-col items-center justify-center bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg cursor-pointer transition group"
                                            title={shape.label}
                                        >
                                            <div className="group-hover:scale-110 transition-transform">{shape.icon}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Lines & Dividers */}
                            <div>
                                <h3 className="text-xs font-bold text-umber uppercase tracking-widest mb-3">Lines & Dividers</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { type: 'line', icon: <div className="w-10 h-0.5 bg-gray-700"></div>, label: 'Horizontal Line' },
                                        { type: 'lineVertical', icon: <div className="w-0.5 h-8 bg-gray-700"></div>, label: 'Vertical Line' },
                                        { type: 'arrow', icon: <svg className="w-8 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>, label: 'Arrow' },
                                    ].map(shape => (
                                        <button
                                            key={shape.type}
                                            onClick={() => addShape(shape.type)}
                                            className="h-14 flex flex-col items-center justify-center bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg cursor-pointer transition group"
                                            title={shape.label}
                                        >
                                            <div className="group-hover:scale-110 transition-transform">{shape.icon}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Colors */}
                            <div>
                                <h3 className="text-xs font-bold text-umber uppercase tracking-widest mb-3">Quick Shape Colors</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ad5b67', '#ec4899', '#1e293b', '#ffffff'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => selectedShapeId && updateShapeStyle('color', color)}
                                            className={`w-8 h-8 rounded-full cursor-pointer transition hover:scale-110 ${color === '#ffffff' ? 'border-2 border-gray-300' : ''} ${!selectedShapeId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            style={{ backgroundColor: color }}
                                            disabled={!selectedShapeId}
                                        />
                                    ))}
                                </div>
                                {!selectedShapeId && <p className="text-xs text-umber mt-2">Add or select a shape to change color</p>}
                            </div>

                            {/* Active Shapes List */}
                            {Object.keys(shapeElements).length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-umber uppercase tracking-widest mb-3">Active Shapes ({Object.keys(shapeElements).length})</h3>
                                    <div className="space-y-2">
                                        {Object.entries(shapeElements).map(([key, shape]) => (
                                            <div
                                                key={key}
                                                onClick={() => setSelectedShapeId(key)}
                                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${selectedShapeId === key ? 'bg-indigo-100 border-indigo-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'} border`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-6 h-6 rounded"
                                                        style={{ backgroundColor: shape.color }}
                                                    ></div>
                                                    <span className="text-sm font-medium text-gray-700 capitalize">{shape.type}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteShape(key); }}
                                                    className="text-red-700 hover:text-red-600"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'layers' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <p className="text-xs text-blue-700">Manage all elements on your cover. Click to select, use buttons to duplicate or delete.</p>
                            </div>

                            {/* Keyboard Shortcuts Info */}
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <h4 className="text-xs font-bold text-umber mb-2">⌨️ Keyboard Shortcuts</h4>
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-umber">
                                    <div><kbd className="bg-gray-200 px-1 rounded">Delete</kbd> Remove</div>
                                    <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+D</kbd> Duplicate</div>
                                    <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+Z</kbd> Undo</div>
                                    <div><kbd className="bg-gray-200 px-1 rounded">Esc</kbd> Deselect</div>
                                </div>
                            </div>

                            {/* Text Elements Section */}
                            <div>
                                <h3 className="text-xs font-bold text-umber uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                                    Text Elements ({Object.keys(coverElements).length})
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(coverElements).map(([key, el]) => (
                                        <div
                                            key={key}
                                            onClick={() => { setSelectedId(key); setSelectedShapeId(null); }}
                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition border ${selectedId === key ? 'bg-indigo-100 border-indigo-300' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-umber">T</div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700 block truncate max-w-[120px]">{el.text ? el.text.substring(0, 20) : 'Untitled'}{el.text && el.text.length > 20 ? '...' : ''}</span>
                                                    <span className="text-[10px] text-umber">{el.fontSize || 16}px</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); duplicateElement(key); }}
                                                    className="p-1.5 text-umber hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                                                    title="Duplicate"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteElement(key); }}
                                                    className="p-1.5 text-umber hover:text-red-600 hover:bg-red-50 rounded transition"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shape Elements Section */}
                            {Object.keys(shapeElements).length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-umber uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V7a1 1 0 00-1.447-.894l-4-2a1 1 0 00-1.106 0l-4 2A1 1 0 005 7v8a1 1 0 001.447.894l4 2z"></path></svg>
                                        Shapes ({Object.keys(shapeElements).length})
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(shapeElements).map(([key, shape]) => (
                                            <div
                                                key={key}
                                                onClick={() => { setSelectedShapeId(key); setSelectedId(null); }}
                                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition border ${selectedShapeId === key ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: shape.color }}></div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700 capitalize">{shape.type}</span>
                                                        <span className="text-[10px] text-umber block">{shape.width}% x {shape.height}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); duplicateShape(key); }}
                                                        className="p-1.5 text-umber hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                        title="Duplicate"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteShape(key); }}
                                                        className="p-1.5 text-umber hover:text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="bg-gray-100 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-700">{Object.keys(coverElements).length + Object.keys(shapeElements).length}</div>
                                <div className="text-xs text-umber">Total Elements</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CANVAS WORKSPACE */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-gray-100/50">
                {/* Top Header - Dark Themed */}
                <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-6 z-30 sticky top-0">
                    {/* Left Section */}
                    <div className="flex items-center gap-5">
                        {/* Logo/Brand */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
                                <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <span className="text-lg font-bold text-gray-800 tracking-tight">PublicationMart</span>
                        </div>

                        {/* Divider */}
                        <div className="h-6 w-px bg-gray-200"></div>

                        {/* Author Info & Copy */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-800">Author Name: <span className="font-black">{book.author_name || 'Ranjith R'}</span></span>
                            <button
                                onClick={() => navigator.clipboard.writeText(book.author_name || 'Ranjith R')}
                                className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-500 px-2 py-0.5 rounded border border-blue-200 text-[10px] font-medium transition cursor-pointer"
                                title="Copy Author Name"
                            >
                                <span>Copy Name</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            </button>
                        </div>
                    </div>

                    {/* Center - Status */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                        {saveStatus === 'saving' && (
                            <>
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-amber-600">Saving...</span>
                            </>
                        )}
                        {saveStatus === 'saved' && (
                            <>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-medium text-emerald-600">All changes saved</span>
                            </>
                        )}
                        {saveStatus === 'error' && (
                            <>
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-xs text-red-700">Save failed - retrying...</span>
                            </>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        {/* Undo/Redo */}
                        <div className="flex items-center gap-2 mr-3 border-r border-gray-200 pr-3">
                            <button
                                onClick={handleUndo}
                                disabled={historyIndex === 0}
                                className={`p-2 rounded-lg transition-all flex items-center justify-center ${historyIndex === 0 ? 'text-ink-soft' : 'text-umber hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200'}`}
                                title="Undo (Ctrl+Z)"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={historyIndex === history.length - 1}
                                className={`p-2 rounded-lg transition-all flex items-center justify-center ${historyIndex === history.length - 1 ? 'text-ink-soft' : 'text-umber hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200'}`}
                                title="Redo (Ctrl+Y)"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>

                        {/* Preview Button */}
                        <button
                            onClick={() => setShowPreview(true)}
                            className="text-umber hover:text-gray-900 font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            Preview
                        </button>

                        {/* Save Button */}
                        <button
                            onClick={async () => {
                                const success = await saveCoverData();
                                if (success) {
                                    router.visit(route('books.design', book.id));
                                }
                            }}
                            className="bg-paper hover:bg-paper text-ink text-sm font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-gray-900/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <span>Save Design</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </div>


                {/* Advanced State for Canvas Elements (Unified 0-100% System) */}
                {/* 0-48% = Back Cover | 48-52% = Spine | 52-100% = Front Cover */}
                {/* ... (handlers remain mostly same, logic adapts to new container) */}

                {/* ... */}

                {/* Canvas Area */}
                {/* Canvas Area with Dot Pattern */}
                <div
                    className="flex-1 overflow-hidden flex items-center justify-center p-10 relative"
                    style={{
                        backgroundColor: '#f4f4f5',
                        backgroundImage: 'radial-gradient(#cfd1d7 1.5px, transparent 1.5px)',
                        backgroundSize: '24px 24px'
                    }}
                >

                    {/* Floating Zoom Controls - Glassmorphism Dark */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-paper/90 backdrop-blur-md rounded-full shadow-2xl px-4 py-2 border border-linen ring-1 ring-black/5">
                        <button
                            onClick={() => setCanvasScale(Math.max(0.5, canvasScale - 0.1))}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-vellum transition text-umber hover:text-ink"
                            title="Zoom Out"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                        </button>
                        <div className="w-px h-5 bg-vellum"></div>
                        <span className="text-xs font-bold text-ink-soft w-12 text-center font-mono">{Math.round(canvasScale * 100)}%</span>
                        <div className="w-px h-5 bg-vellum"></div>
                        <button
                            onClick={() => setCanvasScale(Math.min(1.5, canvasScale + 0.1))}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-vellum transition text-umber hover:text-ink"
                            title="Zoom In"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                        <div className="w-px h-5 bg-vellum"></div>
                        <button
                            onClick={() => setCanvasScale(1)}
                            className="px-3 py-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-700 hover:bg-paper rounded-full transition uppercase tracking-wider"
                            title="Reset Zoom"
                        >
                            Reset
                        </button>
                    </div>

                    {/* The Unified Book Canvas */}
                    <div
                        className="relative shadow-2xl flex bg-white select-none group/canvas transition-transform duration-200"
                        style={{ height: '600px', width: '900px', transform: `scale(${canvasScale})` }}
                        onMouseMove={(e) => { handleCanvasMouseMove(e); handleShapeDragMove(e); }}
                        onMouseUp={() => { handleDragEnd(); handleShapeDragEnd(); }}
                        onMouseLeave={() => { handleDragEnd(); handleShapeDragEnd(); }}
                    >

                        {/* LAYER 1: BACKGROUND VISUALS (Back, Spine, Front) */}

                        {/* BACK COVER BG */}
                        <div
                            className="flex-1 border-r border-dashed border-red-300 relative overflow-hidden bg-cover bg-center transition-all duration-700"
                            style={getBackgroundStyle(backBgImage)}
                        >
                            {!backBgImage && <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 z-0"></div>}
                            {/* Safe Zone Indicator */}
                            {/* Safe Zone Indicator (Back Cover) */}
                            <div className="absolute inset-8 border border-red-500 border-dashed border-opacity-60 opacity-0 group-hover/canvas:opacity-100 pointer-events-none z-10 transition-opacity duration-300">
                                {/* Green Badge at Bottom */}
                                <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-0.5 rounded shadow-sm whitespace-nowrap">
                                    Safe Zone for Text
                                </div>
                            </div>

                            {/* Dynamic Publisher Logo (Bottom Left) */}
                            {book.publication && (
                                <div className="absolute bottom-8 left-8 z-10 bg-white p-2 shadow-sm flex items-center justify-center h-14">
                                    <img
                                        src={`/images/publisher_logos/${book.publication.toLowerCase().replace(/\s+/g, '_')}.png?v=2`}
                                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                                        alt={book.publication}
                                        className="h-12 w-auto object-contain"
                                    />
                                </div>
                            )}

                            {/* Barcode / ISBN (Bottom Right) */}
                            <div className="absolute bottom-8 right-8 z-10 p-2 bg-white shadow-sm flex flex-col items-center justify-center h-14">
                                <div className="flex space-x-0.5 h-12">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className={`h-full bg-vellum ${i % 3 === 0 ? 'w-0.5' : 'w-[1px]'}`}></div>
                                    ))}
                                </div>
                                {/* ISBN Removed as per request */}
                            </div>
                        </div>

                        {/* SPINE BG */}
                        <div
                            className="w-[5%] h-full relative flex items-center justify-center overflow-hidden bg-cover bg-center transition-all duration-700"
                            style={spineBgImage ? getBackgroundStyle(spineBgImage) : { backgroundColor: '#ffffff' }}
                        >
                            {/* Spine Content handled by dynamic elements */}
                        </div>
                        {/* FRONT COVER BG */}
                        <div
                            className="flex-1 relative bg-cover bg-center transition-all duration-700 ease-in-out"
                            style={getBackgroundStyle(bgImage, 'https://picsum.photos/seed/cover3/500/800')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

                            {/* Safe Zone Indicator */}
                            {/* Safe Zone Indicator (Front Cover) */}
                            <div className="absolute inset-8 border border-red-500 border-opacity-50 opacity-0 group-hover/canvas:opacity-100 pointer-events-none z-10 transition-opacity duration-300">
                                <span className="absolute -top-4 right-0 text-[10px] text-red-500 font-bold uppercase tracking-wider bg-white/80 px-1 rounded">Safe Zone</span>
                            </div>

                            {/* PublicationMart Logo Footer (Static) */}
                            <div className="absolute bottom-[5%] right-[5%] z-0 w-64">
                                <img
                                    src="/images/logo_new.png"
                                    alt="PublicationMart"
                                    className="w-full h-auto object-contain drop-shadow-md"
                                />
                            </div>
                        </div>

                        {/* LAYER 2: INTERACTIVE ELEMENTS (Overlay on top of everything) */}
                        {Object.entries(coverElements).map(([key, el]) => (
                            <div
                                key={key}
                                onMouseDown={(e) => { if (editingId !== key) handleDragStart(e, key); }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(key);
                                    setSelectedId(key);
                                    // Focus the input after a short delay
                                    setTimeout(() => {
                                        if (inlineEditRef.current) {
                                            inlineEditRef.current.focus();
                                            inlineEditRef.current.select();
                                        }
                                    }, 50);
                                }}
                                className={`absolute ${editingId === key ? 'cursor-text' : 'cursor-move'} group/element`}
                                style={{
                                    top: `${el.y}%`,
                                    left: `${el.x}%`,
                                    transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`, // Center anchor + Rotation
                                    width: el.width ? `${el.width}%` : 'auto',
                                    zIndex: editingId === key ? 100 : 50 // Higher when editing
                                }}
                            >
                                {/* Selection Box UI (Canva-like Red Theme) */}
                                {selectedId === key && (
                                    <div className="absolute -inset-3 border-2 border-red-500 border-dashed pointer-events-none rounded-sm">
                                        {/* Corner Handles */}
                                        <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-red-500 rounded-full cursor-nw-resize pointer-events-auto hover:bg-red-50 transition" onMouseDown={(e) => handleTextResizeStart(e, key, 'nw')}></div>
                                        <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-red-500 rounded-full cursor-ne-resize pointer-events-auto hover:bg-red-50 transition" onMouseDown={(e) => handleTextResizeStart(e, key, 'ne')}></div>
                                        <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-red-500 rounded-full cursor-sw-resize pointer-events-auto hover:bg-red-50 transition" onMouseDown={(e) => handleTextResizeStart(e, key, 'sw')}></div>
                                        <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-red-500 rounded-full cursor-se-resize pointer-events-auto hover:bg-red-50 transition" onMouseDown={(e) => handleTextResizeStart(e, key, 'se')}></div>

                                        {/* Edge Handles (Middle) */}
                                        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-1.5 h-4 bg-white border border-red-500 rounded-full cursor-w-resize pointer-events-auto hover:bg-red-50"></div>
                                        <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-1.5 h-4 bg-white border border-red-500 rounded-full cursor-e-resize pointer-events-auto hover:bg-red-50"></div>

                                        {/* Rotation Handle (Canva Style) */}
                                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                                            <div className="w-px h-6 bg-red-500"></div> {/* Connecting Line */}
                                            <div
                                                className="w-6 h-6 bg-white border-2 border-red-500 rounded-full flex items-center justify-center cursor-grab pointer-events-auto hover:scale-110 transition active:cursor-grabbing shadow-sm"
                                                onMouseDown={(e) => handleRotateStart(e, key)}
                                            >
                                                <svg className="w-3 h-3 text-umber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actual Text content / Inline Edit */}
                                {editingId === key ? (
                                    <input
                                        ref={inlineEditRef}
                                        type="text"
                                        value={el.text || ''}
                                        onChange={(e) => updateElementStyle('text', e.target.value)}
                                        onBlur={() => setEditingId(null)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setEditingId(null);
                                            }
                                            if (e.key === 'Escape') {
                                                setEditingId(null);
                                            }
                                        }}
                                        className="bg-transparent border-none outline-none w-full min-w-[100px]"
                                        style={{
                                            fontSize: `${el.fontSize}px`,
                                            color: el.color,
                                            fontFamily: el.fontFamily === 'font-serif' ? 'serif' : el.fontFamily === 'font-mono' ? 'monospace' : 'sans-serif',
                                            textAlign: el.textAlign || 'center',
                                            fontWeight: el.fontWeight || 'normal',
                                            fontStyle: el.fontStyle || 'normal',
                                            textDecoration: el.textDecoration || 'none',
                                            letterSpacing: `${el.letterSpacing || 0}px`,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                            caretColor: el.color
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            fontSize: `${el.fontSize}px`,
                                            color: el.color,
                                            fontFamily: el.fontFamily === 'font-serif' ? 'serif' : el.fontFamily === 'font-mono' ? 'monospace' : 'sans-serif',
                                            textAlign: el.textAlign || 'center',
                                            fontWeight: el.fontWeight || 'normal',
                                            fontStyle: el.fontStyle || 'normal',
                                            textDecoration: el.textDecoration || 'none',
                                            lineHeight: el.lineHeight || 1.4,
                                            letterSpacing: `${el.letterSpacing || 0}px`,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        {el.text || ''}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* LAYER 3: SHAPE ELEMENTS */}
                        {Object.entries(shapeElements).map(([key, shape]) => (
                            <div
                                key={key}
                                onMouseDown={(e) => handleShapeDragStart(e, key)}
                                className="absolute cursor-move"
                                style={{
                                    top: `${shape.y}%`,
                                    left: `${shape.x}%`,
                                    width: `${shape.width}%`,
                                    height: `${shape.height}%`,
                                    transform: `translate(-50%, -50%) rotate(${shape.rotation || 0}deg)`,
                                    opacity: shape.opacity,
                                    zIndex: 60
                                }}
                            >
                                {/* Selection Box for Shapes */}
                                {selectedShapeId === key && (
                                    <div className="absolute -inset-2 border-2 border-blue-500 pointer-events-none rounded">
                                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize"></div>
                                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize"></div>
                                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize"></div>
                                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize"></div>
                                        {/* Delete button */}
                                        <div
                                            onClick={(e) => { e.stopPropagation(); deleteShape(key); }}
                                            className="absolute -top-8 right-0 w-6 h-6 bg-red-500 hover:bg-red-600 shadow rounded-full flex items-center justify-center cursor-pointer pointer-events-auto transition"
                                            title="Delete Shape"
                                        >
                                            <svg className="w-3 h-3 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </div>
                                    </div>
                                )}

                                {/* Shape Rendering */}
                                {shape.type === 'rectangle' || shape.type === 'square' || shape.type === 'roundedRect' ? (
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            backgroundColor: shape.color,
                                            borderRadius: shape.type === 'roundedRect' ? '12px' : shape.type === 'circle' ? '50%' : '0',
                                            border: shape.borderWidth > 0 ? `${shape.borderWidth}px solid ${shape.borderColor}` : 'none'
                                        }}
                                    ></div>
                                ) : shape.type === 'circle' ? (
                                    <div
                                        className="w-full h-full rounded-full"
                                        style={{
                                            backgroundColor: shape.color,
                                            border: shape.borderWidth > 0 ? `${shape.borderWidth}px solid ${shape.borderColor}` : 'none'
                                        }}
                                    ></div>
                                ) : shape.type === 'triangle' ? (
                                    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                                        <polygon points="50,10 90,90 10,90" fill={shape.color} stroke={shape.borderColor} strokeWidth={shape.borderWidth} />
                                    </svg>
                                ) : shape.type === 'diamond' ? (
                                    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                                        <polygon points="50,5 95,50 50,95 5,50" fill={shape.color} stroke={shape.borderColor} strokeWidth={shape.borderWidth} />
                                    </svg>
                                ) : shape.type === 'star' ? (
                                    <svg viewBox="0 0 24 24" className="w-full h-full" fill={shape.color} stroke={shape.borderColor} strokeWidth={shape.borderWidth > 0 ? shape.borderWidth / 10 : 0}>
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ) : shape.type === 'heart' ? (
                                    <svg viewBox="0 0 24 24" className="w-full h-full" fill={shape.color} stroke={shape.borderColor} strokeWidth={shape.borderWidth > 0 ? shape.borderWidth / 10 : 0}>
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                ) : shape.type === 'hexagon' ? (
                                    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                                        <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fill={shape.color} stroke={shape.borderColor} strokeWidth={shape.borderWidth} />
                                    </svg>
                                ) : shape.type === 'line' ? (
                                    <div className="w-full h-full flex items-center">
                                        <div className="w-full" style={{ height: '4px', backgroundColor: shape.color }}></div>
                                    </div>
                                ) : shape.type === 'lineVertical' ? (
                                    <div className="w-full h-full flex justify-center">
                                        <div className="h-full" style={{ width: '4px', backgroundColor: shape.color }}></div>
                                    </div>
                                ) : shape.type === 'arrow' ? (
                                    <svg viewBox="0 0 100 24" className="w-full h-full" preserveAspectRatio="none">
                                        <line x1="0" y1="12" x2="80" y2="12" stroke={shape.color} strokeWidth="4" />
                                        <polygon points="75,4 95,12 75,20" fill={shape.color} />
                                    </svg>
                                ) : (
                                    <div className="w-full h-full" style={{ backgroundColor: shape.color }}></div>
                                )}
                            </div>
                        ))}

                    </div>
                </div>
            </div>

            {/* PREVIEW MODAL */}
            {showPreview && (
                <div
                    className="fixed inset-0 bg-paper z-[100] flex items-center justify-center p-8 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setShowPreview(false)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowPreview(false); }}
                        className="absolute top-6 left-6 px-4 py-2 bg-vellum hover:bg-vellum text-ink rounded-lg backdrop-blur-md transition border border-linen text-sm font-medium flex items-center gap-2 z-[110]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Editor
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); setShowPreview(false); }}
                        className="absolute top-6 right-6 text-ink/80 hover:text-ink transition transform hover:scale-110 hover:rotate-90 duration-300 z-[110]"
                        title="Close Preview (ESC)"
                    >
                        <svg className="w-10 h-10 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    <div
                        className="bg-paper rounded-2xl overflow-hidden shadow-2xl border border-linen max-w-5xl w-full mx-4 flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-linen bg-paper">
                            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                                <span className="p-1.5 bg-indigo-500/20 text-indigo-700 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </span>
                                Cover Preview
                            </h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 bg-vellum hover:bg-vellum text-ink text-sm font-bold rounded-lg transition-colors border border-linen flex items-center gap-2"
                            >
                                <span>Close Preview</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-paper">
                            <div
                                className="relative shadow-2xl flex bg-white mx-auto transition-transform"
                                style={{ height: '550px', width: '825px' }}
                            >
                                {/* Layer 1: Backgrounds */}
                                <div className="absolute inset-0 flex w-full h-full z-0">
                                    {/* Back Cover Preview */}
                                    <div className="flex-1 relative bg-cover bg-center" style={getBackgroundStyle(backBgImage)}>
                                        {!backBgImage && <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50"></div>}

                                        {/* Dynamic Publisher Logo (Bottom Left) */}
                                        {book.publication && (
                                            <div className="absolute bottom-6 left-6 z-10 bg-white p-1.5 shadow-sm flex items-center justify-center h-10">
                                                <img
                                                    src={`/images/publisher_logos/${book.publication.toLowerCase().replace(/\s+/g, '_')}.png?v=2`}
                                                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                                                    alt={book.publication}
                                                    className="h-8 w-auto object-contain"
                                                />
                                            </div>
                                        )}

                                        {/* Barcode / ISBN (Bottom Right) */}
                                        <div className="absolute bottom-6 right-6 z-10 p-1.5 bg-white shadow-sm flex flex-col items-center justify-center h-10">
                                            <div className="flex space-x-0.5 h-8">
                                                {[...Array(20)].map((_, i) => (
                                                    <div key={i} className={`h-full bg-vellum ${i % 3 === 0 ? 'w-0.5' : 'w-[1px]'}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Spine Preview */}
                                    <div
                                        className="w-[5.33%] flex items-center justify-center overflow-hidden border-l border-r border-linen bg-cover bg-center"
                                        style={spineBgImage ? getBackgroundStyle(spineBgImage) : { backgroundColor: '#ffffff' }}
                                    >
                                    </div>
                                    {/* Front Cover Preview */}
                                    <div className="flex-1 relative bg-cover bg-center" style={getBackgroundStyle(bgImage, 'https://picsum.photos/seed/cover3/500/800')}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

                                        {/* PublicationMart Logo Footer (Static) */}
                                        <div className="absolute bottom-[5%] right-[5%] z-10 w-40">
                                            <img
                                                src="/images/logo_new.png"
                                                alt="PublicationMart"
                                                className="w-full h-auto object-contain drop-shadow-md"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Layer 2: Global Elements Overlay */}
                                <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                                    {Object.entries(coverElements).map(([key, el]) => (
                                        <div key={key} className="absolute" style={{
                                            top: `${el.y}%`,
                                            left: `${el.x}%`,
                                            transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`,
                                            width: el.width ? `${el.width}%` : 'auto',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            zIndex: 20
                                        }}>
                                            <div style={{
                                                fontSize: `${(el.fontSize / 600) * 550}px`, // Scale font size to match preview height
                                                color: el.color,
                                                fontFamily: el.fontFamily === 'font-serif' ? 'serif' : el.fontFamily === 'font-mono' ? 'monospace' : 'sans-serif',
                                                fontWeight: el.fontWeight,
                                                textAlign: el.textAlign || 'center',
                                                lineHeight: el.lineHeight || 1.4,
                                                fontStyle: el.fontStyle || 'normal',
                                                textDecoration: el.textDecoration || 'none',
                                                letterSpacing: `${el.letterSpacing || 0}px`,
                                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                            }}>
                                                {el.text || ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Shapes Overlay (Inside Global Layer) */}
                                <div className="absolute inset-0 w-full h-full z-15 pointer-events-none">
                                    {Object.entries(shapeElements).map(([key, shape]) => (
                                        <div key={key} className="absolute" style={{
                                            top: `${shape.y}%`,
                                            left: `${shape.x}%`,
                                            width: `${shape.width}%`,
                                            height: `${shape.height}%`,
                                            transform: `translate(-50%, -50%) rotate(${shape.rotation || 0}deg)`,
                                            opacity: shape.opacity,
                                            zIndex: 15
                                        }}>
                                            {/* Shape Rendering - simplified for preview */}
                                            {shape.type === 'rectangle' || shape.type === 'square' || shape.type === 'roundedRect' ? (
                                                <div className="w-full h-full" style={{
                                                    backgroundColor: shape.color,
                                                    borderRadius: shape.type === 'roundedRect' ? '12px' : '0',
                                                    border: shape.borderWidth > 0 ? `${shape.borderWidth}px solid ${shape.borderColor}` : 'none'
                                                }}></div>
                                            ) : shape.type === 'circle' ? (
                                                <div className="w-full h-full rounded-full" style={{
                                                    backgroundColor: shape.color,
                                                    border: shape.borderWidth > 0 ? `${shape.borderWidth}px solid ${shape.borderColor}` : 'none'
                                                }}></div>
                                            ) : (
                                                <div className="w-full h-full" style={{ backgroundColor: shape.color }}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GUIDELINES MODAL */}
            {
                showGuidelines && (
                    <div className="fixed inset-0 bg-paper z-[100] flex items-center justify-center p-4 overflow-auto">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 sticky top-0">
                                <h2 className="text-2xl font-bold text-ink">📚 Book Cover Design Guidelines</h2>
                                <p className="text-indigo-700 text-sm mt-1">Follow these best practices for a professional, print-ready cover</p>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Dimensions */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                            <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm">📐</span>
                                            Recommended Dimensions
                                        </h3>
                                        <ul className="space-y-2 text-sm text-umber">
                                            <li>• <strong>Front Cover:</strong> 6" x 9" (1800 x 2700 pixels at 300 DPI)</li>
                                            <li>• <strong>Full Wrap:</strong> Include spine and back cover</li>
                                            <li>• <strong>Bleed Area:</strong> Add 0.125" (0.3175 cm) on all edges</li>
                                            <li>• <strong>Safe Zone:</strong> Keep important content 0.25" from edges</li>
                                        </ul>
                                    </div>

                                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                            <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm">🎨</span>
                                            Color & Quality
                                        </h3>
                                        <ul className="space-y-2 text-sm text-umber">
                                            <li>• Use <strong>CMYK color mode</strong> for printing</li>
                                            <li>• Minimum <strong>300 DPI resolution</strong></li>
                                            <li>• Avoid pure black, use rich black (C:40, M:30, Y:30, K:100)</li>
                                            <li>• Keep backgrounds high contrast for readability</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Typography */}
                                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm">✍️</span>
                                        Typography Best Practices
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-4 text-sm text-umber">
                                        <div>
                                            <strong className="text-gray-800">Title</strong>
                                            <p>• 48-72pt font size</p>
                                            <p>• Bold, eye-catching</p>
                                            <p>• Readable from thumbnail</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-800">Subtitle</strong>
                                            <p>• 24-36pt font size</p>
                                            <p>• Complement the title</p>
                                            <p>• Don't overpower</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-800">Author Name</strong>
                                            <p>• 18-24pt font size</p>
                                            <p>• Clear and legible</p>
                                            <p>• Bottom of cover</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Do's and Don'ts */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                                        <h3 className="font-bold text-green-800 flex items-center gap-2 mb-4">
                                            <span className="text-xl">✅</span> Do's
                                        </h3>
                                        <ul className="space-y-2 text-sm text-umber">
                                            <li>✓ Use high-quality, relevant images</li>
                                            <li>✓ Keep the design simple and focused</li>
                                            <li>✓ Ensure title is readable as thumbnail</li>
                                            <li>✓ Test your cover at different sizes</li>
                                            <li>✓ Match cover style to your genre</li>
                                            <li>✓ Include barcode space on back cover</li>
                                        </ul>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                                        <h3 className="font-bold text-red-800 flex items-center gap-2 mb-4">
                                            <span className="text-xl">❌</span> Don'ts
                                        </h3>
                                        <ul className="space-y-2 text-sm text-umber">
                                            <li>✗ Don't use low-resolution images</li>
                                            <li>✗ Avoid too many fonts (max 2-3)</li>
                                            <li>✗ Don't put text too close to edges</li>
                                            <li>✗ Avoid cluttered, busy designs</li>
                                            <li>✗ Don't use copyrighted images</li>
                                            <li>✗ Avoid hard-to-read color combos</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Spine Info */}
                                <div className="bg-gray-100 rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <span className="w-8 h-8 bg-vellum text-ink rounded-lg flex items-center justify-center text-sm">📖</span>
                                        Spine Guidelines
                                    </h3>
                                    <p className="text-sm text-umber">
                                        The spine width depends on your page count. For books under <strong>100 pages</strong>, spine text may not be printable.
                                        Our system will automatically calculate the correct spine width based on your interior file.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 px-8 py-5 bg-gray-50 sticky bottom-0 flex justify-between items-center">
                                <label className="flex items-center gap-2 text-sm text-umber cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    Don't show this again
                                </label>
                                <button
                                    onClick={() => setShowGuidelines(false)}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                                >
                                    Got it, Let's Design! 🎨
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* HIDDEN CAPTURE AREA - FULL WRAP (High Resolution for PDF/Print) */}
            <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '1500px', height: '1000px', pointerEvents: 'none' }}>
                <div
                    ref={captureRef}
                    className="relative w-full h-full flex bg-white overflow-hidden"
                >
                    {/* 1. BACK COVER BG */}
                    <div className="flex-1 relative bg-cover bg-center" style={getBackgroundStyle(backBgImage)}>
                        {/* Explicit Image for Capture (Cross-Origin Fix) */}
                        {backBgImage && (typeof backBgImage === 'string') && (backBgImage.startsWith('http') || backBgImage.startsWith('data:')) && (
                            <img src={backBgImage} className="absolute inset-0 w-full h-full object-cover z-0" crossOrigin="anonymous" alt="" />
                        )}

                        {/* Dynamic Publisher Logo (Bottom Left) - Captured */}
                        {book.publication && (
                            <div className="absolute bottom-[5%] left-[6%] z-10 bg-white p-[1%] shadow-sm flex items-center justify-center">
                                <img
                                    src={`/images/publisher_logos/${book.publication.toLowerCase().replace(/\s+/g, '_')}.png`}
                                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                                    alt={book.publication}
                                    className="h-14 w-auto object-contain"
                                    crossOrigin="anonymous"
                                />
                            </div>
                        )}

                        {/* Barcode / ISBN (Bottom Right) - Captured */}
                        <div className="absolute bottom-[5%] right-[6%] z-10 p-[1%] bg-white shadow-sm flex flex-col items-center justify-center">
                            <div className="flex space-x-1 h-14">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className={`h-full bg-vellum ${i % 3 === 0 ? 'w-1.5' : 'w-0.5'}`}></div>
                                ))}
                            </div>
                            {/* ISBN Removed as per request */}
                        </div>
                    </div>

                    {/* 2. SPINE PLACEHOLDER */}
                    <div className="w-[4%] bg-gray-200 border-l border-r border-gray-300 relative">
                        <div className="absolute inset-0 flex items-center justify-center transform -rotate-90">
                            <span className="text-umber text-xs tracking-[0.2em] font-sans font-bold uppercase whitespace-nowrap opacity-50">{book.title}</span>
                        </div>
                    </div>

                    {/* 3. FRONT COVER BG */}
                    <div className="flex-1 relative bg-cover bg-center" style={getBackgroundStyle(bgImage, 'https://picsum.photos/seed/cover3/500/800')}>
                        {/* Explicit Image for Capture */}
                        {bgImage && (typeof bgImage === 'string') && (bgImage.startsWith('http') || bgImage.startsWith('data:')) && (
                            <img src={bgImage} className="absolute inset-0 w-full h-full object-cover z-0" crossOrigin="anonymous" alt="" />
                        )}
                        {/* Gradient Overlay for Front */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none z-10"></div>

                        {/* PublicationMart Logo Footer (Static Capture) */}
                        <div className="absolute bottom-[5%] right-[5%] z-10 w-[32%]">
                            <img
                                src="/images/logo_new.png"
                                alt="PublicationMart"
                                className="w-full h-auto object-contain"
                                crossOrigin="anonymous"
                            />
                        </div>
                    </div>

                    {/* 4. ELEMENTS OVERLAY (Spans entire spread 0-100%) */}
                    <div className="absolute inset-0 z-20">
                        {/* Text Elements (ALL) */}
                        {Object.entries(coverElements).map(([key, el]) => (
                            <div key={key} className="absolute" style={{
                                top: `${el.y}%`,
                                left: `${el.x}%`,
                                transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`,
                                width: el.width ? `${el.width}%` : 'auto',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                <div style={{
                                    fontSize: `${el.fontSize * 1.66}px`, // Scaled for 1500px width (1.66x of 900px)
                                    color: el.color,
                                    fontFamily: el.fontFamily === 'font-serif' ? 'serif' : 'sans-serif',
                                    fontWeight: el.fontWeight,
                                    textShadow: !key.includes('back') ? '0 3px 6px rgba(0,0,0,0.6)' : 'none',
                                    textAlign: el.textAlign || 'center',
                                    lineHeight: el.lineHeight || 1.4,
                                    letterSpacing: `${(el.letterSpacing || 0) * 1.66}px`
                                }}>
                                    {el.text || ''}
                                </div>
                            </div>
                        ))}

                        {/* Shape Elements */}
                        {Object.entries(shapeElements).map(([key, shape]) => (
                            <div key={key} className="absolute" style={{ top: `${shape.y}%`, left: `${shape.x}%`, width: `${shape.width}%`, height: `${shape.height}%`, transform: `translate(-50%, -50%) rotate(${shape.rotation || 0}deg)`, opacity: shape.opacity }}>
                                <div className="w-full h-full" style={{
                                    backgroundColor: shape.color,
                                    borderRadius: shape.type === 'circle' ? '50%' : shape.type === 'roundedRect' ? '12px' : '0',
                                    border: shape.borderWidth > 0 ? `${shape.borderWidth}px solid ${shape.borderColor}` : 'none'
                                }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
