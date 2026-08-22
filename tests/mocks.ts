// Shared jest mocks for Google Cloud services so tests can run locally
// without any GCP credentials or emulators.

jest.mock('../src/config/firestore', () => {
  const store = new Map<string, unknown>();
  return {
    CARTS_COLLECTION: 'carts',
    ORDER_TRACKING_COLLECTION: 'order_tracking',
    firestore: {
      collection: (name: string) => ({
        doc: (id: string) => {
          const key = `${name}/${id}`;
          return {
            get: async () => ({
              exists: store.has(key),
              data: () => store.get(key),
            }),
            set: async (value: unknown) => {
              store.set(key, value);
            },
          };
        },
      }),
    },
  };
});

jest.mock('../src/config/bigquery', () => ({
  bigquery: {
    dataset: () => ({
      table: () => ({
        insert: async () => undefined,
      }),
    }),
  },
  BQ_DATASET: 'ecommerce_analytics_test',
}));

jest.mock('../src/config/gcs', () => ({
  getBucket: () => ({
    name: 'test-bucket',
    file: () => ({
      getSignedUrl: async () => ['https://storage.googleapis.com/test-bucket/mock-signed-url'],
    }),
  }),
}));
