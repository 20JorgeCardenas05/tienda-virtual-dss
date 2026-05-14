/// <reference types="cypress" />

/**
 * Prueba de seguridad 1: Cabeceras HTTP de seguridad (helmet).
 *
 * Verifica que el backend protegido por helmet expone las cabeceras
 * defensivas mínimas en endpoints que sirven datos al cliente.
 *
 * Endpoints bajo prueba:
 *   - GET http://localhost:4000/api/arts
 *   - GET http://localhost:4000/api/salud
 */
describe('Seguridad - Cabeceras HTTP (helmet)', () => {
  const apiBase = 'http://localhost:4000/api';

  const cabecerasRequeridas = [
    'x-content-type-options',
    'x-frame-options',
    'strict-transport-security',
    'x-dns-prefetch-control',
    'content-security-policy'
  ];

  it('GET /api/arts responde con cabeceras de seguridad activas', () => {
    cy.request(`${apiBase}/arts`).then((response) => {
      expect(response.status).to.equal(200);

      cabecerasRequeridas.forEach((header) => {
        expect(response.headers, `cabecera ${header}`).to.have.property(header);
      });

      expect(response.headers['x-content-type-options']).to.equal('nosniff');
      expect(response.headers['x-frame-options']).to.match(/SAMEORIGIN|DENY/i);
    });
  });

  it('GET /api/salud oculta la cabecera x-powered-by', () => {
    cy.request(`${apiBase}/salud`).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.headers).to.not.have.property('x-powered-by');
    });
  });
});
