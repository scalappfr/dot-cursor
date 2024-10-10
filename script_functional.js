// Function that get called first
function cursor(options = []) {
  const cursor = {
    delay: 8,
    outlineX: 0,
    outlineY: 0,
    endX: window.innerWidth / 2,
    endY: window.innerHeight / 2,
    endScrollX: window.scrollX || 0,
    endScrollY: window.scrollY || 0,
    cursorVisible: true,
    cursorEnlarged: false,
    dot: document.querySelector(".cursor-dot"),
    outline: document.querySelector(".cursor-dot-outline"),
    rootStyles: document.querySelector(":root").style,
    defaultPrimary: document
      .querySelector(":root")
      .style.getPropertyValue("--primary"),
  };

  setupBaseEventListener(cursor, options);
  setupCursorStyle(options);
  animateDotOutline(cursor);

  return cursor;
}

function setupBaseEventListener(cursor, options) {
  // Show custom cursor when client cursor enter the page
  document.addEventListener("mouseenter", () => {
    cursor.cursorVisible = true;
    triggerVisibility(cursor);
  });

  // Hide custom cursor when client cursor quit the page
  document.addEventListener("mouseleave", () => {
    cursor.cursorVisible = false;
    triggerVisibility(cursor);
  });

  // Track the client cursor's position
  document.addEventListener("mousemove", (e) => {
    cursor.cursorVisible = true;

    // Position the dot
    cursor.endX = e.clientX;
    cursor.endY = e.clientY;

    cursor.dot.style.top = `${cursor.endY + cursor.endScrollY}px`;
    cursor.dot.style.left = `${cursor.endX + cursor.endScrollX}px`;

    elementHoverEffect(cursor, options);
  });

  // Track the scroll and add to the calcul
  document.addEventListener("scroll", () => {
    cursor.endScrollY = window.scrollY; // Vertical scroll
    cursor.endScrollX = window.scrollX; // Horizontal scroll

    cursor.dot.style.top = `${cursor.endScrollY + cursor.endY}px`;
    cursor.dot.style.left = `${cursor.endScrollX + cursor.endX}px`;

    elementHoverEffect(cursor, options);
  });

  // Click on DOM events
  document.addEventListener("mousedown", () => {
    cursor.cursorEnlarged = true;
    triggerEnlarged(cursor);
  });

  document.addEventListener("mouseup", () => {
    cursor.cursorEnlarged = false;
    triggerEnlarged(cursor);
    elementHoverEffect(cursor, options);
  });
}

// Function that will make the outline follow the dot
function animateDotOutline(cursor) {
  cursor.outlineX +=
    (cursor.endX + cursor.endScrollX - cursor.outlineX) / cursor.delay;
  cursor.outlineY +=
    (cursor.endY + cursor.endScrollY - cursor.outlineY) / cursor.delay;

  cursor.outline.style.top = `${cursor.outlineY}px`;
  cursor.outline.style.left = `${cursor.outlineX}px`;

  requestAnimationFrame(() => animateDotOutline(cursor));
}

// Function that will enlarge the cursor if cursorEnlarged is true
function triggerEnlarged(cursor) {
  cursor.dot.style.transform = `translate(-50%, -50%) scale(${
    cursor.cursorEnlarged ? "0.75" : "1"
  })`;
  cursor.outline.style.transform = `translate(-50%, -50%) scale(${
    cursor.cursorEnlarged ? "1.5" : "1"
  })`;
}

// Function that will show / hide the cursor
function triggerVisibility(cursor) {
  cursor.dot.style.transform = `translate(-50%, -50%) scale(${
    cursor.cursorVisible ? 1 : 0
  })`;
  cursor.outline.style.transform = `translate(-50%, -50%) scale(${
    cursor.cursorVisible ? 1 : 0
  })`;
}

// Setup all the eventListener
function elementHoverEffect(cursor, options) {
  // Get the element under the cursor
  const hoveredElement = document.elementFromPoint(cursor.endX, cursor.endY);
  let matchElement = false;

  // If there are no element hovered then break the function
  if (!hoveredElement) return;

  // Setup all eventListener that will trigger all users options
  options?.forEach((option) => {
    if (hoveredElement.matches(option.selector)) {
      matchElement = true;

      // Add enlarged effect
      if (option.enlarged) {
        cursor.cursorEnlarged = true;
        triggerEnlarged(cursor);
      }

      // Add the client cursor effect
      if (option.cursor) {
        cursor.cursorVisible = false;
        triggerVisibility(cursor);
      }

      // Add outline color effect
      if (option.color) {
        cursor.rootStyles.setProperty("--primary", option.color);
      }
    }
  });

  // Reset the cursor if there should be no changes to the custom cursor
  if (!matchElement) resetCursor(cursor);
}

// Reset the cursor to its default state
function resetCursor(cursor) {
  cursor.delay = 8;
  cursor.cursorVisible = true;
  cursor.cursorEnlarged = false;
  cursor.rootStyles.setProperty("--primary", cursor.defaultPrimary);
  triggerVisibility(cursor);
  triggerEnlarged(cursor);
}

// Add the element cursor's style
function setupCursorStyle(options) {
  let cursorStyles;
  // For each options
  options.forEach((option) => {
    // Get rid of possible html injection
    const sanitizedSelector = sanitizeText(option.selector);
    const sanitizedCursor = sanitizeText(option.cursor);
    if (!sanitizedSelector || !sanitizedCursor) return;

    // change the cursor for the selected element
    document
      .querySelectorAll(sanitizedSelector)
      .forEach((el) => (el.style.cursor = sanitizedCursor));

    // Create the style for all child element of the selected element
    cursorStyles = cursorStyles
      ? `${cursorStyles}
    ${sanitizedSelector} * { cursor : ${sanitizedCursor}}`
      : `${sanitizedSelector} * { cursor : ${sanitizedCursor}}`;
  });

  // If there are no style to apply then break the function
  if (!cursorStyles) return;

  // Create a style that will add the pointer style and add it to the header
  const style = document.createElement("style");
  const cssRule = document.createTextNode(cursorStyles);
  style.appendChild(cssRule);
  document.head.appendChild(style);
}

// Allow valid CSS selector characters (alphanumeric, hyphens, ...)
function sanitizeText(selector) {
  return selector?.replace(/[^a-zA-Z0-9-_ .#*,=\[\]:()]/g, "");
}
