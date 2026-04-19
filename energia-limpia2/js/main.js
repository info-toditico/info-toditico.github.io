/**
 * ==========================================
 * TODITICO ENERGÍA LIMPIA - Main JavaScript
 * ==========================================
 * Funcionalidades:
 * - Cambio de tema (claro/oscuro)
 * - Carga dinámica de productos
 * - Filtrado por categoría
 * - Búsqueda en tiempo real
 * - Animaciones y transiciones
 * ==========================================
 */

// ==========================================
// CONSTANTES Y CONFIGURACIÓN
// ==========================================
const CONFIG = {
  THEME_KEY: "toditico-theme",
  PRODUCTS_URL: "data/productos.json",
  SITE_SETTINGS_URL: "data/site-settings.json",
};

// ==========================================
// GESTIÓN DE CONFIGURACIÓN DEL SITIO
// ==========================================
class SiteSettingsManager {
  async init() {
    try {
      const response = await fetch(CONFIG.SITE_SETTINGS_URL);
      if (!response.ok) {
        throw new Error("No se pudo cargar la configuracion del sitio");
      }

      const settings = await response.json();
      this.applyBranding(settings.branding || {});
      this.applyDownloads(settings.downloads || []);
      this.applySocial(settings.social || {});
      this.applyContact(settings.contact || {});
    } catch (error) {
      console.warn("⚠️ Configuracion del sitio no aplicada:", error.message);
    }
  }

  applyBranding(branding) {
    const mainTitle = document.getElementById("siteMainTitle");
    const subTitle = document.getElementById("siteSubTitle");
    const logo = document.getElementById("siteLogo");
    const footerText = document.getElementById("siteFooterText");

    if (mainTitle && branding.mainTitle) mainTitle.textContent = branding.mainTitle;
    if (subTitle && branding.subTitle) subTitle.textContent = branding.subTitle;
    if (logo && branding.logoPath) logo.setAttribute("src", branding.logoPath);
    if (logo && branding.logoAlt) logo.setAttribute("alt", branding.logoAlt);
    if (footerText && branding.footerText) footerText.textContent = branding.footerText;
  }

  applyDownloads(downloads) {
    downloads.forEach((item) => {
      const btn = document.getElementById(item.id);
      const text = document.getElementById(item.textId);
      if (!btn) return;

      if (item.href) btn.setAttribute("href", item.href);
      if (typeof item.download === "boolean") {
        if (item.download) {
          btn.setAttribute("download", "");
        } else {
          btn.removeAttribute("download");
        }
      }
      if (text && item.label) text.textContent = item.label;
    });
  }

  applySocial(social) {
    const socialMap = {
      instagram: "socialInstagram",
      facebook: "socialFacebook",
      youtube: "socialYoutube",
      linkedin: "socialLinkedin",
      whatsapp: "socialWhatsapp",
    };

    Object.entries(socialMap).forEach(([key, elementId]) => {
      const el = document.getElementById(elementId);
      if (el && social[key]) {
        el.setAttribute("href", social[key]);
      }
    });
  }

  applyContact(contact) {
    const adminBtn = document.getElementById("contactAdminBtn");
    const adminText = document.getElementById("contactAdminText");
    const storeBtn = document.getElementById("contactStoreBtn");
    const storeText = document.getElementById("contactStoreText");

    if (contact.admin?.email && adminBtn) {
      adminBtn.setAttribute("href", `mailto:${contact.admin.email}`);
    }
    if (contact.admin?.label && adminText) {
      adminText.textContent = contact.admin.label;
    }

    if (contact.store?.email && storeBtn) {
      storeBtn.setAttribute("href", `mailto:${contact.store.email}`);
    }
    if (contact.store?.label && storeText) {
      storeText.textContent = contact.store.label;
    }
  }
}

// ==========================================
// GESTIÓN DE TEMA (DARK/LIGHT MODE)
// ==========================================
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.currentTheme = this.getSavedTheme();
    this.init();
  }

  /**
   * Obtiene el tema guardado en localStorage
   * Si no existe, usa el tema del sistema operativo
   */
  getSavedTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    if (savedTheme) {
      return savedTheme;
    }
    // Detectar preferencia del sistema
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  /**
   * Inicializa el gestor de temas
   */
  init() {
    // Aplicar tema inicial
    this.applyTheme(this.currentTheme);

    // Event listener para el botón de cambio de tema
    if (this.themeToggle) {
      this.themeToggle.addEventListener("click", () => this.toggleTheme());
    }

    // Detectar cambios en la preferencia del sistema
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem(CONFIG.THEME_KEY)) {
          this.applyTheme(e.matches ? "dark" : "light");
        }
      });
  }

  /**
   * Cambia entre tema claro y oscuro
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(this.currentTheme);
    localStorage.setItem(CONFIG.THEME_KEY, this.currentTheme);
  }

  /**
   * Aplica el tema seleccionado
   * @param {string} theme - 'light' o 'dark'
   */
  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    if (this.themeToggle) {
      const icon = this.themeToggle.querySelector("i");
      if (icon) {
        if (theme === "dark") {
          icon.className = "fas fa-sun";
        } else {
          icon.className = "fas fa-moon";
        }
      }
    }

    // Añadir clase al body para animación suave
    document.body.style.transition =
      "background-color 0.3s ease, color 0.3s ease";
  }
}

