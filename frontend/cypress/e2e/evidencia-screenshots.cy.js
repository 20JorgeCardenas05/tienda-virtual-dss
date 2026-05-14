/// <reference types="cypress" />

/**
 * Spec auxiliar: genera capturas de pantalla como evidencia
 * de las tres pruebas de seguridad para incluir en el reporte.
 */
function renderTexto(doc, titulo, contenido) {
  while (doc.body.firstChild) doc.body.removeChild(doc.body.firstChild);
  const pre = doc.createElement('pre');
  pre.style.font = '14px monospace';
  pre.style.padding = '24px';
  pre.style.whiteSpace = 'pre-wrap';
  pre.textContent = titulo + '\n\n' + contenido;
  doc.body.appendChild(pre);
}

describe('Evidencias visuales de las pruebas de seguridad', () => {
  it('captura las cabeceras de /api/arts', () => {
    cy.request('http://localhost:4000/api/arts').then((response) => {
      const filas = Object.entries(response.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      cy.visit('about:blank');
      cy.document().then((doc) => {
        renderTexto(doc, 'Cabeceras GET /api/arts (helmet)', filas);
      });
      cy.screenshot('evidencia-01-cabeceras', { capture: 'fullPage' });
    });
  });

  it('captura una respuesta 400 de POST /api/compra invalido', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:4000/api/compra',
      body: {},
      failOnStatusCode: false
    }).then((response) => {
      cy.visit('about:blank');
      cy.document().then((doc) => {
        renderTexto(
          doc,
          'POST /api/compra con cuerpo vacio',
          'Status: ' + response.status + '\nBody: ' + JSON.stringify(response.body, null, 2)
        );
      });
      cy.screenshot('evidencia-02-validacion-entrada', { capture: 'fullPage' });
    });
  });

  it('captura el catalogo con payload XSS renderizado como texto', () => {
    const payload = "<img src=x onerror=\"window.__xssEjecutado = true\">Sudadera";
    cy.intercept('GET', '**/api/arts', {
      statusCode: 200,
      body: [
        { id: 1, name: payload, price: 100, category: 'Ropa', image: 'https://example.com/img.png', stock: 5 }
      ]
    });
    cy.visit('/', {
      onBeforeLoad(win) { win.__xssEjecutado = false; }
    });
    cy.contains('onerror').should('be.visible');
    cy.screenshot('evidencia-03-xss-escapado', { capture: 'fullPage' });
  });
});
