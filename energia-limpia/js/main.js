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

    if (mainTitle && branding.mainTitle)
      mainTitle.textContent = branding.mainTitle;
    if (subTitle && branding.subTitle) subTitle.textContent = branding.subTitle;
    if (logo && branding.logoPath) logo.setAttribute("src", branding.logoPath);
    if (logo && branding.logoAlt) logo.setAttribute("alt", branding.logoAlt);
    if (footerText && branding.footerText)
      footerText.textContent = branding.footerText;
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

    if (contact.admin?.whatsapp && adminBtn) {
      adminBtn.setAttribute("href", contact.admin.whatsapp);
    } else if (contact.admin?.email && adminBtn) {
      adminBtn.setAttribute("href", `mailto:${contact.admin.email}`);
    }
    if (contact.admin?.label && adminText) {
      adminText.textContent = contact.admin.label;
    }

    if (contact.store?.whatsapp && storeBtn) {
      storeBtn.setAttribute("href", contact.store.whatsapp);
    } else if (contact.store?.email && storeBtn) {
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
        nombre: "Panel Solar Bifacial 595W",
        modelo: "TSM-NEG18C.20",
        categoria: "paneles",
        potencia: "575-600W",
        ficha_url: "assets/downloads/fichas/TSM-NEG18C.20_575-600W.pdf",
      },
      {
        id: 2,
        nombre: "Panel Solar Bifacial 505W",
        modelo: "TSM-NEG18RC.27",
        categoria: "paneles",
        potencia: "495-520W",
        ficha_url: "assets/downloads/fichas/TSM-NEG18RC.27_495-520W.pdf",
      },
      {
        id: 3,
        nombre: "Cable Solar",
        modelo: "h1z2z2-k",
        categoria: "cables",
        tipo: "Cable",
        ficha_url:
          "assets/downloads/fichas/topcable-datasheet-topsolar-pv-h1z2z2-k-es.pdf",
      },
      {
        id: 4,
        nombre: "Cable Eléctrico",
        modelo: "h07z1-k",
        categoria: "cables",
        tipo: "Cable",
        ficha_url:
          "assets/downloads/fichas/topcable-datasheet-toxfree-lszh-es05z1-k-h07z1-k-es.pdf",
      },
      {
        id: 5,
        nombre: "Catálogo de Estructuras",
        modelo: "Catálogo",
        categoria: "estructuras",
        tipo: "Catálogo",
        ficha_url: "assets/downloads/fichas/Catálogo_Estructuras_Toditico.pdf",
      },
      {
        id: 6,
        nombre:
          "SISTEMA PARA CUBIERTA PLANA CON MÓDULO EN VERTICAL SOBRE TRIÁNGULO 1625 ABIERTO°",
        modelo: "CPV-1625A",
        categoria: "estructuras",
        tipo: "Montaje",
        ficha_url: "assets/downloads/fichas/Ficha_tecnica_CPV-1625A.pdf",
      },
      {
        id: 7,
        nombre: "SISTEMA COPLANAR PARA CUBIERTA GRECADA CON MICROPERFIL C36",
        modelo: "CI-G7",
        categoria: "estructuras",
        tipo: "Montaje",
        ficha_url: "assets/downloads/fichas/Ficha_tecnica_CI-G7.pdf",
      },
      {
        id: 8,
        nombre: "SISTEMA COPLANAR PARA TEJA ÁRABE (RACILLA) CON ANCLAJE TEJA",
        modelo: "C1-A1",
        categoria: "estructuras",
        tipo: "Montaje",
        ficha_url: "assets/downloads/fichas/Ficha_tecnica_CI-A1.pdf",
      },
      {
        id: 9,
        nombre: "SISTEMA COPLANAR PARA CUBIERTA GRECADA CON MICROPERFIL C43",
        modelo: "CI-G4",
        categoria: "estructuras",
        tipo: "Montaje",
        ficha_url: "assets/downloads/fichas/Ficha_tecnica_CI-G4.pdf",
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
            product.potencia.toLowerCase().includes(this.searchTerm)) ||
          (product.tipo && product.tipo.toLowerCase().includes(this.searchTerm))
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
      case "paneles":
        if (product.dimensiones)
          specs.push(`Dimensiones: ${product.dimensiones}`);
        if (product.certificaciones)
          specs.push(`Certificaciones: ${product.certificaciones}`);
        break;
      case "estaciones":
        if (product.capacidad) specs.push(`Capacidad: ${product.capacidad}`);
        if (product.voltaje) specs.push(`Voltaje: ${product.voltaje}`);
        break;
      case "estructuras":
        if (product.tipo) specs.push(`Tipo: ${product.tipo}`);
        if (product.material) specs.push(`Material: ${product.material}`);
        break;
      case "cables":
        if (product.tipo) specs.push(`Tipo: ${product.tipo}`);
        if (product.material) specs.push(`Material: ${product.material}`);
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
      estaciones: '<i class="fas fa-charging-station"></i>',
      paneles: '<i class="fas fa-solar-panel"></i>',
      estructuras: '<i class="fas fa-sitemap"></i>',
      cables: '<i class="fas fa-plug"></i>',
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
      estaciones: "Estaciones All in One",
      paneles: "Paneles solares",
      estructuras: "Estructuras",
      cables: "Cables",
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
  // PDF preview using PDF.js
  const manager = window.productsManager;
  if (!manager) return alert("Gestor de productos no inicializado");
  const prod = manager.products.find((p) => p.id === productId);
  if (!prod) return alert("Producto no encontrado");
  const url = prod.ficha_url;
  openPdfModal(url, prod.nombre || prod.modelo || "Vista previa");
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
  // Guardar instancia global para poder acceder desde funciones globales
  window.productsManager = new ProductsManager();

  console.log(
    "✅ Toditico Energía Limpia - Aplicación inicializada correctamente"
  );
});

