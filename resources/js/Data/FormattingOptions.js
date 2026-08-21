export const availableFonts = [
    { name: 'Georgia', family: 'Georgia, serif', category: 'Serif' },
    { name: 'Garamond', family: '"EB Garamond", Garamond, serif', category: 'Serif' },
    { name: 'Times New Roman', family: '"Times New Roman", Times, serif', category: 'Serif' },
    { name: 'Palatino', family: '"Palatino Linotype", Palatino, serif', category: 'Serif' },
    { name: 'Baskerville', family: 'Baskerville, serif', category: 'Serif' },
    { name: 'Merriweather', family: 'Merriweather, serif', category: 'Serif' },
    { name: 'Lora', family: 'Lora, serif', category: 'Serif' },
    { name: 'Arial', family: 'Arial, sans-serif', category: 'Sans-Serif' },
    { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'Sans-Serif' },
    { name: 'Open Sans', family: '"Open Sans", sans-serif', category: 'Sans-Serif' },
    { name: 'Roboto', family: 'Roboto, sans-serif', category: 'Sans-Serif' },
    { name: 'Courier New', family: '"Courier New", Courier, monospace', category: 'Monospace' },
];

export const fontSizes = ['10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];

export const lineHeights = [
    { label: 'Single', value: '1' },
    { label: '1.15', value: '1.15' },
    { label: '1.5', value: '1.5' },
    { label: 'Double', value: '2' },
    { label: '1.8 (Book)', value: '1.8' },
    { label: '2.5', value: '2.5' },
];

export const colorPalette = [
    '#000000', '#1e293b', '#334155', '#475569', '#64748b',
    '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d',
    '#16a34a', '#059669', '#0d9488', '#0891b2', '#0284c7',
    '#2563eb', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3',
];

export const highlightColors = [
    'transparent', '#fef08a', '#fde047', '#fcd34d', '#fdba74',
    '#fca5a5', '#f9a8d4', '#c4b5fd', '#a5b4fc', '#93c5fd',
    '#6ee7b7', '#86efac', '#bef264',
];

export const specialCharacters = [
    { char: '—', name: 'Em Dash' },
    { char: '–', name: 'En Dash' },
    { char: '…', name: 'Ellipsis' },
    { char: '\u201C', name: 'Left Quote' },
    { char: '\u201D', name: 'Right Quote' },
    { char: '\u2018', name: 'Left Single' },
    { char: '\u2019', name: 'Right Single' },
    { char: '©', name: 'Copyright' },
    { char: '®', name: 'Registered' },
    { char: '™', name: 'Trademark' },
    { char: '§', name: 'Section' },
    { char: '¶', name: 'Paragraph' },
    { char: '†', name: 'Dagger' },
    { char: '‡', name: 'Double Dagger' },
    { char: '•', name: 'Bullet' },
    { char: '№', name: 'Numero' },
];

// Ornamental scene break designs (Unicode-based, no image files needed)
export const sceneBreakOrnaments = [
    { id: 'asterism', label: 'Asterism', symbol: '⁂', style: 'letter-spacing: 0.5em; font-size: 1.5rem;' },
    { id: 'three-dots', label: 'Three Dots', symbol: '• • •', style: 'letter-spacing: 0.8em; font-size: 1rem;' },
    { id: 'three-stars', label: 'Three Stars', symbol: '✦ ✦ ✦', style: 'letter-spacing: 0.6em; font-size: 1.1rem;' },
    { id: 'floral', label: 'Floral', symbol: '❧', style: 'font-size: 2rem;' },
    { id: 'diamond', label: 'Diamond', symbol: '◆', style: 'font-size: 1.3rem;' },
    { id: 'three-diamonds', label: 'Three Diamonds', symbol: '◇ ◆ ◇', style: 'letter-spacing: 0.4em; font-size: 1.1rem;' },
    { id: 'flourish', label: 'Flourish', symbol: '─── ✿ ───', style: 'font-size: 1rem; letter-spacing: 0.1em;' },
    { id: 'wave', label: 'Wave', symbol: '〰〰〰', style: 'font-size: 1.2rem; letter-spacing: 0.2em;' },
    { id: 'leaf', label: 'Leaf', symbol: '🙠  ❦  🙢', style: 'font-size: 1.2rem; letter-spacing: 0.2em;' },
    { id: 'dashes', label: 'Long Dash', symbol: '———', style: 'font-size: 1.2rem; letter-spacing: 0.3em;' },
    { id: 'ornate-star', label: 'Ornate Star', symbol: '✴', style: 'font-size: 1.8rem;' },
    { id: 'double-line', label: 'Double Line', symbol: '═══════', style: 'font-size: 0.8rem; letter-spacing: 0.05em;' },
];
