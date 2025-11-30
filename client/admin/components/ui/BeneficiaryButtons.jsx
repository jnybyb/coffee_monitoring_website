import React from "react";

export const AddButton = ({
  children,
  onClick,
  disabled = false,
  size = "medium",
  icon,
  backgroundColor,
  color,
  borderColor,
  fontSize,
  padding,
  borderRadius,
  style = {},
}) => {
  // Define size-based defaults (can be overridden by props)
  const buttonSizes = {
    small: {
      padding: padding || "4px 10px",
      fontSize: fontSize || "0.8rem",
      borderRadius: borderRadius || "4px",
    },
    medium: {
      padding: padding || "8px 16px",
      fontSize: fontSize || "0.9rem",
      borderRadius: borderRadius || "6px",
    },
    large: {
      padding: padding || "12px 24px",
      fontSize: fontSize || "1rem",
      borderRadius: borderRadius || "8px",
    },
  };

  const sizeConfig = buttonSizes[size] || buttonSizes.medium;

  // Core button styles — no fixed theme colors
  const buttonStyles = {
    ...sizeConfig,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 500,
    border: borderColor ? `1px solid ${borderColor}` : "none",
    backgroundColor: backgroundColor || "#007bff", // default blue
    color: color || "#fff",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease",
    ...style, // allow overriding styles from child
  };

  // Mouse interactions for click animation
  const handleMouseDown = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(0.96)";
    }
  };

  const handleMouseUp = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(1)";
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(1)";
    }
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={buttonStyles}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Optional icon slot */}
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}

      {/* Button text or children */}
      {children}
    </button>
  );
};

export const CancelButton = ({
  children,
  onClick,
  disabled = false,
  size = "medium",
  icon,
  backgroundColor,
  color,
  borderColor,
  fontSize,
  padding,
  borderRadius,
  style = {},
}) => {
  // Define size-based defaults with constant values from AddRecordModal
  const buttonSizes = {
    small: {
      padding: padding || "4px 10px",
      fontSize: fontSize || "10px",
      borderRadius: borderRadius || "4px",
    },
    medium: {
      padding: padding || "10px 20px",
      fontSize: fontSize || "10px",
      borderRadius: borderRadius || "6px",
    },
    large: {
      padding: padding || "12px 24px",
      fontSize: fontSize || "10px",
      borderRadius: borderRadius || "8px",
    },
  };

  const sizeConfig = buttonSizes[size] || buttonSizes.medium;

  // Core button styles with constant values from AddRecordModal
  const buttonStyles = {
    ...sizeConfig,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: fontSize || "13px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 500,
    border: borderColor ? `1px solid ${borderColor}` : "1px solid var(--dark-green)",
    backgroundColor: backgroundColor || "white",
    color: color || "var(--dark-green)",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease",
    ...style, // allow overriding styles from child
  };

  // Mouse interactions for click animation (no hover effects per policy)
  const handleMouseDown = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(0.96)";
    }
  };

  const handleMouseUp = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(1)";
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(1)";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={buttonStyles}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Optional icon slot */}
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}

      {/* Button text or children */}
      {children || "Cancel"}
    </button>
  );
};

export const SaveButton = ({
  children,
  onClick,
  disabled = false,
  size = "medium",
  icon,
  backgroundColor,
  color,
  borderColor,
  fontSize,
  padding,
  borderRadius,
  style = {},
}) => {
  // Define size-based defaults with fixed constant values
  const buttonSizes = {
    small: {
      padding: padding || "4px 10px",
      fontSize: fontSize || "10px",
      borderRadius: borderRadius || "4px",
    },
    medium: {
      padding: padding || "10px 20px",
      fontSize: fontSize || "10px",
      borderRadius: borderRadius || "6px",
    },
    large: {
      padding: padding || "12px 24px",
      fontSize: fontSize || "10px",
      borderRadius: borderRadius || "8px",
    },
  };

  const sizeConfig = buttonSizes[size] || buttonSizes.medium;

  // Core button styles with fixed values for save button
  const buttonStyles = {
    ...sizeConfig,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: fontSize || "13px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 500,
    border: borderColor ? `1px solid ${borderColor}` : "none",
    backgroundColor: backgroundColor || "var(--dark-green)",
    color: color || "white",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease",
    ...style, // allow overriding styles from child
  };

  // Mouse interactions for click animation (no hover effects per policy)
  const handleMouseDown = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(0.96)";
    }
  };

  const handleMouseUp = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(1)";
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(1)";
    }
  };

  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      style={buttonStyles}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Optional icon slot */}
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}

      {/* Button text or children */}
      {children || "Save"}
    </button>
  );
};

