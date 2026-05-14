/// <reference types="cypress" />

/**
 * Prueba de seguridad 3: Resistencia a XSS reflejado en el frontend.
 *
 * Se intercepta la respuesta de /api/arts y se inyecta un payload XSS
 * en el nombre y la categoría del producto. La aplicación debe
 * renderizar el contenido como texto plano, sin ejecutar JavaScript.
 */
describe('Seguridad - Resistencia a XSS en el catalogo', () => {
  const payloadXss = "<img src=x onerror=\"window.__xssEjecutado = true\">Sudadera";
  const payloadCategoria = "<script>window.__xssCategoria=true</script>Ropa";

  beforeEach(() => {
    cy.intercept('GET', '**/api/arts', {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: payloadXss,
          price: 100,
          category: payloadCategoria,
          image: 'https://example.com/img.png',
          stock: 5
        }
      ]
    }).as('getArts');
  });

  it('no ejecuta scripts inyectados via nombre ni categoria', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.__xssEjecutado = false;
        win.__xssCategoria = false;
      }
    });
    cy.wait('@getArts');

    cy.get('[data-testid="product-card"]').should('exist');

    cy.contains('Sudadera').should('be.visible');

    cy.window().then((win) => {
      expect(win.__xssEjecutado, 'XSS via onerror no debe ejecutarse').to.equal(false);
      expect(win.__xssCategoria, 'XSS via <script> no debe ejecutarse').to.equal(false);
    });

    cy.get('[data-testid="product-card"]').within(() => {
      cy.get('script').should('not.exist');
      cy.get('img[onerror]').should('not.exist');
    });
  });

  it('renderiza el payload como texto literal', () => {
    cy.visit('/');
    cy.wait('@getArts');
    cy.contains('onerror').should('be.visible');
  });
});
