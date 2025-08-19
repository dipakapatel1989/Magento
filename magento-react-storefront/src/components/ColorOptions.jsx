// JavaScript
// Interactive swatch list if onSelect is provided; otherwise read-only.
export default function ColorOptions({ values = [], size = 18, selectedValueIndex, onSelect }) {
    if (!values?.length) return null

    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            {values.map(v => {
                const swatch = v?.swatch_data?.value || ''
                const isColor = /^#([0-9A-F]{3}){1,2}$/i.test(swatch)
                const isSelected = selectedValueIndex === v.value_index
                const baseStyle = {
                    display: 'inline-block',
                    border: isSelected ? '2px solid #111' : '1px solid rgba(0,0,0,0.15)',
                    outline: 'none',
                    cursor: onSelect ? 'pointer' : 'default',
                }

                if (isColor) {
                    const style = {
                        ...baseStyle,
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        backgroundColor: swatch,
                    }
                    return onSelect ? (
                        <button
                            key={v.uid}
                            type="button"
                            title={v.label}
                            aria-label={v.label}
                            aria-pressed={isSelected}
                            onClick={() => onSelect?.(v)}
                            style={style}
                        />
                    ) : (
                        <span key={v.uid} title={v.label} aria-label={v.label} style={style} />
                    )
                }

                // Fallback label chip
                const chip = (
                    <span
                        style={{
                            ...baseStyle,
                            fontSize: 12,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: isSelected ? 'rgba(0,0,0,0.05)' : 'transparent',
                        }}
                    >
            {v.label}
          </span>
                )
                return onSelect ? (
                    <button
                        key={v.uid}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onSelect?.(v)}
                        style={{ all: 'unset' }}
                    >
                        {chip}
                    </button>
                ) : (
                    <span key={v.uid}>{chip}</span>
                )
            })}
        </div>
    )
}