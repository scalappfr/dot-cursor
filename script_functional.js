// Function that get called first
function cursor(options = []) {
  const cursor = {
    delay: 8,
    _x: 0,
    _y: 0,
    endX: window.innerWidth / 2,
    endY: window.innerHeight / 2,
    endScrollX: window.scrollX || 0,
    endScrollY: window.scrollY || 0,
    cursorVisible: true,
    cursorEnlarged: false,
    showClientCursor: false,
    dot: document.querySelector(".cursor-dot"),
    outline: document.querySelector(".cursor-dot-outline"),
    rootStyles: document.querySelector(":root").style,
    defaultPrimary: document
      .querySelector(":root")
      .style.getPropertyValue("--primary"),
  };

  setupEventListeners(cursor, options);
  animateDotOutline(cursor);
  return cursor;
}

// Function that will make the outline follow the dot
function animateDotOutline(cursor) {
  cursor._x += (cursor.endX + cursor.endScrollX - cursor._x) / cursor.delay;
  cursor._y += (cursor.endY + cursor.endScrollY - cursor._y) / cursor.delay;

  cursor.outline.style.top = `${cursor._y}px`;
  cursor.outline.style.left = `${cursor._x}px`;

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

// Function that will show / hide the cursor with opacity (used only for mouse move)
function triggerOpacity(cursor) {
  cursor.dot.style.opacity = cursor.cursorVisible ? 1 : 0;
  cursor.outline.style.opacity = cursor.cursorVisible ? 1 : 0;
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

function setupEventListeners(cursor, options) {
  // Click on DOM events
  document.addEventListener("mousedown", () => {
    cursor.cursorEnlarged = true;
    triggerEnlarged(cursor);
  });

  document.addEventListener("mouseup", () => {
    cursor.cursorEnlarged = false;
    triggerEnlarged(cursor);
  });

  // Show custom cursor and track the client cursor position
  document.addEventListener("mousemove", (e) => {
    // Show the cursor
    cursor.cursorVisible = true;
    triggerOpacity(cursor);

    // Position the dot
    cursor.endX = e.clientX;
    cursor.endY = e.clientY;

    cursor.dot.style.top = `${cursor.endY + cursor.endScrollY}px`;
    cursor.dot.style.left = `${cursor.endX + cursor.endScrollX}px`;
  });

  // Track the scroll and add to the calcul
  document.addEventListener("scroll", () => {
    cursor.endScrollY = window.scrollY; // Vertical scroll
    cursor.endScrollX = window.scrollX; // Horizontal scroll

    cursor.dot.style.top = `${cursor.endScrollY + cursor.endY}px`;
    cursor.dot.style.left = `${cursor.endScrollX + cursor.endX}px`;
  });

  // Show custom cursor when client cursor enter the page
  document.addEventListener("mouseenter", () => {
    cursor.cursorVisible = true;
    triggerVisibility(cursor);
    triggerOpacity(cursor);
  });

  // Hide custom cursor when client cursor quit the page
  document.addEventListener("mouseleave", () => {
    cursor.cursorVisible = false;
    triggerVisibility(cursor);
    triggerOpacity(cursor);
  });

  // Setup all custom event listener
  options.forEach((option) => {
    if (!option.selector) return;
    // Create variables that will be used for element interactions
    let effect_enlarged = option.enlarged || true;
    let effect_cursor = option.cursor;
    let effect_color = option.color;

    document.querySelectorAll(option.selector).forEach((el) => {
      // Ajout du condition pour l'éffet élarigir
      if (effect_enlarged) {
        el.addEventListener("mouseover", () => {
          cursor.cursorEnlarged = true;
          triggerEnlarged(cursor);
          el.style.cursor = "none";
        });
        el.addEventListener("mouseout", () => {
          cursor.cursorEnlarged = false;
          triggerEnlarged(cursor);
        });
      }

      // Cacher le custom cursor et afficher le client cursor
      if (effect_cursor) {
        el.addEventListener("mouseover", () => {
          cursor.cursorVisible = false;
          triggerVisibility(cursor);
          el.style.cursor = effect_cursor || "auto";
        });
        el.addEventListener("mouseout", () => {
          cursor.cursorVisible = true;
          triggerVisibility(cursor);
          el.style.cursor = "none";
        });

        // Show on click, then hide after
        el.addEventListener("mouseup", (e) => {
          e.stopPropagation();
          cursor.cursorVisible = false;
          triggerVisibility(cursor);
          el.style.cursor = custom.cursor || "auto";
        });
      }

      // Ajout de l'éffet qui change la couleur du custom cursor
      if (effect_color) {
        el.addEventListener("mouseover", () => {
          cursor.rootStyles.setProperty("--primary", effect_color);
        });
        el.addEventListener("mouseout", () => {
          cursor.rootStyles.setProperty("--primary", cursor.defaultPrimary);
        });
      }
    });
  });
}
