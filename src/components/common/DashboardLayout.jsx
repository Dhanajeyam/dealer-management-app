import React, { useState } from 'react'
import { Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export default function DashboardLayout({
  brandTitle,
  brandSubtitle,
  brandIcon,
  brandAction,
  navItems = [],
  bottomNavItems,
  activeTab,
  onTabChange,
  headerTitle,
  headerSubtitle,
  headerActions,
  children
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleNavItemClick = (itemId) => {
    onTabChange(itemId)
    setIsMobileOpen(false)
  }

  // Derive bottom navigation items
  const primaryTabs = bottomNavItems || navItems.filter(item => item.primary)
  const bottomTabs = primaryTabs.length > 0 ? primaryTabs : navItems.slice(0, 4)
  const secondaryTabs = navItems.filter(item => !bottomTabs.some(p => p.id === item.id))

  return (
    <div className={`dashboard-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Drawer Overlay Backdrop */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
        onTouchEnd={(e) => {
          e.preventDefault()
          setIsMobileOpen(false)
        }}
        role="button"
        tabIndex={0}
        aria-label="Close menu backdrop"
      />

      {/* Left Sidebar Layout */}
      <aside className={`dashboard-sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-info">
            {brandIcon && (
              <div className="sidebar-brand-logo" title={brandTitle}>
                {brandIcon}
              </div>
            )}
            <div className="sidebar-brand-text" style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between' }}>
                <h1 className="sidebar-brand-title">{brandTitle}</h1>
              </div>
              {brandSubtitle && (
                <span className="sidebar-brand-sub">{brandSubtitle}</span>
              )}
              {brandAction && (
                <div style={{ marginTop: '0.35rem' }}>
                  {brandAction}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="desktop-collapse-btn"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          {/* Close button inside mobile drawer */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="mobile-close-btn"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Vertical Navigation Links */}
        <div className="sidebar-nav-container">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <div className="sidebar-nav-item-left">
                  {Icon && (
                    <Icon 
                      size={18} 
                      color={item.color || (isActive ? 'var(--primary)' : 'var(--text-muted)')} 
                    />
                  )}
                  <span className="sidebar-nav-text">{item.label}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <span className="sidebar-footer-text">ChemicalShop App</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>v0.1.0</span>
        </div>
      </aside>

      {/* Right Content Area */}
      <div className="dashboard-main-content">
        {/* Slim Top Bar */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              title="Toggle Menu"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="dashboard-topbar-title">{headerTitle}</h2>
              {headerSubtitle && (
                <div className="dashboard-topbar-subtitle">{headerSubtitle}</div>
              )}
            </div>
          </div>

          <div className="dashboard-topbar-right">
            {headerActions}
          </div>
        </header>

        {/* Page Content Body */}
        <main className="container" style={{ flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Mobile Native Bottom Navigation Bar for Primary Destinations */}
      {bottomTabs.length > 0 && (
        <nav className="mobile-bottom-nav" aria-label="Primary Mobile Navigation">
          {bottomTabs.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const displayLabel = item.shortLabel || item.label

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
                aria-label={item.label}
              >
                {isActive && <div className="mobile-bottom-nav-indicator" />}
                {Icon && (
                  <Icon 
                    size={20} 
                    className="mobile-bottom-nav-icon"
                    color={isActive ? 'var(--primary)' : 'var(--text-muted)'} 
                  />
                )}
                <span>{displayLabel}</span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
