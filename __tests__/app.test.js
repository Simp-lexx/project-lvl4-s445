/* import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '..';

describe('requests', () => {
  let server;

  beforeAll(() => {
    expect.extend(matchers);
  });

  beforeEach(() => {
    server = app().listen(process.env.PORT);
  });

  it('GET 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
 */
import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import app from '..';

const testUser = id => ({
  id,
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  password: faker.internet.password(),
  userAgent: faker.internet.userAgent(),
});

const testTask = id => ({
  id,
  name: faker.random.word(),
  description: faker.random.words(11),
});

/* const createUser = (func, user) => {

} */

let server;
let userId = 0;
let taskId = 0;
let superagent;
let user;
let task;

beforeAll(() => {
  expect.extend(matchers);
  server = app().listen(process.env.PORT);
});

describe('Standart requests testing', () => {
  it('Test GET 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('Test GET 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  afterAll((done) => {
    server.close();
    userId = 0;
    done();
  });
});

describe('Tests User Create, Log On & Log Off', () => {
  beforeAll(() => {
    superagent = request.agent(server);
    console.log(superagent);
    userId += 1;
    user = testUser(userId);
    console.log(user);
  });

  it('Test User Create', async () => {
    await superagent
      .post('/users/new')
      .type('form')
      .send({
        form: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
        },
      })
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .expect(302);
  });
  it('Test User Log On & Log Off', async () => {
    await superagent
      .post('/sessions')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .expect(302);
    await superagent
      .delete('/sessions')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .expect(302);
  });
});

describe('Tests Users CRUD', () => {
  beforeAll(async () => {
    userId += 1;
    user = testUser(userId);
    await superagent
      .post('/users/new')
      .type('form')
      .send({
        form:
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
        },
      })
      .set('Connection', 'keep-alive')
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded')
      .post('/sessions/new')
      .type('form')
      .send({
        form: {
          email: user.email,
          password: user.password,
        },
      })
      .set('user-agent', user.userAgent)
      .set('content-type', 'application/x-www-form-urlencoded');
  });

  it('Test Successfully Read Users List For Logged In User', async () => {
    const response = await superagent
      .get('/users')
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user.firstName)).toBeTruthy();
  });

  it('Test Failed Read Users List For Not Logged In User', async () => {
    const response = await superagent
      .get('/users')
      .set('user-agent', user.userAgent)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Test Successfully Read Own Profile For Logged In User', async () => {
    const response = await superagent
      .get(`/users/${user.id}/profile`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user.firstName)).toBeTruthy();
  });

  it('Test Edit Own User Profile', async () => {
    user.firstName = 'EditedFirstName';
    user.lastName = 'EditedLastName';
    await superagent
      .patch(`/users/${user.id}`)
      .type('form')
      .send({
        form:
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
        },
      })
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive')
      .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      .expect(302);
    const response = await superagent
      .get(`/users/${user.id}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user.firstName)).toBeTruthy();
  });

  it('Test Successfully Delete Own User Profile', async () => {
    const response = await superagent
      .delete(`/users/${user.id}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user.firstName)).toBeFalsy();
  });


  afterAll((done) => {
    server.close();
    userId = 0;
    done();
  });
});

/* describe('Tasks CRUD', () => {
  beforeAll(async () => {
    superagent = request.agent(server);
    userId += 1;
    taskId += 1;
    user = testUser(userId);
    task = testTask(taskId);
    await superagent
      .post('/users')
      .type('form')
      .send({
        form:
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
        },
      })
      .set('user-agent', user.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded');
  });


  it('Test Successfully Read Tasks List when User Logged In', async () => {
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('Task')).toBeTruthy();
  });

  it('Test Fail Read Tasks List when User Not Logged In', async () => {
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user.userAgent)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(302);
  });

  it('Test Successfully Create Task', async () => {
    await superagent
      .post('/tasks')
      .type('form')
      .send({
        form:
        {
          name: task.name,
          tags: 'xxx',
          description: task.description,
          assignedToId: user.id,
        },
      })
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/tasks/${task.id}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(task.name)).toBeTruthy();
  });

  it('Test Successfully Edit Task', async () => {
    task.name = 'New Task Name';
    await superagent
      .patch(`/tasks/${task.id}`)
      .type('form')
      .send({
        form:
          {
            name: task.name,
            tags: 'xxx',
            description: task.description,
            assignedToId: user.id,
            statusId: 1,
          },
        taskId: task.id,
      })
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/tasks/${task.id}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(task.name)).toBeTruthy();
  });

  it('Update task status - Success', async () => {
    await superagent
      .patch(`/tasks/${task.id}`)
      .type('form')
      .send({
        form:
          {
            name: task.name,
            tags: 'xxx',
            description: task.description,
            assignedToId: user.id,
            statusId: 3,
          },
        taskId: task.id,
      })
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/tasks/${task.id}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes('Testing')).toBeTruthy();
  });

  it('Reassign task - Success', async () => {
    const user2 = testUser(7);
    await superagent
      .patch(`/tasks/${task.id}`)
      .type('form')
      .send({
        form:
          {
            name: task.name,
            tags: 'xxx',
            description: task.description,
            assignedToId: user2.id,
            statusId: 1,
          },
        taskId: task.id,
      })
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get(`/tasks/${task.id}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(user2.firstName)).toBeTruthy();
  });

  it('Delete task - Success', async () => {
    await superagent
      .delete(`/tasks/${task.id}`)
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive')
      .expect(302);
    const response = await superagent
      .get('/tasks')
      .set('user-agent', user.userAgent)
      .set('x-test-auth-token', user.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(task.id)).toBeFalsy();
  });

  afterAll((done) => {
    server.close();
    userId = 0;
    taskId = 0;
    done();
  });
}); */