// ==========================================
// GESTIÓN DE PRODUCTOS (PÁGINA MANUALES)
// ==========================================
class ProductsManager {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentCategory = "todos";

    // Elementos DOM
    this.productsGrid = document.getElementById("productsGrid");
    this.searchInput = document.getElementById("searchInput");
    this.clearSearchBtn = document.getElementById("clearSearch");
    this.filterButtons = document.querySelectorAll(".filter-btn");
    this.noResults = document.getElementById("noResults");

    if (this.productsGrid) {
      this.init();
    }
  }

  /**
   * Inicializa el gestor de productos
   */
  async init() {
    await this.loadProducts();
    this.setupEventListeners();
    this.renderProducts();
  }

  /**
   * Carga los productos desde el archivo JSON
   */
  async loadProducts() {
    try {
      const response = await fetch(CONFIG.PRODUCTS_URL);
      if (!response.ok) {
        throw new Error("Error al cargar productos");
      }
      const data = await response.json();
      this.products = data.productos;
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error("Error cargando productos:", error);
      // Mostrar productos de ejemplo si falla la carga
      this.loadFallbackProducts();
    }
  }

  /**
   * Carga productos de ejemplo si falla la carga del JSON
   */
  loadFallbackProducts() {
    this.products = [
      {
        id: 1,
        nombre: "Panel Solar Monocristalino",
        modelo: "TSP-450M-HC",
        categoria: "solar",
        potencia: "450W",
        eficiencia: "21.5%",
        garantia: "25 años",
        ficha_url: "#",
      },
      {
        id: 2,
        nombre: "Aerogenerador Residencial",
        modelo: "TWG-5000-V",
        categoria: "eolico",
        potencia: "5kW",
        velocidad_arranque: "3 m/s",
        garantia: "5 años",
        ficha_url: "#",
      },
      {
        id: 3,
        nombre: "Inversor Híbrido",
        modelo: "TIH-8000-MPPT",
        categoria: "inversores",
        potencia: "8kW",
        eficiencia: "97.6%",
        garantia: "5 años",
        ficha_url: "#",
      },
    ];
    this.filteredProducts = [...this.products];
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Filtros de categoría
    this.filterButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleCategoryFilter(e.target.closest(".filter-btn"));
      });
    });

    // Búsqueda
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.handleSearch(e.target.value);
        this.toggleClearButton(e.target.value);
      });
    }

    // Botón limpiar búsqueda
    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener("click", () => {
        this.clearSearch();
      });
    }
  }

  /**
   * Maneja el filtrado por categoría
   * @param {HTMLElement} button - Botón de filtro clickeado
   */
  handleCategoryFilter(button) {
    // Actualizar botones activos
    this.filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // Obtener categoría
    this.currentCategory = button.dataset.category;

    // Aplicar filtros
    this.applyFilters();
  }

  /**
   * Maneja la búsqueda de productos
   * @param {string} searchTerm - Término de búsqueda
   */
  handleSearch(searchTerm) {
    this.searchTerm = searchTerm.toLowerCase().trim();
    this.applyFilters();
  }

  /**
   * Aplica todos los filtros activos
   */
  applyFilters() {
    let results = [...this.products];

    // Filtrar por categoría
    if (this.currentCategory !== "todos") {
      results = results.filter(
        (product) => product.categoria === this.currentCategory
      );
    }

    // Filtrar por búsqueda
    if (this.searchTerm) {
      results = results.filter((product) => {
        return (
          product.nombre.toLowerCase().includes(this.searchTerm) ||
          product.modelo.toLowerCase().includes(this.searchTerm) ||
          product.categoria.toLowerCase().includes(this.searchTerm) ||
          (product.potencia &&
            product.potencia.toLowerCase().includes(this.searchTerm))
        );
      });
    }

    this.filteredProducts = results;
    this.renderProducts();
  }

  /**
   * Renderiza los productos en el DOM
   */
  renderProducts() {
    if (!this.productsGrid) return;

    // Limpiar grid
    this.productsGrid.innerHTML = "";

    // Mostrar mensaje si no hay resultados
    if (this.filteredProducts.length === 0) {
      this.noResults.style.display = "block";
      return;
    }

    this.noResults.style.display = "none";

    // Renderizar cada producto
    this.filteredProducts.forEach((product, index) => {
      const card = this.createProductCard(product, index);
      this.productsGrid.appendChild(card);
    });
  }

  /**
   * Crea una tarjeta de producto
   * @param {Object} product - Datos del producto
   * @param {number} index - Índice para animación escalonada
   * @returns {HTMLElement} - Elemento de tarjeta
   */
  createProductCard(product, index) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${index * 0.1}s`;

    // Obtener especificaciones según categoría
    const specs = this.getProductSpecs(product);

    card.innerHTML = `
            <div class="product-category category-${product.categoria}">
                ${this.getCategoryIcon(
                  product.categoria
                )} ${this.getCategoryName(product.categoria)}
            </div>
            <h3 class="product-title">${product.nombre}</h3>
            <p class="product-model">Modelo: ${product.modelo}</p>
            <ul class="product-specs">
                ${specs
                  .map(
                    (spec) =>
                      `<li><i class="fas fa-check-circle"></i> ${spec}</li>`
                  )
                  .join("")}
            </ul>
            <div class="product-actions">
                <a href="${product.ficha_url}" 
                   download 
                   class="product-btn btn-download">
                    <i class="fas fa-download"></i> Descargar Ficha
                </a>
                <button class="product-btn btn-view" onclick="viewProductDetails(${
                  product.id
                })">
                    <i class="fas fa-eye"></i> Ver Detalles
                </button>
            </div>
        `;

    return card;
  }

  /**
   * Obtiene las especificaciones del producto según su categoría
   * @param {Object} product - Datos del producto
   * @returns {Array} - Array de especificaciones formateadas
   */
  getProductSpecs(product) {
    const specs = [];

    // Especificaciones comunes
    if (product.potencia) specs.push(`Potencia: ${product.potencia}`);
    if (product.eficiencia) specs.push(`Eficiencia: ${product.eficiencia}`);
    if (product.garantia) specs.push(`Garantía: ${product.garantia}`);

    // Especificaciones específicas por categoría
    switch (product.categoria) {
      case "solar":
        if (product.dimensiones)
          specs.push(`Dimensiones: ${product.dimensiones}`);
        if (product.certificaciones)
          specs.push(`Certificaciones: ${product.certificaciones}`);
        break;
      case "eolico":
        if (product.velocidad_arranque)
          specs.push(`V. Arranque: ${product.velocidad_arranque}`);
        if (product.velocidad_nominal)
          specs.push(`V. Nominal: ${product.velocidad_nominal}`);
        if (product.diametro_rotor)
          specs.push(`Diámetro: ${product.diametro_rotor}`);
        break;
      case "inversores":
        if (product.voltaje_entrada)
          specs.push(`Entrada: ${product.voltaje_entrada}`);
        if (product.voltaje_salida)
          specs.push(`Salida: ${product.voltaje_salida}`);
        if (product.tipo) specs.push(`Tipo: ${product.tipo}`);
        break;
    }

    return specs;
  }

  /**
   * Obtiene el ícono según la categoría
   * @param {string} category - Categoría del producto
   * @returns {string} - HTML del ícono
   */
  getCategoryIcon(category) {
    const icons = {
      solar: '<i class="fas fa-solar-panel"></i>',
      eolico: '<i class="fas fa-wind"></i>',
      inversores: '<i class="fas fa-bolt"></i>',
    };
    return icons[category] || '<i class="fas fa-cube"></i>';
  }

  /**
   * Obtiene el nombre formateado de la categoría
   * @param {string} category - Categoría del producto
   * @returns {string} - Nombre formateado
   */
  getCategoryName(category) {
    const names = {
      solar: "Solar",
      eolico: "Eólico",
      inversores: "Inversores",
    };
    return names[category] || category;
  }

  /**
   * Muestra/oculta el botón de limpiar búsqueda
   * @param {string} value - Valor actual del input
   */
  toggleClearButton(value) {
    if (!this.clearSearchBtn) return;

    if (value.trim()) {
      this.clearSearchBtn.classList.add("visible");
    } else {
      this.clearSearchBtn.classList.remove("visible");
    }
  }

  /**
   * Limpia la búsqueda
   */
  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = "";
      this.searchTerm = "";
      this.toggleClearButton("");
      this.applyFilters();
      this.searchInput.focus();
    }
  }
}

// ==========================================
// FUNCIÓN GLOBAL PARA VER DETALLES
// ==========================================
/**
 * Muestra los detalles de un producto (puede expandirse para modal)
 * @param {number} productId - ID del producto
 */
window.viewProductDetails = function (productId) {
  // EJEMPLO: Aquí puedes implementar un modal con más detalles
  // Por ahora, mostramos una alerta simple
  alert(
    `Ver detalles del producto ID: ${productId}\n\nEsta función puede expandirse para mostrar un modal con información detallada.`
  );

  // IMPLEMENTACIÓN SUGERIDA:
  // 1. Crear un modal HTML
  // 2. Buscar el producto por ID
  // 3. Llenar el modal con toda la información
  // 4. Mostrar el modal con animación
};

// ==========================================
// ANIMACIONES SMOOTH SCROLL
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Aplicar configuracion editable del sitio en index
  new SiteSettingsManager().init();

  // Inicializar gestor de temas (funciona en todas las páginas)
  new ThemeManager();

  // Inicializar gestor de productos (solo en página de manuales)
  new ProductsManager();

  console.log(
    "✅ Toditico Energía Limpia - Aplicación inicializada correctamente"
  );
});

// ==========================================
// DETECTAR CONEXIÓN A INTERNET
// ==========================================
window.addEventListener("online", () => {
  console.log("✅ Conexión a internet restaurada");
});

window.addEventListener("offline", () => {
  console.warn("⚠️ Sin conexión a internet");
});
