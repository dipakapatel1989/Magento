// JavaScript: src/components/NavMenu.jsx
import { Link } from 'react-router-dom'
import { useState } from 'react'


function NestedList({ nodes, onNavigate, asDropdown = false }) {
    if (!nodes?.length) return null

    return (
        <ul className={asDropdown ? 'dropdown-level' : 'mobile-submenu'}>
            {nodes.map(node => (
                <li key={node.uid} className={asDropdown ? 'dropdown-item' : 'mobile-menu-item'}>
                    <Link
                        className={asDropdown ? 'dropdown-link' : undefined}
                        to={`/category/${node.uid}`}
                        onClick={onNavigate}
                    >
                        {node.name}
                    </Link>

                    {/* Recursively render deeper levels */}
                    {!!node.children?.length && (
                        <NestedList nodes={node.children} onNavigate={onNavigate} asDropdown={asDropdown} />
                    )}
                </li>
            ))}
        </ul>
    )
}

export default function NavMenu({ label, categories, variant = 'desktop', onNavigate }) {
    const [show, setShow] = useState(false)
    const isMobile = variant === 'mobile'

    if (isMobile) {
        // Accordion-style list for mobile (all nested levels)
        return (
            <div className="mobile-menu">
                <div className="mobile-menu-label">{label}</div>
                <ul className="mobile-menu-list">
                    {(categories || []).map(cat => (
                        <li key={cat.uid} className="mobile-menu-item">
                            <Link to={`/category/${cat.uid}`} onClick={onNavigate}>{cat.name}</Link>
                            {!!cat.children?.length && (
                                <NestedList nodes={cat.children} onNavigate={onNavigate} />
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    // Desktop hover dropdown (all nested levels)
    return (
        <div
            className="nav-item"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <button className="nav-button" aria-haspopup="true" aria-expanded={show}>
                {label}
            </button>
            {show && (
                <div className="dropdown" role="menu">
                    {(categories || []).map(cat => (
                        <div key={cat.uid} className="dropdown-group">
                            <Link className="dropdown-parent" to={`/category/${cat.uid}`}>{cat.name}</Link>
                            {!!cat.children?.length && (
                                <NestedList nodes={cat.children} onNavigate={onNavigate} asDropdown />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}