/* describe('Tasks Filtration', () => {
  const user1 = testUser(userId += 1);
  const user2 = testUser(userId += 2);
  const task1 = testTask(taskId += 1);
  const task2 = testTask(taskId += 2);
  const task3 = testTask(taskId += 3);

  beforeAll(async () => {
    superagent = request.agent(server);
    await superagent
      .post('/users')
      .type('form')
      .send({
        form:
        {
          email: user1.email,
          firstName: user1.firstName,
          lastName: user1.lastName,
          password: user1.password,
        },
      })
      .set('user-agent', user1.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .post('/users')
      .type('form')
      .send({
        form:
        {
          email: user2.email,
          firstName: user2.firstName,
          lastName: user2.lastName,
          password: user2.password,
        },
      })
      .set('user-agent', user2.userAgent)
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/x-www-form-urlencoded');
    await superagent
      .post('/tasks')
      .type('form')
      .send({
        form:
        {
          name: task1.name,
          tags: 'aaa bbb',
          description: task1.description,
          assignedToId: user2.id,
        },
      })
      .set('user-agent', user2.userAgent)
      .set('x-test-auth-token', user2.email)
      .set('Connection', 'keep-alive');
    await superagent
      .post('/tasks')
      .type('form')
      .send({
        form:
        {
          name: task2.name,
          tags: 'bbb ccc',
          description: task2.description,
          assignedToId: user2.id,
        },
      })
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    await superagent
      .post('/tasks')
      .type('form')
      .send({
        form:
        {
          name: task3.name,
          tags: 'ddd',
          description: task3.description,
          assignedToId: user2.id,
        },
      })
      .set('user-agent', user2.userAgent)
      .set('x-test-auth-token', user2.email)
      .set('Connection', 'keep-alive');
    await superagent
      .patch(`/tasks/${task3.id}`)
      .type('form')
      .send({
        form:
          {
            name: task2.name,
            tags: 'ddd',
            description: task2.description,
            assignedToId: user2.id,
            statusId: 3,
          },
        taskId: task2.id,
      })
      .set('user-agent', user2.userAgent)
      .set('x-test-auth-token', user2.email)
      .set('Connection', 'keep-alive');
  });

  it('Filter: "My Tasks"', async () => {
    const response = await superagent
      .get(`/tasks?creatorId=${user1.id}`)
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`${task1.id}`)).toBeTruthy();
    expect(response.text.includes(`${task2.id}`)).toBeTruthy();
    expect(response.text.includes(`${task3.id}`)).toBeFalsy();
  });

  it('Filter: "Assigned to me"', async () => {
    const response = await superagent
      .get(`/tasks?assignedToId=${user1.id}`)
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`${task1.id}`)).toBeTruthy();
    expect(response.text.includes(`${task2.id}`)).toBeFalsy();
    expect(response.text.includes(`${task3.id}`)).toBeFalsy();
  });

  it('Filter: by tag', async () => {
    const response = await superagent
      .get('/tasks?tagId=3&statusId=All+statuses&assignedToId=All+assignee')
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`00000${task1.id}`)).toBeTruthy();
    expect(response.text.includes(`00000${task2.id}`)).toBeTruthy();
    expect(response.text.includes(`00000${task3.id}`)).toBeFalsy();
  });

  it('Filter: by status', async () => {
    const response = await superagent
      .get('/tasks?tagId=All+tags&statusId=3&assignedToId=All+assignee')
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`00000${task1.id}`)).toBeFalsy();
    expect(response.text.includes(`00000${task2.id}`)).toBeFalsy();
    expect(response.text.includes(`00000${task3.id}`)).toBeTruthy();
  });

  it('Filter: by assignee', async () => {
    const response = await superagent
      .get(`/tasks?tagId=All+tags&statusId=All+statuses&assignedToId=${user2.id}`)
      .set('user-agent', user2.userAgent)
      .set('x-test-auth-token', user2.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`${task1.id}`)).toBeFalsy();
    expect(response.text.includes(`${task2.id}`)).toBeTruthy();
    expect(response.text.includes(`${task3.id}`)).toBeTruthy();
  });

  it('Filter contradictory', async () => {
    const response = await superagent
      .get(`/tasks?tagId=2&statusId=4&assignedToId=${user2.id}`)
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`${task1.id}`)).toBeFalsy();
    expect(response.text.includes(`${task2.id}`)).toBeFalsy();
    expect(response.text.includes(`${task3.id}`)).toBeFalsy();
  });

  it('Filter all', async () => {
    const response = await superagent
      .get('/tasks?tagId=All+tags&statusId=All+statuses&assignedToId=All+assignee')
      .set('user-agent', user1.userAgent)
      .set('x-test-auth-token', user1.email)
      .set('Connection', 'keep-alive');
    expect(response).toHaveHTTPStatus(200);
    expect(response.text.includes(`${task1.id}`)).toBeTruthy();
    expect(response.text.includes(`${task2.id}`)).toBeTruthy();
    expect(response.text.includes(`${task3.id}`)).toBeTruthy();
  });

  afterAll((done) => {
    server.close();
    done();
  });
}); */