export const ViewModeButton = ({
  children,
  onClick,
  disabled = false,
  icon,
  isActive = false,
  style = {},
}) => {
  // Core button styles for view mode buttons
  const buttonStyles = {
    padding: '0.4rem 0.7rem',
    border: '1px solid #ddd',
    background: isActive ? 'var(--dark-green)' : 'white',
    color: isActive ? 'white' : '#666',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.6rem',
    fontWeight: '500',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  // Mouse interactions for click animation (no hover effects per policy)
  const handleMouseDown = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(0.96)';
    }
  };

  const handleMouseUp = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={buttonStyles}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Optional icon slot */}
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}

      {/* Button text or children */}
      {children}
    </button>
  );
};

export const AddCoordinateButton = ({
  children,
  onClick,
  disabled = false,
  icon,
  fontSize,
  padding,
  borderRadius,
  style = {},
}) => {
  // Core button styles for add coordinate button
  const buttonStyles = {
    padding: padding || '5px 10px',
    fontSize: fontSize || '10px',
    borderRadius: borderRadius || '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500,
    border: '1px solid var(--dark-green)',
    backgroundColor: 'var(--pagination-hover)',
    color: 'var(--dark-green)',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    marginTop: '6px',
    ...style,
  };

  // Mouse interactions for click animation
  const handleMouseDown = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(0.96)';
    }
  };

  const handleMouseUp = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  return (
    <button
      type="button"
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={buttonStyles}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Optional icon slot */}
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}

      {/* Button text or children */}
      {children || '+ Add Coordinate Point'}
    </button>
  );
};

export const ActionButton = ({
  children,
  onClick,
  disabled = false,
  size = "medium",
  icon,
  backgroundColor,
  color,
  borderColor,
  fontSize,
  padding,
  borderRadius,
  style = {},
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
}) => {
  // Define size-based defaults
  const buttonSizes = {
    small: {
      padding: padding || "4px 10px",
      fontSize: fontSize || "0.7rem",
      borderRadius: borderRadius || "4px",
    },
    medium: {
      padding: padding || "6px 12px",
      fontSize: fontSize || "0.75rem",
      borderRadius: borderRadius || "6px",
    },
    large: {
      padding: padding || "8px 16px",
      fontSize: fontSize || "0.8rem",
      borderRadius: borderRadius || "8px",
    },
  };

  const sizeConfig = buttonSizes[size] || buttonSizes.medium;

  // Core button styles
  const buttonStyles = {
    ...sizeConfig,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 500,
    border: borderColor ? `1px solid ${borderColor}` : "1px solid #ddd",
    backgroundColor: backgroundColor || "white",
    color: color || "#333",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease",
    ...style,
  };

  // Mouse interactions for click animation
  const handleMouseDown = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(0.96)";
    }
    // Call custom onMouseDown if provided
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const handleMouseUp = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(1)";
    }
    // Call custom onMouseUp if provided
    if (onMouseUp) {
      onMouseUp(e);
    }
  };

  const handleMouseEnter = (e) => {
    // Call custom onMouseEnter if provided
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = "scale(1)";
    }
    // Call custom onMouseLeave if provided
    if (onMouseLeave) {
      onMouseLeave(e);
    }
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={buttonStyles}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Optional icon slot */}
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}

      {/* Button text or children */}
      {children}
    </button>
  );
};
