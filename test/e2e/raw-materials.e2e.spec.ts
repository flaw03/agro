import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Endpoint } from '../../src/endpoint';

describe('RawMaterials (E2E)', () => {
  let app: INestApplication;
  let createdMaterialId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`${Endpoint.RAW_MATERIALS} (GET)`, () => {
    it('should return paginated raw materials', () => {
      return request(app.getHttpServer())
        .get(`/${Endpoint.RAW_MATERIALS}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page', 1);
          expect(res.body).toHaveProperty('limit', 10);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should support sorting', () => {
      return request(app.getHttpServer())
        .get(`/${Endpoint.RAW_MATERIALS}`)
        .query({ sortBy: 'nom', sortOrder: 'DESC' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
        });
    });
  });

  describe(`${Endpoint.RAW_MATERIALS} (POST)`, () => {
    it('should create a new raw material', () => {
      const newMaterial = {
        nom: 'Tomate Test E2E',
        fournisseur: 'Fournisseur Test',
        prix: 2.5,
        stockInitial: 1000,
        stockActuel: 1000,
        unite: 'kg',
        categorie: 'LEGUMES',
      };

      return request(app.getHttpServer())
        .post(`/${Endpoint.RAW_MATERIALS}`)
        .send(newMaterial)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.nom).toBe(newMaterial.nom);
          expect(res.body.prix).toBe(newMaterial.prix);
          createdMaterialId = res.body.id;
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post(`/${Endpoint.RAW_MATERIALS}`)
        .send({ nom: 'Invalid' })
        .expect(400);
    });
  });

  describe(`${Endpoint.RAW_MATERIALS}/:id (GET)`, () => {
    it('should return a raw material by id', async () => {
      if (!createdMaterialId) {
        // Create one if not exists
        const createRes = await request(app.getHttpServer())
          .post(`/${Endpoint.RAW_MATERIALS}`)
          .send({
            nom: 'Test Material',
            fournisseur: 'Test',
            prix: 1,
            stockInitial: 100,
            stockActuel: 100,
            unite: 'kg',
            categorie: 'LEGUMES',
          });
        createdMaterialId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .get(`/${Endpoint.RAW_MATERIALS}/${createdMaterialId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdMaterialId);
          expect(res.body).toHaveProperty('nom');
        });
    });

    it('should return 404 for non-existent material', () => {
      return request(app.getHttpServer()).get(`/${Endpoint.RAW_MATERIALS}/99999`).expect(404);
    });
  });

  describe(`${Endpoint.RAW_MATERIALS}/:id (PUT)`, () => {
    it('should update a raw material', async () => {
      if (!createdMaterialId) {
        const createRes = await request(app.getHttpServer())
          .post(`/${Endpoint.RAW_MATERIALS}`)
          .send({
            nom: 'Test Material',
            fournisseur: 'Test',
            prix: 1,
            stockInitial: 100,
            stockActuel: 100,
            unite: 'kg',
            categorie: 'LEGUMES',
          });
        createdMaterialId = createRes.body.id;
      }

      const updateData = {
        nom: 'Updated Material Name',
        prix: 3.5,
      };

      return request(app.getHttpServer())
        .put(`/${Endpoint.RAW_MATERIALS}/${createdMaterialId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.nom).toBe(updateData.nom);
          expect(res.body.prix).toBe(updateData.prix);
        });
    });
  });

  describe(`${Endpoint.RAW_MATERIALS}/:id (DELETE)`, () => {
    it('should delete a raw material', async () => {
      // Create a material to delete
      const createRes = await request(app.getHttpServer()).post(`/${Endpoint.RAW_MATERIALS}`).send({
        nom: 'To Delete',
        fournisseur: 'Test',
        prix: 1,
        stockInitial: 100,
        stockActuel: 100,
        unite: 'kg',
        categorie: 'LEGUMES',
      });

      const idToDelete = createRes.body.id;

      return request(app.getHttpServer())
        .delete(`/${Endpoint.RAW_MATERIALS}/${idToDelete}`)
        .expect(200);
    });

    it('should return 404 when deleting non-existent material', () => {
      return request(app.getHttpServer()).delete(`/${Endpoint.RAW_MATERIALS}/99999`).expect(404);
    });
  });
});
