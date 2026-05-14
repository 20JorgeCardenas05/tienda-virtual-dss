/// <reference types="cypress" />

/**
 * Prueba de seguridad 2: Validación de entrada en POST /api/compra.
 *
 * Comprueba que el backend rechaza payloads malformados o maliciosos
 * con un código 4xx en lugar de procesarlos o devolver 5xx.
 */
describe('Seguridad - Validación de entrada en POST /api/compra', () => {
  const url = 'http://localhost:4000/api/compra';

  const payloadsInvalidos = [
    { caso: 'cuerpo vacio', body: {} },
    { caso: 'sin customerName', body: { items: [{ productId: 1, quantity: 1 }] } },
    { caso: 'items no es arreglo', body: { customerName: 'Demo', items: 'no-arreglo' } },
    { caso: 'items vacio', body: { customerName: 'Demo', items: [] } },
    { caso: 'customerName nulo', body: { customerName: null, items: [{ productId: 1, quantity: 1 }] } }
  ];

  payloadsInvalidos.forEach(({ caso, body }) => {
    it(`rechaza payload invalido: ${caso}`, () => {
      cy.request({
        method: 'POST',
        url,
        body,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status, 'codigo HTTP').to.be.within(400, 499);
        expect(response.body).to.have.property('message');
      });
    });
  });

  it('procesa correctamente un payload valido como control positivo', () => {
    cy.request({
      method: 'POST',
      url,
      body: { customerName: 'Cliente Demo', items: [{ productId: 1, quantity: 2 }] }
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('id');
      expect(response.body.total).to.equal(1298);
      expect(response.body.status).to.equal('created');
    });
  });

  it('no rompe el servidor ante payload con prototipo contaminado', () => {
    cy.request({
      method: 'POST',
      url,
      body: {
        customerName: 'Atacante',
        items: [{ productId: 1, quantity: 1 }],
        __proto__: { isAdmin: true }
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'no debe ser 5xx').to.be.lessThan(500);
      expect(response.body).to.not.have.property('isAdmin');
    });
  });
});