// ===== PDF.js Modal Logic =====
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
}

let _pdfDoc = null;
let _pageNum = 1;
let _scale = 1.0;
let _canvas = null;
let _ctx = null;

function openPdfModal(url, title) {
  const modal = document.getElementById("pdfModal");
  const backdrop = document.getElementById("pdfBackdrop");
  const titleEl = document.getElementById("pdfTitle");
  const pageInfo = document.getElementById("pdfPageInfo");
  const downloadLink = document.getElementById("pdfDownloadLink");

  if (!modal) return window.open(url, "_blank");

  modal.setAttribute("aria-hidden", "false");
  titleEl.textContent = title || "Vista previa";
  downloadLink.href = url;
  downloadLink.setAttribute("download", "");

  // Canvas setup
  _canvas = document.getElementById("pdfCanvas");
  if (!_canvas) return window.open(url, "_blank");
  _ctx = _canvas.getContext("2d");

  // Attach control handlers
  document.getElementById("pdfClose").onclick = closePdfModal;
  document.getElementById("pdfPrev").onclick = onPrevPage;
  document.getElementById("pdfNext").onclick = onNextPage;
  document.getElementById("pdfZoomIn").onclick = () => changeZoom(0.25);
  document.getElementById("pdfZoomOut").onclick = () => changeZoom(-0.25);
  backdrop.onclick = closePdfModal;

  // Load PDF with pdfjs if available, otherwise open in new tab
  if (window.pdfjsLib && pdfjsLib.getDocument) {
    // Ensure workerSrc is set (in case pdf.js was loaded after this script)
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      pdfjsLib.GlobalWorkerOptions.workerSrc ||
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
    pdfjsLib
      .getDocument(url)
      .promise.then(function (pdfDoc_) {
        _pdfDoc = pdfDoc_;
        _pageNum = 1;
        _scale = 1.0;
        renderPage(_pageNum);
        pageInfo.textContent = `${_pageNum} / ${_pdfDoc.numPages}`;
      })
      .catch(function (err) {
        console.error("Error cargando PDF:", err);
        // fallback: open in new tab
        window.open(url, "_blank");
        closePdfModal();
      });
  } else {
    window.open(url, "_blank");
    closePdfModal();
  }
}

function closePdfModal() {
  const modal = document.getElementById("pdfModal");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  if (_pdfDoc) {
    _pdfDoc = null;
  }
  if (_canvas && _ctx) {
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
  }
}

function renderPage(num) {
  _pdfDoc.getPage(num).then(function (page) {
    const viewport = page.getViewport({ scale: _scale });
    const outputScale = window.devicePixelRatio || 1;
    _canvas.width = Math.floor(viewport.width * outputScale);
    _canvas.height = Math.floor(viewport.height * outputScale);
    _canvas.style.width = Math.floor(viewport.width) + "px";
    _canvas.style.height = Math.floor(viewport.height) + "px";

    const transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
    const renderContext = {
      canvasContext: _ctx,
      transform: transform,
      viewport: viewport,
    };
    page.render(renderContext).promise.then(function () {
      const pageInfo = document.getElementById("pdfPageInfo");
      pageInfo.textContent = `${_pageNum} / ${_pdfDoc.numPages}`;
    });
  });
}

function queueRenderPage(num) {
  if (!_pdfDoc) return;
  if (num < 1) num = 1;
  if (num > _pdfDoc.numPages) num = _pdfDoc.numPages;
  _pageNum = num;
  renderPage(_pageNum);
}

function onPrevPage() {
  if (!_pdfDoc) return;
  if (_pageNum <= 1) return;
  _pageNum--;
  queueRenderPage(_pageNum);
}

function onNextPage() {
  if (!_pdfDoc) return;
  if (_pageNum >= _pdfDoc.numPages) return;
  _pageNum++;
  queueRenderPage(_pageNum);
}

function changeZoom(delta) {
  if (!_pdfDoc) return;
  _scale = Math.max(0.5, Math.min(3.0, _scale + delta));
  queueRenderPage(_pageNum);
}

// ==========================================
// DETECTAR CONEXIÓN A INTERNET
// ==========================================
window.addEventListener("online", () => {
  console.log("✅ Conexión a internet restaurada");
});

window.addEventListener("offline", () => {
  console.warn("⚠️ Sin conexión a internet");
});
