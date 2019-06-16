module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Statuses', [
    {
      id: 1,
      name: 'New',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'In process',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: 'Testing',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: 'Finished',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ], {}),
  down: queryInterface => queryInterface.bulkDelete('TaskStatuses', null, {}),
};
